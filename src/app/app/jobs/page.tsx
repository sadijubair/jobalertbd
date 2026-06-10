import { getSession } from "@/lib/auth";
import { getUserJobs } from "@/app/actions/userActions";
import { Header } from "@/components/Header";
import { JobCard } from "@/components/JobCard";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Briefcase } from "lucide-react";

export default async function MyJobsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "USER") {
    redirect("/api/auth/google");
  }

  const res = await getUserJobs();
  if ("error" in res) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header session={session} />
        <main className="flex-1 p-6 text-center text-rose-500">
          Error loading jobs: {res.error}
        </main>
      </div>
    );
  }

  const isLoggedIn = true;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Global Header */}
      <Header session={session} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-12">
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <p className="eyebrow mb-2">Saved desk</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              My Tracked Jobs
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Personal job trackers and global jobs you follow.
            </p>
          </div>
          <Link
            href="/app/jobs/add"
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 sm:text-sm"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Job
          </Link>
        </div>

        {res.jobs && res.jobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {res.jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isTrackingInitial={true} // In "My Jobs", it's always tracked
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        ) : (
          <div className="surface-panel space-y-4 rounded-lg border-dashed py-24 text-center">
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto stroke-1" />
            <div className="max-w-xs mx-auto space-y-1">
              <h3 className="font-extrabold text-lg text-foreground">No circulars tracked yet</h3>
              <p className="text-sm text-muted-foreground">
                Follow circulars on the homepage or create custom tracking circulars.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-2">
              <Link href="/" className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground transition-all hover:bg-muted">
                Browse Global
              </Link>
              <Link href="/app/jobs/add" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90">
                Create Custom Tracker
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
