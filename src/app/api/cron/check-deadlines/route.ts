import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import webpush from "web-push";
import { formatDateDMY } from "@/lib/format";
import { sendEmail } from "@/lib/email";

// Configure Web Push VAPID keys if present
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  privateKey: process.env.VAPID_PRIVATE_KEY || "",
};

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    "mailto:admin@jobalert.bd",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

// Helper: Send email alert
async function sendEmailAlert(email: string, title: string, content: string) {
  try {
    const result = await sendEmail({
      to: email,
      subject: title,
      text: content,
    });
    if (result.accepted > 0) {
      console.log(`Email alert sent successfully to ${email}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Nodemailer error:", error);
    return false;
  }
}

// Helper: Send push alert
async function sendPushAlert(subscription: any, title: string, content: string) {
  if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
    console.log(`[Push Mock] Endpoint: ${subscription.endpoint} | Msg: ${title} - ${content}`);
    return;
  }

  try {
    const pushSub = {
      endpoint: subscription.endpoint,
      keys: {
        auth: subscription.keysAuth,
        p256dh: subscription.keysP256dh,
      },
    };

    await webpush.sendNotification(pushSub, JSON.stringify({ title, content }));
    console.log(`Push notification sent successfully to ${subscription.endpoint}`);
  } catch (error) {
    console.error("WebPush error:", error);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Optional secret token check to prevent abuse on public URL
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && secret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Fetch all user jobs tracked relationships
    const userJobs = await db.userJob.findMany({
      include: {
        job: true,
        user: {
          include: {
            preferences: true,
            pushSubscriptions: true,
          },
        },
      },
    });

    let notificationsCreated = 0;

    for (const uj of userJobs) {
      const { user, job } = uj;
      
      // Skip if preferences are not loaded or disabled
      const prefs = user.preferences || {
        newJobsEnabled: true,
        deadline15Days: true,
        deadline7Days: true,
        deadline3Days: true,
        deadlineToday: true,
        inAppEnabled: true,
        pushEnabled: true,
        emailEnabled: true,
      };

      const deadline = new Date(job.deadline);
      deadline.setHours(0, 0, 0, 0);

      // Diff calculation (Bangladesh Time / UTC+6 approximation)
      const diffTime = deadline.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Threshold check match
      let thresholdKey: "15_DAYS" | "7_DAYS" | "3_DAYS" | "TODAY" | null = null;
      let shouldAlert = false;

      if (diffDays === 15 && prefs.deadline15Days) {
        thresholdKey = "15_DAYS";
        shouldAlert = true;
      } else if (diffDays === 7 && prefs.deadline7Days) {
        thresholdKey = "7_DAYS";
        shouldAlert = true;
      } else if (diffDays === 3 && prefs.deadline3Days) {
        thresholdKey = "3_DAYS";
        shouldAlert = true;
      } else if (diffDays === 0 && prefs.deadlineToday) {
        thresholdKey = "TODAY";
        shouldAlert = true;
      }

      if (!shouldAlert || !thresholdKey) continue;

      // Check if we have already sent this warning to prevent duplicate runs
      const existingLog = await db.notificationLog.findFirst({
        where: {
          userId: user.id,
          jobId: job.id,
          type: thresholdKey,
        },
      });

      if (existingLog) continue; // Already processed!

      // Trigger dispatch alerts
      const title = `Deadline Alert: ${job.organization}`;
      let content = "";
      if (diffDays === 0) {
        content = `Today is the final day to apply for ${job.organization}! Make sure you submit your application now.`;
      } else {
        content = `Only ${diffDays} days left to apply for ${job.organization}. Deadline date: ${formatDateDMY(job.deadline)}.`;
      }

      // 1. In-App Notification
      if (prefs.inAppEnabled) {
        await db.notification.create({
          data: {
            userId: user.id,
            title,
            content,
            type: "REMINDER",
          },
        });
        
        await db.notificationLog.create({
          data: {
            userId: user.id,
            jobId: job.id,
            type: thresholdKey,
            channel: "IN_APP",
          },
        });
        
        notificationsCreated++;
      }

      // 2. Push Notifications
      if (prefs.pushEnabled && user.pushSubscriptions.length > 0) {
        for (const sub of user.pushSubscriptions) {
          await sendPushAlert(sub, title, content);
        }
        
        await db.notificationLog.create({
          data: {
            userId: user.id,
            jobId: job.id,
            type: thresholdKey,
            channel: "PUSH",
          },
        });
      }

      // 3. Email Notification
      if (prefs.emailEnabled && user.email) {
        const emailSent = await sendEmailAlert(user.email, title, content);
        
        if (emailSent) {
          await db.notificationLog.create({
            data: {
              userId: user.id,
              jobId: job.id,
              type: thresholdKey,
              channel: "EMAIL",
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: userJobs.length,
      notificationsDispatched: notificationsCreated,
    });
  } catch (error: any) {
    console.error("Deadline engine error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
