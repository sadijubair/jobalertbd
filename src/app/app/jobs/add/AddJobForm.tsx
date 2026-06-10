"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { createUserPersonalJob } from "@/app/actions/userActions";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Calendar, Link as LinkIcon, DollarSign, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function AddJobForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Standard Fields
  const [organization, setOrganization] = useState("");
  const [applicationLink, setApplicationLink] = useState("");
  const [circularLink, setCircularLink] = useState("");
  const [applicationFee, setApplicationFee] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");

  // Multiple Posts
  const [posts, setPosts] = useState<{ name: string; postsCount: number; grade: string }[]>([
    { name: "", postsCount: 1, grade: "10" }
  ]);

  const handleAddPost = () => {
    setPosts([...posts, { name: "", postsCount: 1, grade: "10" }]);
  };

  const handleRemovePost = (index: number) => {
    if (posts.length === 1) return;
    setPosts(posts.filter((_, i) => i !== index));
  };

  const handlePostChange = (index: number, field: string, value: any) => {
    const updated = [...posts];
    updated[index] = { ...updated[index], [field]: value };
    setPosts(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !deadline) return;

    // Filter out posts with empty names
    const validPosts = posts.filter(p => p.name.trim() !== "");
    if (validPosts.length === 0) {
      alert("Please add at least one post name.");
      return;
    }

    startTransition(async () => {
      const res = await createUserPersonalJob({
        organization,
        applicationLink,
        circularLink,
        applicationFee,
        deadline,
        description,
        posts: validPosts,
      });

      if (res.success) {
        router.push("/app/jobs");
      } else {
        alert(res.error || "Failed to create personal job");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back Button */}
      <Link href="/app/jobs" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </Link>

      <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {t("add_job_title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("add_job_desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Organization */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              Organization / Circular Name *
            </label>
            <input
              type="text"
              required
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. Bangladesh Bank, NTRCA, Railway"
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            />
          </div>

          {/* Application Fee */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              Application Fee (BDT)
            </label>
            <input
              type="number"
              min="0"
              value={applicationFee || ""}
              onChange={(e) => setApplicationFee(Number(e.target.value))}
              placeholder="e.g. 700"
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            />
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Application Deadline *
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            />
          </div>

          {/* Application Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
              <LinkIcon className="h-3.5 w-3.5" />
              Application Link (URL)
            </label>
            <input
              type="url"
              value={applicationLink}
              onChange={(e) => setApplicationLink(e.target.value)}
              placeholder="e.g. http://bb.teletalk.com.bd"
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            />
          </div>

          {/* Circular Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
              <LinkIcon className="h-3.5 w-3.5" />
              Circular PDF / Website URL
            </label>
            <input
              type="url"
              value={circularLink}
              onChange={(e) => setCircularLink(e.target.value)}
              placeholder="e.g. https://www.bb.org.bd/circular"
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">
              Description / Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write your notes here (e.g. login credentials, tracking details, requirements)..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            />
          </div>
        </div>

        {/* Dynamic Posts Form List */}
        <div className="space-y-3 pt-4 border-t border-border/60">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-base text-foreground">
              {t("posts_list")}
            </h3>
            <button
              type="button"
              onClick={handleAddPost}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors p-1"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("add_post")}
            </button>
          </div>

          <div className="space-y-3">
            {posts.map((post, index) => (
              <div key={index} className="flex gap-2.5 items-end p-4 rounded-2xl bg-muted/40 border border-border/30">
                {/* Post name */}
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Post Name</label>
                  <input
                    type="text"
                    required
                    value={post.name}
                    onChange={(e) => handlePostChange(index, "name", e.target.value)}
                    placeholder="e.g. Officer General"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none"
                  />
                </div>

                {/* Vacancy count */}
                <div className="w-20 space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Vacancy</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={post.postsCount || ""}
                    onChange={(e) => handlePostChange(index, "postsCount", Number(e.target.value))}
                    placeholder="10"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none"
                  />
                </div>

                {/* Grade */}
                <div className="w-20 space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Grade</label>
                  <input
                    type="text"
                    required
                    value={post.grade}
                    onChange={(e) => handlePostChange(index, "grade", e.target.value)}
                    placeholder="9"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none"
                  />
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleRemovePost(index)}
                  disabled={posts.length === 1}
                  className="p-2.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 disabled:opacity-30 transition-all shrink-0"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm hover:bg-primary/95 shadow-md transition-all flex justify-center items-center gap-1.5"
        >
          {isPending ? t("saving_job") : "Create and Track Deadline"}
        </button>
      </div>
    </form>
  );
}
