"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { toggleTrackJob, createReport } from "@/app/actions/jobActions";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Briefcase, Link as LinkIcon, Bell, Share2, ExternalLink, AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TakaIcon } from "@/components/AppIcons";
import { formatDateDMY } from "@/lib/format";

interface JobDetailsClientProps {
  job: JobDetails;
  isTrackingInitial: boolean;
  isLoggedIn: boolean;
}

interface JobPost {
  id: string;
  name: string;
  grade?: string | null;
  postsCount: number;
}

interface JobDetails {
  id: string;
  organization: string;
  deadline: Date | string;
  applicationFee: number;
  isFeatured: boolean;
  circularLink?: string | null;
  applicationLink?: string | null;
  description?: string | null;
  posts?: JobPost[];
}

export function JobDetailsClient({ job, isTrackingInitial, isLoggedIn }: JobDetailsClientProps) {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isTracking, setIsTracking] = useState(isTrackingInitial);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState("WRONG_DEADLINE");
  const [reportDesc, setReportDesc] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [isReporting, startReportTransition] = useTransition();

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
    badgeColor = "bg-rose-500/10 text-rose-500";
  } else if (diffDays === 0) {
    deadlineTag = t("today");
    badgeColor = "bg-red-500 text-white animate-pulse";
  } else if (diffDays === 1) {
    deadlineTag = locale === "bn" ? `আগামীকাল` : `Tomorrow`;
    badgeColor = "bg-orange-500/15 text-orange-600 dark:text-orange-400";
  } else {
    deadlineTag = locale === "bn" ? `${diffDays} দিন বাকি` : `${diffDays} Days Left`;
    badgeColor = "bg-blue-500/10 text-blue-600 dark:text-blue-400";
  }

  const handleTrackClick = () => {
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

  const handleShare = async () => {
    const shareData = {
      title: `${job.organization} Circular`,
      text: `Track application deadline for ${job.organization} on JobAlert BD.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startReportTransition(async () => {
      const res = await createReport(job.id, reportType, reportDesc);
      if (res.success) {
        setReportSubmitted(true);
        setReportDesc("");
        setTimeout(() => {
          setShowReportModal(false);
          setReportSubmitted(false);
        }, 2000);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="px-0 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </Button>

      {/* Main Info Card */}
      <div className="surface-panel space-y-6 rounded-lg p-5 sm:p-6">
        <div>
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <span className={`rounded-md px-3 py-1 text-xs font-semibold ${badgeColor}`}>
              {deadlineTag}
            </span>
            {job.isFeatured && (
              <span className="rounded-md bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                Featured
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {job.organization}
          </h1>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-3 border-y border-border/60 py-4 sm:grid-cols-2">
          <div className="rounded-lg bg-muted/45 p-4">
            <span className="eyebrow block">
              {t("app_fee")}
            </span>
            <span className="mt-1 flex items-center gap-1 font-extrabold text-foreground">
              <TakaIcon className="h-4 w-4 text-primary" />
              {job.applicationFee > 0 ? `${job.applicationFee} BDT` : "Free"}
            </span>
          </div>

          <div className="rounded-lg bg-muted/45 p-4">
            <span className="eyebrow block">
              {t("deadline")}
            </span>
            <span className="mt-1 flex items-center gap-1 font-extrabold text-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              {formatDateDMY(job.deadline)}
            </span>
          </div>
        </div>

        {/* Posts Section */}
        <div className="space-y-3">
          <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            {t("posts")}
          </h2>

          <div className="space-y-2.5">
            {job.posts && job.posts.length > 0 ? (
              job.posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/45 p-4">
                  <div>
                    <h4 className="font-bold text-foreground text-sm sm:text-base">{post.name}</h4>
                    <span className="text-xs text-muted-foreground font-semibold">Grade {post.grade}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-primary">{post.postsCount}</span>
                    <span className="text-[10px] text-muted-foreground block font-bold uppercase">Vacancy</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">General Posts</p>
            )}
          </div>
        </div>

        {/* Links & Attachments */}
        <div className="space-y-3">
          <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            Links & References
          </h2>
          <div className="flex flex-col sm:flex-row gap-2.5">
            {job.circularLink && (
              <a
                href={job.circularLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card p-3.5 text-center text-sm font-bold text-foreground transition-all hover:border-muted-foreground/30 hover:bg-muted"
              >
                {t("circular_link")}
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            )}
            {job.applicationLink && (
              <a
                href={job.applicationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary p-3.5 text-center text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
              >
                {t("apply")}
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        {job.description && (
          <div className="pt-4 border-t border-border/60 space-y-2">
            <h3 className="font-bold text-foreground text-base">Job Details / Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="flex items-center gap-3 pt-6 border-t border-border/60">
          <Button
            type="button"
            variant={isTracking ? "secondary" : "outline"}
            onClick={handleTrackClick}
            disabled={isPending}
            className={`h-12 flex-1 ${
              isTracking
                ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                : ""
            }`}
          >
            <Bell className={`h-4.5 w-4.5 ${isTracking ? "fill-primary text-primary" : ""}`} />
            {isTracking ? t("unsave_job") : t("save_job")}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            onClick={handleShare}
            title="Share"
          >
            <Share2 className="h-5 w-5" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            onClick={() => setShowReportModal(true)}
            className="text-muted-foreground hover:bg-rose-500/5 hover:text-rose-500"
            title={t("report_issue")}
          >
            <AlertTriangle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="w-full max-w-md space-y-4 rounded-lg border border-border bg-card p-6 shadow-xl animate-scale-in">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                {t("report_issue")}
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-xs text-muted-foreground font-bold hover:text-foreground p-1"
              >
                Close
              </button>
            </div>

            {reportSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-extrabold text-foreground text-base">Report Submitted!</h4>
                <p className="text-xs text-muted-foreground">Thank you. Workspace Admins will review this report.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Issue Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground focus:outline-none"
                  >
                    <option value="WRONG_DEADLINE">Wrong Deadline Date</option>
                    <option value="BROKEN_LINK">Broken Application/Circular Link</option>
                    <option value="DUPLICATE_JOB">Duplicate Job circular</option>
                    <option value="FAKE_JOB">Fake or Misleading Info</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Details / Description</label>
                  <textarea
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder="Describe the issue in detail..."
                    required
                    rows={4}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isReporting}
                  className="w-full"
                >
                  {isReporting ? "Submitting..." : "Submit Report"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
