import { getSession } from "@/lib/auth";
import { getHomepageSections } from "@/app/actions/jobActions";
import { Header } from "@/components/Header";
import { JobCard } from "@/components/JobCard";
import { NewsletterForm } from "@/components/NewsletterForm";
import Link from "next/link";
import {
  BellRing,
  ChevronRight,
  Clock,
  Search,
  Sparkles,
} from "lucide-react";
import db from "@/lib/db";
import type { ComponentType } from "react";

function SectionHeader({
  title,
  href,
  icon: Icon,
  tone,
}: {
  title: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground sm:text-xl">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-4.5 w-4.5" />
        </span>
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          View all <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const session = await getSession();
  const { featured, latest, deadlineSoon, popular } = await getHomepageSections();

  const trackedJobIds = new Set<string>();
  if (session) {
    const userJobs = await db.userJob.findMany({
      where: { userId: session.userId },
      select: { jobId: true },
    });
    userJobs.forEach((uj) => trackedJobIds.add(uj.jobId));
  }

  const isLoggedIn = !!session;
  const totalVisible =
    featured.length + latest.length + deadlineSoon.length + popular.length;

  return (
    <div className="flex min-h-screen flex-col">
      <Header session={session} />

      <section className="border-b border-border/80 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <BellRing className="h-3.5 w-3.5" />
              Track deadlines across public and personal circulars
            </div>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              JobAlert BD
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              A practical deadline desk for Bangladeshi job circulars, alerts,
              application links, and saved trackers.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/search"
                className="surface-panel flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground sm:min-h-12 sm:py-0 lg:max-w-xl"
              >
                <Search className="h-5 w-5 shrink-0 text-primary" />
                <span className="truncate">Search organization or post name...</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              ["Visible", totalVisible],
              ["Urgent", deadlineSoon.length],
              ["Saved", trackedJobIds.size],
            ].map(([label, value]) => (
              <div key={label} className="surface-panel rounded-lg p-4">
                <div className="text-2xl font-black text-foreground">{value}</div>
                <div className="mt-1 text-xs font-semibold uppercase text-muted-foreground">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 pb-24 sm:px-6 md:pb-12">
        {featured.length > 0 && (
          <section>
            <SectionHeader
              title="Featured circulars"
              icon={Sparkles}
              tone="bg-amber-500/10 text-amber-700 dark:text-amber-400"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isTrackingInitial={trackedJobIds.has(job.id)}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          </section>
        )}

        {deadlineSoon.length > 0 && (
          <section>
            <SectionHeader
              title="Deadline soon"
              href="/search?filter=3days"
              icon={Clock}
              tone="bg-rose-500/10 text-rose-600"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {deadlineSoon.slice(0, 6).map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isTrackingInitial={trackedJobIds.has(job.id)}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          </section>
        )}

        {latest.length > 0 && (
          <section>
            <SectionHeader
              title="Latest circulars"
              href="/search?filter=newest"
              icon={Sparkles}
              tone="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latest.slice(0, 6).map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isTrackingInitial={trackedJobIds.has(job.id)}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          </section>
        )}

        <NewsletterForm />
      </main>
    </div>
  );
}
