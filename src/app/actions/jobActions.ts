"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getPublicJobs(searchQuery = "", filter = "all") {
  try {
    const now = new Date();

    // Base query conditions (only global active jobs on public page)
    const baseWhere: any = {
      isGlobal: true,
    };

    // Apply search query
    if (searchQuery) {
      baseWhere.OR = [
        { organization: { contains: searchQuery } },
        { posts: { some: { name: { contains: searchQuery } } } }
      ];
    }

    // Apply filters
    const filterDateLimit = new Date();
    if (filter === "today") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      baseWhere.deadline = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (filter === "3days") {
      filterDateLimit.setDate(now.getDate() + 3);
      baseWhere.deadline = {
        gte: now,
        lte: filterDateLimit,
      };
    } else if (filter === "7days") {
      filterDateLimit.setDate(now.getDate() + 7);
      baseWhere.deadline = {
        gte: now,
        lte: filterDateLimit,
      };
    } else if (filter === "15days") {
      filterDateLimit.setDate(now.getDate() + 15);
      baseWhere.deadline = {
        gte: now,
        lte: filterDateLimit,
      };
    } else if (filter === "featured") {
      baseWhere.isFeatured = true;
    } else if (filter === "expired") {
      baseWhere.deadline = {
        lt: now,
      };
    }

    let orderBy: any = { createdAt: "desc" };
    if (filter === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (filter === "most_saved") {
      orderBy = { trackedCount: "desc" };
    }

    const jobs = await db.job.findMany({
      where: baseWhere,
      include: {
        posts: true,
      },
      orderBy,
    });

    return { jobs };
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return { jobs: [], error: "Failed to fetch jobs" };
  }
}

export async function getHomepageSections() {
  try {
    const now = new Date();
    
    // 1. Featured Jobs
    const featured = await db.job.findMany({
      where: { isGlobal: true, isFeatured: true, deadline: { gte: now } },
      include: { posts: true },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // 2. Latest Jobs
    const latest = await db.job.findMany({
      where: { isGlobal: true, deadline: { gte: now } },
      include: { posts: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    // 3. Deadline Soon Jobs
    const deadlineSoon = await db.job.findMany({
      where: { isGlobal: true, deadline: { gte: now } },
      include: { posts: true },
      take: 10,
      orderBy: { deadline: "asc" },
    });

    // 4. Popular Jobs
    const popular = await db.job.findMany({
      where: { isGlobal: true, deadline: { gte: now } },
      include: { posts: true },
      take: 10,
      orderBy: { trackedCount: "desc" },
    });

    return { featured, latest, deadlineSoon, popular };
  } catch (error) {
    console.error("Error fetching homepage sections:", error);
    return { featured: [], latest: [], deadlineSoon: [], popular: [] };
  }
}

export async function getJobDetails(id: string) {
  try {
    const job = await db.job.findUnique({
      where: { id },
      include: {
        posts: true,
      },
    });
    
    if (!job) return { error: "Job not found" };

    const session = await getSession();
    let isTracking = false;

    if (session) {
      const userJob = await db.userJob.findUnique({
        where: {
          userId_jobId: {
            userId: session.userId,
            jobId: id,
          },
        },
      });
      isTracking = !!userJob;
    }

    return { job, isTracking };
  } catch (error) {
    console.error("Error fetching job details:", error);
    return { error: "Failed to load job details" };
  }
}

export async function toggleTrackJob(jobId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "You must be logged in to track jobs" };
    }

    const userId = session.userId;

    const existing = await db.userJob.findUnique({
      where: {
        userId_jobId: { userId, jobId },
      },
    });

    if (existing) {
      // Unfollow
      await db.userJob.delete({
        where: { id: existing.id },
      });
      
      // Decrement count
      await db.job.update({
        where: { id: jobId },
        data: { trackedCount: { decrement: 1 } },
      });
      
      revalidatePath(`/jobs/${jobId}`);
      revalidatePath("/app/jobs");
      return { success: true, tracking: false };
    } else {
      // Follow
      await db.userJob.create({
        data: { userId, jobId },
      });
      
      // Increment count
      await db.job.update({
        where: { id: jobId },
        data: { trackedCount: { increment: 1 } },
      });

      // Create notification log or in-app notification for success
      await db.notification.create({
        data: {
          userId,
          title: "Job Tracked Successfully",
          content: `You are now tracking deadline alerts for this job circular.`,
          type: "SYSTEM",
        },
      });

      revalidatePath(`/jobs/${jobId}`);
      revalidatePath("/app/jobs");
      return { success: true, tracking: true };
    }
  } catch (error) {
    console.error("Error toggling job track status:", error);
    return { error: "Failed to track/untrack job" };
  }
}

export async function subscribeNewsletter(email: string, type: string) {
  try {
    const sanitizedEmail = email.trim().toLowerCase();
    if (!sanitizedEmail) return { error: "Email is required" };

    const existing = await db.newsletterSubscriber.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existing) {
      // Update preferred type
      await db.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { type },
      });
    } else {
      await db.newsletterSubscriber.create({
        data: { email: sanitizedEmail, type },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return { error: "Failed to subscribe" };
  }
}

export async function createReport(jobId: string, type: string, description: string) {
  try {
    const session = await getSession();
    
    await db.report.create({
      data: {
        jobId,
        reporterId: session?.userId || null,
        type,
        description,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating report:", error);
    return { error: "Failed to submit report" };
  }
}
