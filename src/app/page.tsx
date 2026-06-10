import { getSession } from "@/lib/auth";
import { getHomepageSections } from "@/app/actions/jobActions";
import { Header } from "@/components/Header";
import { JobCard } from "@/components/JobCard";
import { NewsletterForm } from "@/components/NewsletterForm";
import Link from "next/link";
import { Search, BellRing, Flame, Sparkles, Clock, ChevronRight } from "lucide-react";
import db from "@/lib/db";

export default async function HomePage() {
  const session = await getSession();
  const { featured, latest, deadlineSoon, popular } = await getHomepageSections();

  // Fetch tracked job IDs for this logged-in user to set initial bell state
  const trackedJobIds = new Set<string>();
  if (session) {
    const userJobs = await db.userJob.findMany({
      where: { userId: session.userId },
      select: { jobId: true },
    });
    userJobs.forEach((uj) => trackedJobIds.add(uj.jobId));
  }

  const isLoggedIn = !!session;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Header */}
      <Header session={session} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-600/10 via-background to-background py-12 px-4 sm:px-6">
        {/* Decorative background blurs */}
        <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute top-[30%] right-[-10%] h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />

        <div className="mx-auto max-w-4xl text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 animate-fade-in">
            <BellRing className="h-3.5 w-3.5" />
            Track Deadlines, Never Miss a Job
          </span>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Track Bangladeshi Job Circulars
            <span className="block mt-1 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              With Smart Deadline Alerts
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Create personal job trackers or follow global circulars. Get notified via In-App, Push Notifications, and Email before deadlines expire.
          </p>

          {/* Search Trigger Input */}
          <div className="max-w-md mx-auto relative group">
            <Link href="/search">
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all text-muted-foreground select-none cursor-pointer">
                <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm">Search organization or post name...</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Sections */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-12">
        
        {/* 1. Featured Jobs (Horizontal Carousel on Mobile, Grid on Desktop) */}
        {featured.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="flex items-center gap-1.5 font-extrabold text-xl sm:text-2xl text-foreground">
                <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" />
                Featured circulars
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {featured.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isTrackingInitial={trackedJobIds.has(job.id)}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          </div>
        )}

        {/* 2. Deadline Soon */}
        {deadlineSoon.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="flex items-center gap-1.5 font-extrabold text-xl sm:text-2xl text-foreground">
                <Clock className="h-5 w-5 text-rose-500" />
                Deadline Soon
              </h2>
              <Link href="/search?filter=3days" className="text-xs font-semibold text-primary flex items-center hover:underline">
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {deadlineSoon.slice(0, 6).map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isTrackingInitial={trackedJobIds.has(job.id)}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          </div>
        )}

        {/* 3. Latest Circulars */}
        {latest.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="flex items-center gap-1.5 font-extrabold text-xl sm:text-2xl text-foreground">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Latest Circulars
              </h2>
              <Link href="/search?filter=newest" className="text-xs font-semibold text-primary flex items-center hover:underline">
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {latest.slice(0, 6).map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isTrackingInitial={trackedJobIds.has(job.id)}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          </div>
        )}

        {/* 4. Popular Tracked Jobs */}
        {popular.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="flex items-center gap-1.5 font-extrabold text-xl sm:text-2xl text-foreground">
                <Flame className="h-5 w-5 text-orange-500 fill-orange-500" />
                Most Tracked Jobs
              </h2>
              <Link href="/search?filter=most_saved" className="text-xs font-semibold text-primary flex items-center hover:underline">
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {popular.slice(0, 6).map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isTrackingInitial={trackedJobIds.has(job.id)}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          </div>
        )}

        {/* Newsletter Section */}
        <section className="pt-4">
          <NewsletterForm />
        </section>

      </div>
    </div>
  );
}
