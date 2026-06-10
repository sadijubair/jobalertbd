"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { toggleTrackJob, createReport } from "@/app/actions/jobActions";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Briefcase, Link as LinkIcon, DollarSign, Bell, Share2, ExternalLink, AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface JobDetailsClientProps {
  job: any;
  isTrackingInitial: boolean;
  isLoggedIn: boolean;
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
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </button>

      {/* Main Info Card */}
      <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-6">
        <div>
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
              {deadlineTag}
            </span>
            {job.isFeatured && (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                Featured
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {job.organization}
          </h1>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/60">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
              {t("app_fee")}
            </span>
            <span className="font-extrabold text-foreground flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-primary" />
              {job.applicationFee > 0 ? `${job.applicationFee} BDT` : "Free"}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
              {t("deadline")}
            </span>
            <span className="font-extrabold text-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4 text-primary" />
              {new Date(job.deadline).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
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
              job.posts.map((post: any) => (
                <div key={post.id} className="p-4 rounded-2xl bg-muted/50 border border-border/40 flex justify-between items-center">
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
                className="flex-1 flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-border bg-card font-bold text-sm text-foreground hover:bg-muted hover:border-muted-foreground/30 transition-all text-center"
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
                className="flex-1 flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-primary font-bold text-sm text-primary-foreground hover:bg-primary/95 transition-all shadow-sm text-center"
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
          <button
            onClick={handleTrackClick}
            disabled={isPending}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border font-bold text-sm transition-all shadow-sm ${
              isTracking
                ? "bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20"
                : "bg-card text-foreground border-border hover:bg-muted"
            }`}
          >
            <Bell className={`h-4.5 w-4.5 ${isTracking ? "fill-blue-500 text-blue-500" : ""}`} />
            {isTracking ? t("unsave_job") : t("save_job")}
          </button>

          <button
            onClick={handleShare}
            className="px-4 py-3.5 rounded-2xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            title="Share"
          >
            <Share2 className="h-5 w-5" />
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-3.5 rounded-2xl border border-border bg-card text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 transition-all"
            title={t("report_issue")}
          >
            <AlertTriangle className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="w-full max-w-md bg-card border border-border p-6 rounded-3xl shadow-xl space-y-4 animate-scale-in">
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
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground focus:outline-none"
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
                    className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isReporting}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/95 transition-all shadow-sm"
                >
                  {isReporting ? "Submitting..." : "Submit Report"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
