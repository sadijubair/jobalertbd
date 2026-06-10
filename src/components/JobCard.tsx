"use client";

import { Calendar, Briefcase, Bell, ExternalLink } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { toggleTrackJob } from "@/app/actions/jobActions";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { TakaIcon } from "@/components/AppIcons";
import { formatDateDMY } from "@/lib/format";

interface JobCardProps {
  job: {
    id: string;
    organization: string;
    deadline: Date | string;
    applicationFee: number;
    isFeatured: boolean;
    posts?: { id: string; name: string; postsCount: number }[];
    circularLink?: string | null;
    applicationLink?: string | null;
    description?: string | null;
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
    e.stopPropagation();
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
    <Drawer>
      <DrawerTrigger asChild>
        <article
          role="button"
          tabIndex={0}
          className={`surface-panel group relative flex min-h-[218px] cursor-pointer flex-col justify-between rounded-lg p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md ${
            job.isFeatured ? "ring-1 ring-amber-500/30" : ""
          }`}
        >
          <div>
            <div className="mb-3 flex items-start justify-between gap-2">
              <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${badgeColor}`}>
                {deadlineTag}
              </span>

              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={handleTrackClick}
                disabled={isPending}
                className={`${
                  isTracking
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
                title={isTracking ? t("unsave_job") : t("save_job")}
              >
                <Bell className={`h-4.5 w-4.5 ${isTracking ? "fill-primary text-primary" : ""}`} />
              </Button>
            </div>

            <h3 className="line-clamp-1 text-lg font-extrabold text-foreground transition-colors group-hover:text-primary">
              {job.organization}
            </h3>

            <p className="mt-1 min-h-[40px] line-clamp-2 text-sm leading-5 text-muted-foreground">
              {postsSummary}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                <span className="truncate">{totalVacancy > 0 ? `${totalVacancy}` : t("posts")}</span>
              </span>
              <span className="flex items-center gap-1">
                <TakaIcon className="h-3.5 w-3.5" />
                <span className="truncate">{job.applicationFee > 0 ? `${job.applicationFee}` : `Free`}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span className="truncate">{formatDateDMY(job.deadline)}</span>
              </span>
            </div>
          </div>
        </article>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto flex max-h-[78vh] w-full max-w-2xl flex-col overflow-hidden">
          <DrawerHeader className="text-left">
            <div className="mb-2 flex flex-wrap gap-2">
              <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${badgeColor}`}>
                {deadlineTag}
              </span>
              {job.isFeatured && (
                <span className="rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Featured
                </span>
              )}
            </div>
            <DrawerTitle className="text-xl font-extrabold">
              {job.organization}
            </DrawerTitle>
            <DrawerDescription>{postsSummary}</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-5 overflow-y-auto px-4 pb-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs font-semibold text-muted-foreground">Deadline</div>
                <div className="mt-1 text-sm font-bold text-foreground">{formatDateDMY(job.deadline)}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs font-semibold text-muted-foreground">Fee</div>
                <div className="mt-1 flex items-center gap-1 text-sm font-bold text-foreground">
                  <TakaIcon className="h-4 w-4" />
                  {job.applicationFee > 0 ? `${job.applicationFee}` : "Free"}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs font-semibold text-muted-foreground">Vacancy</div>
                <div className="mt-1 text-sm font-bold text-foreground">
                  {totalVacancy > 0 ? totalVacancy : "-"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-extrabold text-foreground">{t("posts")}</h4>
              {job.posts && job.posts.length > 0 ? (
                <div className="space-y-2">
                  {job.posts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-3">
                      <span className="text-sm font-semibold text-foreground">{post.name}</span>
                      <span className="text-xs font-bold text-primary">{post.postsCount}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">General posts</p>
              )}
            </div>

            {job.description && (
              <div className="space-y-2">
                <h4 className="text-sm font-extrabold text-foreground">Description</h4>
                <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
                  {job.description}
                </p>
              </div>
            )}
          </div>

          <DrawerFooter>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {job.circularLink && (
                <Button asChild variant="outline">
                  <a href={job.circularLink} target="_blank" rel="noopener noreferrer">
                    {t("circular_link")}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {job.applicationLink && (
                <Button asChild>
                  <a href={job.applicationLink} target="_blank" rel="noopener noreferrer">
                    {t("apply")}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
