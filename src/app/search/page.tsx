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
    userJobs.forEach((uj) => trackedJobIds.push(uj.jobId));
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Header */}
      <Header session={session} />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 pb-24 md:pb-12">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
          Discover Circulars
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Find and track deadlines of any active job circular published by Workspace Admins.
        </p>

        <SearchClient
          initialJobs={res.jobs}
          isLoggedIn={!!session}
          trackedJobIds={trackedJobIds}
        />
      </main>
    </div>
  );
}
