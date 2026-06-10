"use client";

import Link from "next/link";
import { Calendar, Briefcase, DollarSign, Bell } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { toggleTrackJob } from "@/app/actions/jobActions";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface JobCardProps {
  job: {
    id: string;
    organization: string;
    deadline: Date | string;
    applicationFee: number;
    isFeatured: boolean;
    posts?: { id: string; name: string; postsCount: number }[];
  };
  isTrackingInitial?: boolean;
  isLoggedIn: boolean;
}

export function JobCard({ job, isTrackingInitial = false, isLoggedIn }: JobCardProps) {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isTracking, setIsTracking] = useState(isTrackingInitial);

  // Calculate Days Left
  const deadlineDate = new Date(job.deadline);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(deadlineDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let deadlineTag = "";
  let badgeColor = "bg-muted text-muted-foreground";

  if (diffDays < 0) {
    deadlineTag = t("expired");
    badgeColor = "bg-rose-500/10 text-rose-500 dark:bg-rose-500/20";
  } else if (diffDays === 0) {
    deadlineTag = t("today");
    badgeColor = "bg-red-500 text-white font-bold animate-pulse";
  } else if (diffDays === 1) {
    deadlineTag = locale === "bn" ? `আগামীকাল` : `Tomorrow`;
    badgeColor = "bg-orange-500/15 text-orange-600 dark:text-orange-400";
  } else if (diffDays <= 3) {
    deadlineTag = locale === "bn" ? `${diffDays} দিন বাকি` : `${diffDays} Days Left`;
    badgeColor = "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  } else {
    deadlineTag = locale === "bn" ? `${diffDays} দিন বাকি` : `${diffDays} Days Left`;
    badgeColor = "bg-blue-500/10 text-blue-600 dark:text-blue-400";
  }

  const postsSummary = job.posts && job.posts.length > 0
    ? job.posts.map(p => p.name).join(", ")
    : t("posts");

  const totalVacancy = job.posts
    ? job.posts.reduce((sum, p) => sum + p.postsCount, 0)
    : 0;

  const handleTrackClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push("/api/auth/google");
      return;
    }

    startTransition(async () => {
      const result = await toggleTrackJob(job.id);
      if (result.success) {
        setIsTracking(result.tracking || false);
      }
    });
  };

  return (
    <div className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-md ${
      job.isFeatured
        ? "bg-gradient-to-br from-card to-blue-500/5 border-blue-500/30 hover:border-blue-500/50"
        : "bg-card border-border hover:border-muted-foreground/30"
    }`}>
      {/* Top Section */}
      <div>
        <div className="flex justify-between items-start gap-2 mb-2">
          {/* Days Left Countdown */}
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
            {deadlineTag}
          </span>

          {/* Quick Track Button */}
          <button
            onClick={handleTrackClick}
            disabled={isPending}
            className={`p-1.5 rounded-lg border transition-all ${
              isTracking
                ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                : "bg-muted text-muted-foreground border-transparent hover:text-foreground"
            }`}
            title={isTracking ? t("unsave_job") : t("save_job")}
          >
            <Bell className={`h-4.5 w-4.5 ${isTracking ? "fill-blue-500 text-blue-500" : ""}`} />
          </button>
        </div>

        {/* Info */}
        <Link href={`/jobs/${job.id}`} className="block group">
          <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {job.organization}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[40px]">
            {postsSummary}
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 pt-3 border-t border-border/60 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              {totalVacancy > 0 ? `${totalVacancy} ${t("posts")}` : t("posts")}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              {job.applicationFee > 0 ? `${job.applicationFee} BDT` : `Free`}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(job.deadline).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
