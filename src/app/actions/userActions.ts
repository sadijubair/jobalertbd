"use server";

import { db } from "@/lib/db";
import { getSession, clearSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

type UserJobWithJob = Prisma.UserJobGetPayload<{
  include: {
    job: {
      include: { posts: true };
    };
  };
}>;

// Verify session helper
async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized access");
  }
  const user = await db.user.findUnique({
    where: { id: session.userId },
  });
  if (!user) {
    await clearSession();
    throw new Error("Unauthorized session: user not found");
  }
  return session;
}

export async function getUserDashboardData() {
  try {
    const session = await requireAuth();
    const now = new Date();

    // 1. Total Tracked Jobs
    const trackedCount = await db.userJob.count({
      where: { userId: session.userId },
    });

    // 2. Upcoming Deadlines (jobs followed by user where deadline >= now)
    const upcomingJobs = await db.userJob.findMany({
      where: {
        userId: session.userId,
        job: { deadline: { gte: now } },
      },
      include: {
        job: {
          include: { posts: true },
        },
      },
      orderBy: {
        job: { deadline: "asc" },
      },
      take: 5,
    });

    // 3. Unread Notifications Count
    const unreadNotificationsCount = await db.notification.count({
      where: { userId: session.userId, isRead: false },
    });

    // 4. Recent Notifications
    const recentNotifications = await db.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    return {
      trackedCount,
      upcomingJobs: upcomingJobs.map((uj: UserJobWithJob) => uj.job),
      unreadNotificationsCount,
      recentNotifications,
    };
  } catch (error: any) {
    console.error("Dashboard data error:", error);
    return { error: error.message || "Failed to load dashboard data" };
  }
}

export async function getUserJobs() {
  try {
    const session = await requireAuth();
    
    const userJobs = await db.userJob.findMany({
      where: { userId: session.userId },
      include: {
        job: {
          include: { posts: true },
        },
      },
      orderBy: {
        job: { deadline: "asc" },
      },
    });

    return { jobs: userJobs.map((uj: UserJobWithJob) => uj.job) };
  } catch (error: any) {
    console.error("Error fetching user jobs:", error);
    return { jobs: [], error: error.message || "Failed to load tracked jobs" };
  }
}

export async function createUserPersonalJob(data: {
  organization: string;
  applicationLink: string;
  circularLink: string;
  applicationFee: number;
  deadline: string;
  description: string;
  posts: { name: string; postsCount: number; grade: string }[];
}) {
  try {
    const session = await requireAuth();

    // Create job with isGlobal = false
    const job = await db.job.create({
      data: {
        organization: data.organization,
        applicationLink: data.applicationLink || "",
        circularLink: data.circularLink || "",
        applicationFee: Number(data.applicationFee) || 0,
        deadline: new Date(data.deadline),
        description: data.description || "",
        isGlobal: false,
        createdById: session.userId,
        trackedCount: 1, // Created by user, so tracked by 1 user initially
        posts: {
          create: data.posts.map((post) => ({
            name: post.name,
            postsCount: Number(post.postsCount) || 1,
            grade: post.grade || "10",
          })),
        },
        userJobs: {
          create: {
            userId: session.userId,
          },
        },
      },
    });

    revalidatePath("/app/jobs");
    revalidatePath("/app/dashboard");
    
    return { success: true, jobId: job.id };
  } catch (error: any) {
    console.error("Create personal job error:", error);
    return { error: error.message || "Failed to create job" };
  }
}

export async function getUserNotifications() {
  try {
    const session = await requireAuth();

    const notifications = await db.notification.findMany({
      where: {
        OR: [
          { userId: session.userId },
          { userId: null }, // Announcements
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return { notifications };
  } catch (error: any) {
    console.error("Error loading notifications:", error);
    return { notifications: [], error: error.message || "Failed to load notifications" };
  }
}

export async function markNotificationRead(id: string) {
  try {
    await requireAuth();
    await db.notification.update({
      where: { id },
      data: { isRead: true },
    });
    revalidatePath("/app/notifications");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to mark read" };
  }
}

export async function markAllNotificationsRead() {
  try {
    const session = await requireAuth();
    await db.notification.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true },
    });
    revalidatePath("/app/notifications");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to mark all read" };
  }
}

export async function clearAllNotifications() {
  try {
    const session = await requireAuth();
    await db.notification.deleteMany({
      where: { userId: session.userId },
    });
    revalidatePath("/app/notifications");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to clear notifications" };
  }
}

export async function getUserSettings() {
  try {
    const session = await requireAuth();
    
    let preferences = await db.notificationPreference.findUnique({
      where: { userId: session.userId },
    });

    if (!preferences) {
      preferences = await db.notificationPreference.create({
        data: {
          userId: session.userId,
          newJobsEnabled: true,
          deadline15Days: true,
          deadline7Days: true,
          deadline3Days: true,
          deadlineToday: true,
          inAppEnabled: true,
          pushEnabled: true,
          emailEnabled: true,
        },
      });
    }

    return { preferences };
  } catch (error: any) {
    return { error: error.message || "Failed to load preferences" };
  }
}

export async function updateUserSettings(data: {
  newJobsEnabled: boolean;
  deadline15Days: boolean;
  deadline7Days: boolean;
  deadline3Days: boolean;
  deadlineToday: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
}) {
  try {
    const session = await requireAuth();

    await db.notificationPreference.update({
      where: { userId: session.userId },
      data,
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update preferences" };
  }
}

export async function savePushSubscriptionAction(sub: {
  endpoint: string;
  keys: { auth: string; p256dh: string };
}) {
  try {
    const session = await requireAuth();

    const existing = await db.pushSubscription.findUnique({
      where: { endpoint: sub.endpoint },
    });

    if (!existing) {
      await db.pushSubscription.create({
        data: {
          userId: session.userId,
          endpoint: sub.endpoint,
          keysAuth: sub.keys.auth,
          keysP256dh: sub.keys.p256dh,
        },
      });
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to save push subscription" };
  }
}
