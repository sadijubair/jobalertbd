"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Verify admin helper
async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized admin access");
  }
  return session;
}

export async function getWorkspaceStats() {
  try {
    await requireAdmin();

    const globalJobs = await db.job.count({ where: { isGlobal: true } });
    const users = await db.user.count();
    const subscribers = await db.newsletterSubscriber.count();
    const totalNotifications = await db.notification.count();
    const pendingReports = await db.report.count({ where: { status: "PENDING" } });

    // Count tracked relationships
    const totalTracked = await db.userJob.count();

    return {
      globalJobs,
      users,
      subscribers,
      totalNotifications,
      pendingReports,
      totalTracked,
    };
  } catch (error: any) {
    console.error("Workspace stats error:", error);
    return { error: error.message || "Failed to load stats" };
  }
}

export async function getWorkspaceJobs() {
  try {
    await requireAdmin();
    const jobs = await db.job.findMany({
      where: { isGlobal: true },
      include: { posts: true },
      orderBy: { createdAt: "desc" },
    });
    return { jobs };
  } catch (error: any) {
    return { jobs: [], error: error.message || "Failed to load jobs" };
  }
}

export async function createGlobalJob(data: {
  organization: string;
  applicationLink: string;
  circularLink: string;
  applicationFee: number;
  deadline: string;
  isFeatured: boolean;
  description: string;
  posts: { name: string; postsCount: number; grade: string }[];
}) {
  try {
    await requireAdmin();

    const job = await db.job.create({
      data: {
        organization: data.organization,
        applicationLink: data.applicationLink || "",
        circularLink: data.circularLink || "",
        applicationFee: Number(data.applicationFee) || 0,
        deadline: new Date(data.deadline),
        isFeatured: data.isFeatured || false,
        description: data.description || "",
        isGlobal: true,
        posts: {
          create: data.posts.map((post) => ({
            name: post.name,
            postsCount: Number(post.postsCount) || 1,
            grade: post.grade || "10",
          })),
        },
      },
    });

    // Notify users about a new job published if they opted-in
    const prefUsers = await db.notificationPreference.findMany({
      where: { newJobsEnabled: true },
      select: { userId: true },
    });

    if (prefUsers.length > 0) {
      await db.notification.createMany({
        data: prefUsers.map((pref) => ({
          userId: pref.userId,
          title: "New Job Published",
          content: `${data.organization} has published a new circular. Track it now!`,
          type: "NEW_JOB",
        })),
      });
    }

    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/workspace/jobs");
    
    return { success: true, jobId: job.id };
  } catch (error: any) {
    console.error("Create global job error:", error);
    return { error: error.message || "Failed to create job" };
  }
}

export async function updateGlobalJob(
  id: string,
  data: {
    organization: string;
    applicationLink: string;
    circularLink: string;
    applicationFee: number;
    deadline: string;
    isFeatured: boolean;
    description: string;
    posts: { name: string; postsCount: number; grade: string }[];
  }
) {
  try {
    await requireAdmin();

    // Delete existing posts first
    await db.jobPost.deleteMany({ where: { jobId: id } });

    await db.job.update({
      where: { id },
      data: {
        organization: data.organization,
        applicationLink: data.applicationLink || "",
        circularLink: data.circularLink || "",
        applicationFee: Number(data.applicationFee) || 0,
        deadline: new Date(data.deadline),
        isFeatured: data.isFeatured || false,
        description: data.description || "",
        posts: {
          create: data.posts.map((post) => ({
            name: post.name,
            postsCount: Number(post.postsCount) || 1,
            grade: post.grade || "10",
          })),
        },
      },
    });

    revalidatePath("/");
    revalidatePath(`/jobs/${id}`);
    revalidatePath("/workspace/jobs");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update job" };
  }
}

export async function deleteGlobalJob(id: string) {
  try {
    await requireAdmin();
    await db.job.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/workspace/jobs");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete job" };
  }
}

export async function toggleFeatureJob(id: string) {
  try {
    await requireAdmin();
    const job = await db.job.findUnique({ where: { id } });
    if (!job) return { error: "Job not found" };

    await db.job.update({
      where: { id },
      data: { isFeatured: !job.isFeatured },
    });

    revalidatePath("/");
    revalidatePath("/workspace/jobs");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to feature job" };
  }
}

export async function getCommunityDiscoveries() {
  try {
    await requireAdmin();
    // Fetch user-created jobs that are not global
    const jobs = await db.job.findMany({
      where: { isGlobal: false },
      include: {
        posts: true,
        userJobs: true,
      },
      orderBy: {
        trackedCount: "desc",
      },
    });
    return { jobs };
  } catch (error: any) {
    return { jobs: [], error: error.message || "Failed to fetch discoveries" };
  }
}

export async function publishCommunityJobGlobally(jobId: string) {
  try {
    await requireAdmin();
    await db.job.update({
      where: { id: jobId },
      data: { isGlobal: true },
    });

    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/workspace/community");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to publish job globally" };
  }
}

export async function getReports() {
  try {
    await requireAdmin();
    const reports = await db.report.findMany({
      include: {
        job: true,
        reporter: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { reports };
  } catch (error: any) {
    return { reports: [], error: error.message || "Failed to load reports" };
  }
}

export async function resolveReport(id: string) {
  try {
    await requireAdmin();
    await db.report.update({
      where: { id },
      data: { status: "RESOLVED" },
    });
    revalidatePath("/workspace/reports");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to resolve report" };
  }
}

export async function getWorkspaceSubscribers() {
  try {
    await requireAdmin();
    const subscribers = await db.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { subscribers };
  } catch (error: any) {
    return { subscribers: [], error: error.message || "Failed to load subscribers" };
  }
}

export async function sendNewsletter(data: { subject: string; body: string; type: string }) {
  try {
    await requireAdmin();
    // Simulate sending email to subscribers (will write to system settings/logs in actual push notifications, or mock send for now)
    const subscribers = await db.newsletterSubscriber.findMany({
      where: data.type === "ALL" ? {} : { type: data.type },
    });

    console.log(`Sending newsletter: "${data.subject}" to ${subscribers.length} subscribers.`);
    
    // Save standard system setting for newsletter delivery history
    await db.systemSettings.create({
      data: {
        key: `NEWSLETTER_LOG_${Date.now()}`,
        value: JSON.stringify({
          subject: data.subject,
          subscribersCount: subscribers.length,
          type: data.type,
          sentAt: new Date(),
        }),
      },
    });

    return { success: true, count: subscribers.length };
  } catch (error: any) {
    return { error: error.message || "Failed to send newsletter" };
  }
}

export async function sendBroadcastNotification(data: { title: string; content: string }) {
  try {
    await requireAdmin();
    
    // 1. Send in-app to ALL users (userId = null for global announcement)
    await db.notification.create({
      data: {
        userId: null,
        title: data.title,
        content: data.content,
        type: "ANNOUNCEMENT",
      },
    });

    // 2. We can also simulate push/email broadcasts.
    console.log(`Broadcasting announcement: "${data.title}"`);

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to send broadcast" };
  }
}

export async function getWorkspaceUsers() {
  try {
    await requireAdmin();
    const users = await db.user.findMany({
      include: {
        userJobs: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { users };
  } catch (error: any) {
    return { users: [], error: error.message || "Failed to load users" };
  }
}

export async function toggleUserStatus(userId: string, newStatus: string) {
  try {
    await requireAdmin();
    await db.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });
    revalidatePath("/workspace/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update user status" };
  }
}
