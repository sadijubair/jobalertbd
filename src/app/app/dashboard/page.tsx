import { getSession } from "@/lib/auth";
import { getUserDashboardData } from "@/app/actions/userActions";
import { Header } from "@/components/Header";
import { JobCard } from "@/components/JobCard";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, Calendar, Bell, Plus, ChevronRight, Activity, Clock } from "lucide-react";
import db from "@/lib/db";
import { formatDateTimeDMY } from "@/lib/format";

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session || session.role !== "USER") {
    redirect("/api/auth/google");
  }

  const res = await getUserDashboardData();
  if ("error" in res) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header session={session} />
        <main className="flex-1 p-6 text-center text-rose-500">
          Error loading dashboard: {res.error}
        </main>
      </div>
    );
  }

  // Fetch all user's followed job IDs for initial states
  const trackedJobIds = new Set<string>();
  const userJobs = await db.userJob.findMany({
    where: { userId: session.userId },
    select: { jobId: true },
  });
  userJobs.forEach((uj: { jobId: string }) => trackedJobIds.add(uj.jobId));

  const isLoggedIn = true;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Global Header */}
      <Header session={session} />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 pb-24 sm:px-6 md:pb-12">
        
        {/* Welcome Header */}
        <div className="surface-panel flex flex-col items-start justify-between gap-4 rounded-lg p-5 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow mb-2">Personal tracker</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Hello, {session.name}!
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back. Here is your application deadline tracker.
            </p>
          </div>
          <Link
            href="/app/jobs/add"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Custom Job
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Link href="/app/jobs" className="surface-panel flex flex-col items-center rounded-lg p-4 text-center transition-all hover:border-primary/35">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold text-foreground sm:text-2xl">
              {res.trackedCount}
            </span>
            <span className="text-[10px] font-semibold uppercase text-muted-foreground sm:text-xs">
              Tracked Jobs
            </span>
          </Link>

          <Link href="/app/jobs" className="surface-panel flex flex-col items-center rounded-lg p-4 text-center transition-all hover:border-primary/35">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold text-foreground sm:text-2xl">
              {res.upcomingJobs?.length || 0}
            </span>
            <span className="text-[10px] font-semibold uppercase text-muted-foreground sm:text-xs">
              Deadlines Soon
            </span>
          </Link>

          <Link href="/app/notifications" className="surface-panel relative flex flex-col items-center rounded-lg p-4 text-center transition-all hover:border-primary/35">
            {res.unreadNotificationsCount > 0 && (
              <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            )}
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
              <Bell className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold text-foreground sm:text-2xl">
              {res.unreadNotificationsCount}
            </span>
            <span className="text-[10px] font-semibold uppercase text-muted-foreground sm:text-xs">
              Unread Alerts
            </span>
          </Link>
        </div>

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          
          {/* Upcoming Deadlines Column (Left) */}
          <div className="md:col-span-3 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="flex items-center gap-1.5 font-extrabold text-lg text-foreground">
                <Calendar className="h-4.5 w-4.5 text-primary" />
                Tracked Deadlines
              </h2>
              <Link href="/app/jobs" className="text-xs font-semibold text-primary flex items-center hover:underline">
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {res.upcomingJobs && res.upcomingJobs.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {res.upcomingJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isTrackingInitial={trackedJobIds.has(job.id)}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            ) : (
              <div className="surface-panel space-y-2 rounded-lg border-dashed py-12 text-center">
                <Briefcase className="h-10 w-10 text-muted-foreground mx-auto stroke-1" />
                <h4 className="font-bold text-foreground text-sm">Not tracking any jobs yet</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Find jobs on the homepage or create a custom tracker to keep tabs on deadlines.
                </p>
                <div className="pt-2">
                  <Link href="/" className="inline-flex rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                    Discover Jobs
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Recent Alerts Column (Right) */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="flex items-center gap-1.5 font-extrabold text-lg text-foreground">
                <Activity className="h-4.5 w-4.5 text-primary" />
                Recent Alerts
              </h2>
              <Link href="/app/notifications" className="text-xs font-semibold text-primary flex items-center hover:underline">
                Alert Center <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="surface-panel space-y-3.5 rounded-lg p-4">
              {res.recentNotifications && res.recentNotifications.length > 0 ? (
                res.recentNotifications.map((notif) => (
                  <div key={notif.id} className="flex gap-3 items-start text-xs border-b border-border/40 pb-3 last:border-0 last:pb-0">
                    <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                      notif.isRead ? "bg-muted text-muted-foreground" : "bg-blue-500/10 text-blue-600"
                    }`}>
                      <Bell className="h-3 w-3" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className={`font-bold ${notif.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                        {notif.title}
                      </h4>
                      <p className="text-muted-foreground line-clamp-2">{notif.content}</p>
                      <span className="text-[9px] text-muted-foreground block font-medium">
                        {formatDateTimeDMY(notif.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No recent alert logs.
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
