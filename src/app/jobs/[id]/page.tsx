import { getSession } from "@/lib/auth";
import { getJobDetails } from "@/app/actions/jobActions";
import { Header } from "@/components/Header";
import { JobDetailsClient } from "./JobDetailsClient";
import { notFound } from "next/navigation";

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;
  const session = await getSession();
  
  const res = await getJobDetails(id);

  if (res.error || !res.job) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Header */}
      <Header session={session} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-12">
        <JobDetailsClient
          job={res.job}
          isTrackingInitial={res.isTracking || false}
          isLoggedIn={!!session}
        />
      </main>
    </div>
  );
}
