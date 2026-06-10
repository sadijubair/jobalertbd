"use client";

import { resolveReport } from "@/app/actions/workspaceActions";
import { useState, useTransition } from "react";
import { AlertTriangle, Check, User, Clock, Link2, HelpCircle } from "lucide-react";
import Link from "next/link";
import { formatDateDMY } from "@/lib/format";

interface ReportsClientProps {
  initialReports: any[];
}

export function ReportsClient({ initialReports }: ReportsClientProps) {
  const [reports, setReports] = useState(initialReports);
  const [isPending, startTransition] = useTransition();

  const handleResolve = (id: string) => {
    // Optimistic Update
    setReports(prev =>
      prev.map(r => (r.id === id ? { ...r, status: "RESOLVED" } : r))
    );
    startTransition(async () => {
      const res = await resolveReport(id);
      if (!res.success) {
        alert(res.error || "Failed to resolve report");
      }
    });
  };

  const getReportTypeLabel = (type: string) => {
    if (type === "WRONG_DEADLINE") return "Incorrect Deadline";
    if (type === "BROKEN_LINK") return "Broken Link";
    if (type === "DUPLICATE_JOB") return "Duplicate Circular";
    if (type === "FAKE_JOB") return "Fake Circular";
    return type;
  };

  const getIcon = (type: string) => {
    if (type === "WRONG_DEADLINE") return <Clock className="h-4 w-4" />;
    if (type === "BROKEN_LINK") return <Link2 className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Flagged Reports
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review broken links, wrong deadline dates, or duplicate reports submitted by users.
        </p>
      </div>

      {reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className={`p-5 rounded-lg border bg-card shadow-xs flex flex-col sm:flex-row justify-between items-start gap-4 transition-opacity ${
                report.status === "RESOLVED" ? "opacity-60 border-border" : "border-rose-500/20"
              }`}
            >
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    report.status === "RESOLVED"
                      ? "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                      : "bg-rose-500/10 text-rose-500"
                  }`}>
                    {getIcon(report.type)}
                    {getReportTypeLabel(report.type)}
                  </span>
                  
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    report.status === "RESOLVED" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                  }`}>
                    {report.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-foreground text-sm">
                    Target Job: <Link href={`/jobs/${report.job.id}`} className="text-primary hover:underline font-extrabold">{report.job.organization}</Link>
                  </h4>
                  <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg whitespace-pre-line leading-relaxed">
                    {report.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground font-semibold">
                  <span className="flex items-center gap-0.5">
                    <User className="h-3 w-3" />
                    Reporter: {report.reporter?.name || "Guest User"}
                  </span>
                  <span>
                    Reported on: {formatDateDMY(report.createdAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {report.status === "PENDING" && (
                <button
                  onClick={() => handleResolve(report.id)}
                  disabled={isPending}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/95 transition-all shadow-sm shrink-0"
                >
                  <Check className="h-4 w-4" />
                  Mark Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border-2 border-dashed border-border rounded-lg bg-card">
          <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 stroke-1" />
          <h3 className="font-extrabold text-lg text-foreground mb-1">No reports flagged</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            You're all caught up! No active issue flags or user reports need review.
          </p>
        </div>
      )}
    </div>
  );
}
