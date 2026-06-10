/**
 * Shared model types derived from the Prisma schema.
 * Used to provide explicit types where Prisma inference doesn't flow through.
 */

export type JobPost = {
  id: string;
  name: string;
  postsCount: number;
  grade: string;
};

export type Job = {
  id: string;
  organization: string;
  applicationLink: string;
  circularLink: string;
  applicationFee: number;
  deadline: Date;
  description?: string | null;
  isFeatured: boolean;
  isGlobal: boolean;
  isExpired: boolean;
  trackedCount: number;
  createdAt: Date;
  updatedAt: Date;
  posts?: JobPost[];
};

export type Notification = {
  id: string;
  userId?: string | null;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
};

export type NotificationPreference = {
  id: string;
  userId: string;
  newJobsEnabled: boolean;
  deadline15Days: boolean;
  deadline7Days: boolean;
  deadline3Days: boolean;
  deadlineToday: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  type: string;
  createdAt: Date;
};

export type Report = {
  id: string;
  jobId: string;
  job: Job;
  reporterId?: string | null;
  reporter?: { id: string; name?: string | null; email: string } | null;
  type: string;
  description: string;
  status: string;
  createdAt: Date;
};

export type User = {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userJobs?: { jobId: string }[];
};
