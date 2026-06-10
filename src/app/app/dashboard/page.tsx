import { getSession } from "@/lib/auth";
import { getUserDashboardData } from "@/app/actions/userActions";
import { Header } from "@/components/Header";
import { JobCard } from "@/components/JobCard";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, Calendar, Bell, Plus, ChevronRight, Activity, Clock } from "lucide-react";
import db from "@/lib/db";

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
  userJobs.forEach((uj) => trackedJobIds.add(uj.jobId));

  const isLoggedIn = true;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Global Header */}
      <Header session={session} />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {session.name}!
            </h1>
            <p className="text-sm text-white/85 mt-1">
              Welcome back. Here is your application deadline tracker.
            </p>
          </div>
          <Link
            href="/app/jobs/add"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-blue-600 hover:bg-white/95 text-sm font-bold shadow-sm transition-all active:scale-98"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Custom Job
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <Link href="/app/jobs" className="p-4 rounded-2xl border border-border bg-card hover:bg-muted/30 transition-all flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-2">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-xl sm:text-2xl text-foreground">
              {res.trackedCount}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground uppercase font-semibold">
              Tracked Jobs
            </span>
          </Link>

          <Link href="/app/jobs" className="p-4 rounded-2xl border border-border bg-card hover:bg-muted/30 transition-all flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 mb-2">
              <Clock className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-xl sm:text-2xl text-foreground">
              {res.upcomingJobs?.length || 0}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground uppercase font-semibold">
              Deadlines Soon
            </span>
          </Link>

          <Link href="/app/notifications" className="p-4 rounded-2xl border border-border bg-card hover:bg-muted/30 transition-all flex flex-col items-center text-center relative">
            {res.unreadNotificationsCount > 0 && (
              <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            )}
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 mb-2">
              <Bell className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-xl sm:text-2xl text-foreground">
              {res.unreadNotificationsCount}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground uppercase font-semibold">
              Unread Alerts
            </span>
          </Link>
        </div>

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="py-12 text-center border border-dashed border-border bg-card rounded-2xl space-y-2">
                <Briefcase className="h-10 w-10 text-muted-foreground mx-auto stroke-1" />
                <h4 className="font-bold text-foreground text-sm">Not tracking any jobs yet</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Find jobs on the homepage or create a custom tracker to keep tabs on deadlines.
                </p>
                <div className="pt-2">
                  <Link href="/" className="inline-flex text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg">
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

            <div className="p-4 rounded-2xl border border-border bg-card space-y-3.5">
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
                        {new Date(notif.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
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
