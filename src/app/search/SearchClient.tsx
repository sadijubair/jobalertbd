"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { JobCard } from "@/components/JobCard";
import { getPublicJobs } from "@/app/actions/jobActions";
import { useState, useEffect, useTransition } from "react";
import { Search, SlidersHorizontal, Calendar, Star, Compass } from "lucide-react";

interface SearchClientProps {
  initialJobs: PublicJob[];
  isLoggedIn: boolean;
  trackedJobIds: string[];
}

interface PublicJob {
  id: string;
  organization: string;
  deadline: Date | string;
  applicationFee: number;
  isFeatured: boolean;
  posts?: { id: string; name: string; postsCount: number }[];
}

export function SearchClient({ initialJobs, isLoggedIn, trackedJobIds }: SearchClientProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [jobs, setJobs] = useState(initialJobs);
  const [isPending, startTransition] = useTransition();

  // Load jobs on query or filter changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      startTransition(async () => {
        const res = await getPublicJobs(query, filter);
        if (res.jobs) {
          setJobs(res.jobs);
        }
      });
    }, 300); // 300ms debounce for live typing search

    return () => clearTimeout(delayDebounceFn);
  }, [query, filter]);

  const filtersList = [
    { id: "all", label: t("filter_all"), icon: Compass },
    { id: "today", label: t("filter_today"), icon: Calendar },
    { id: "3days", label: t("filter_3days"), icon: Calendar },
    { id: "7days", label: t("filter_7days"), icon: Calendar },
    { id: "15days", label: t("filter_15days"), icon: Calendar },
    { id: "newest", label: t("filter_newest"), icon: Star },
    { id: "most_saved", label: t("filter_most_saved"), icon: Star },
    { id: "featured", label: t("filter_featured"), icon: Star },
  ];

  const trackedSet = new Set(trackedJobIds);

  return (
    <div className="space-y-6">
      {/* Search Header Input */}
      <div className="surface-panel relative rounded-lg">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search_placeholder")}
          className="h-12 w-full rounded-lg border-0 bg-transparent py-0 pl-12 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-3 focus:ring-primary/15 sm:text-base"
        />
        {isPending && (
          <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {/* Filters Title */}
      <div>
        <div className="eyebrow mb-3 flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4" />
          {t("search_filters")}
        </div>
        {/* Horizontal filters container */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none">
          {filtersList.map((item) => {
            const Icon = item.icon;
            const isSelected = filter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Results */}
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isTrackingInitial={trackedSet.has(job.id)}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      ) : (
        <div className="surface-panel rounded-lg border-dashed py-16 text-center">
          <SlidersHorizontal className="h-12 w-12 text-muted-foreground mx-auto mb-4 stroke-1" />
          <h3 className="font-extrabold text-lg text-foreground mb-1">
            {t("no_jobs_found")}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Try adjusting your search terms or filter constraints to locate available circulars.
          </p>
        </div>
      )}
    </div>
  );
}
