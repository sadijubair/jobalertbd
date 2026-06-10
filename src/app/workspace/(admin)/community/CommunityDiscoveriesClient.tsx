"use client";

import { publishCommunityJobGlobally } from "@/app/actions/workspaceActions";
import { useState, useTransition } from "react";
import { Globe, Users, Calendar, Briefcase, ExternalLink } from "lucide-react";
import { formatDateDMY } from "@/lib/format";

interface CommunityDiscoveriesClientProps {
  initialJobs: any[];
}

export function CommunityDiscoveriesClient({ initialJobs }: CommunityDiscoveriesClientProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [isPending, startTransition] = useTransition();

  const handlePublishGlobally = (jobId: string) => {
    // Optimistic Update
    setJobs(prev => prev.filter(j => j.id !== jobId));
    startTransition(async () => {
      const res = await publishCommunityJobGlobally(jobId);
      if (!res.success) {
        alert(res.error || "Failed to publish globally");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Community Discoveries
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review personal job circulars added by users. Publish popular ones globally so everyone can find and follow them.
        </p>
      </div>

      {jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => {
            const totalVacancy = job.posts?.reduce((sum: number, p: any) => sum + p.postsCount, 0) || 0;
            return (
              <div key={job.id} className="p-5 rounded-lg border border-border bg-card shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex gap-2.5 items-center flex-wrap">
                    <h3 className="font-extrabold text-foreground text-lg">{job.organization}</h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
                      <Users className="h-3 w-3" />
                      Tracked by {job.trackedCount} users
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Posts: {job.posts?.map((p: any) => p.name).join(", ") || "General post"}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {totalVacancy} Posts
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      DL: {formatDateDMY(job.deadline)}
                    </span>
                    {job.circularLink && (
                      <a
                        href={job.circularLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-0.5 text-primary hover:underline"
                      >
                        Circular Link
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handlePublishGlobally(job.id)}
                  disabled={isPending}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/95 transition-all shadow-sm shrink-0"
                >
                  <Globe className="h-4 w-4" />
                  Publish Globally
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center border-2 border-dashed border-border rounded-lg bg-card">
          <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4 stroke-1" />
          <h3 className="font-extrabold text-lg text-foreground mb-1">No discoveries to review</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            When users add custom personal circulars to their dashboard, they will appear here for you to evaluate and publish globally.
          </p>
        </div>
      )}
    </div>
  );
}
