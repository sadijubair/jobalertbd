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

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 pb-24 md:pb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              My Tracked Jobs
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Personal job trackers and global jobs you follow.
            </p>
          </div>
          <Link
            href="/app/jobs/add"
            className="flex items-center gap-1 bg-primary text-primary-foreground font-bold text-xs sm:text-sm px-4 py-2 rounded-xl hover:bg-primary/95 transition-all shadow-sm active:scale-98"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Job
          </Link>
        </div>

        {res.jobs && res.jobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
          <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-card space-y-4">
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto stroke-1" />
            <div className="max-w-xs mx-auto space-y-1">
              <h3 className="font-extrabold text-lg text-foreground">No circulars tracked yet</h3>
              <p className="text-sm text-muted-foreground">
                Follow circulars on the homepage or create custom tracking circulars.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-2">
              <Link href="/" className="px-4 py-2.5 rounded-xl border border-border bg-card font-bold text-sm text-foreground hover:bg-muted transition-all">
                Browse Global
              </Link>
              <Link href="/app/jobs/add" className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/95 transition-all shadow-sm">
                Create Custom Tracker
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
