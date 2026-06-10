import { getSession } from "@/lib/auth";
import { getPublicJobs } from "@/app/actions/jobActions";
import { Header } from "@/components/Header";
import { SearchClient } from "./SearchClient";
import db from "@/lib/db";

export default async function SearchPage() {
  const session = await getSession();
  const res = await getPublicJobs("", "all");

  const trackedJobIds: string[] = [];
  if (session) {
    const userJobs = await db.userJob.findMany({
      where: { userId: session.userId },
      select: { jobId: true },
    });
    userJobs.forEach((uj: { jobId: string }) => trackedJobIds.push(uj.jobId));
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Header */}
      <Header session={session} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-12">
        <div className="mb-6 border-b border-border/80 pb-5">
          <p className="eyebrow mb-2">Circular search</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Discover Circulars
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Find active job circulars, filter by urgency, and save the deadlines
            you need to track.
          </p>
        </div>

        <SearchClient
          initialJobs={res.jobs}
          isLoggedIn={!!session}
          trackedJobIds={trackedJobIds}
        />
      </main>
    </div>
  );
}
