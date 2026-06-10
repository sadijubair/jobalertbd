"use client";

import { createGlobalJob, updateGlobalJob, deleteGlobalJob, toggleFeatureJob } from "@/app/actions/workspaceActions";
import { useState, useTransition } from "react";
import { Plus, Trash2, Edit2, Star, Calendar, Briefcase, DollarSign, ArrowLeft, CheckCircle } from "lucide-react";

interface JobsManagerClientProps {
  initialJobs: any[];
}

export function JobsManagerClient({ initialJobs }: JobsManagerClientProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [isPending, startTransition] = useTransition();

  // Mode: "list" | "add" | "edit"
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  // Form Fields
  const [organization, setOrganization] = useState("");
  const [applicationLink, setApplicationLink] = useState("");
  const [circularLink, setCircularLink] = useState("");
  const [applicationFee, setApplicationFee] = useState(0);
  const [deadline, setDeadline] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [description, setDescription] = useState("");
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

  const resetForm = () => {
    setOrganization("");
    setApplicationLink("");
    setCircularLink("");
    setApplicationFee(0);
    setDeadline("");
    setIsFeatured(false);
    setDescription("");
    setPosts([{ name: "", postsCount: 1, grade: "10" }]);
    setEditingJobId(null);
  };

  const handleCreateTrigger = () => {
    resetForm();
    setMode("add");
  };

  const handleEditTrigger = (job: any) => {
    setEditingJobId(job.id);
    setOrganization(job.organization);
    setApplicationLink(job.applicationLink || "");
    setCircularLink(job.circularLink || "");
    setApplicationFee(job.applicationFee || 0);
    
    // Format date for input date type (YYYY-MM-DD)
    const d = new Date(job.deadline);
    const dateStr = d.toISOString().split("T")[0];
    setDeadline(dateStr);
    
    setIsFeatured(job.isFeatured);
    setDescription(job.description || "");
    
    if (job.posts && job.posts.length > 0) {
      setPosts(job.posts.map((p: any) => ({
        name: p.name,
        postsCount: p.postsCount,
        grade: p.grade,
      })));
    } else {
      setPosts([{ name: "", postsCount: 1, grade: "10" }]);
    }
    setMode("edit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !deadline) return;

    const validPosts = posts.filter(p => p.name.trim() !== "");

    startTransition(async () => {
      if (mode === "add") {
        const res = await createGlobalJob({
          organization,
          applicationLink,
          circularLink,
          applicationFee,
          deadline,
          isFeatured,
          description,
          posts: validPosts,
        });

        if (res.success) {
          // Re-fetch or locally append
          window.location.reload();
        } else {
          alert(res.error || "Failed to create job");
        }
      } else if (mode === "edit" && editingJobId) {
        const res = await updateGlobalJob(editingJobId, {
          organization,
          applicationLink,
          circularLink,
          applicationFee,
          deadline,
          isFeatured,
          description,
          posts: validPosts,
        });

        if (res.success) {
          window.location.reload();
        } else {
          alert(res.error || "Failed to update job");
        }
      }
    });
  };

  const handleToggleFeature = (id: string) => {
    // Optimistic Update
    setJobs(prev =>
      prev.map(j => (j.id === id ? { ...j, isFeatured: !j.isFeatured } : j))
    );
    startTransition(async () => {
      await toggleFeatureJob(id);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this global circular?")) return;

    // Optimistic Update
    setJobs(prev => prev.filter(j => j.id !== id));
    startTransition(async () => {
      await deleteGlobalJob(id);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Manage Global Circulars
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create and edit jobs published globally to all platform visitors.
          </p>
        </div>
        {mode === "list" && (
          <button
            onClick={handleCreateTrigger}
            className="flex items-center gap-1 bg-primary text-primary-foreground font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-primary/95 transition-all shadow-md"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Global Circular
          </button>
        )}
      </div>

      {/* Mode Views */}
      {mode === "list" ? (
        /* LIST VIEW */
        jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => {
              const vacancy = job.posts?.reduce((sum: number, p: any) => sum + p.postsCount, 0) || 0;
              return (
                <div key={job.id} className="p-5 rounded-2xl border border-border bg-card shadow-xs flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <h3 className="font-extrabold text-foreground text-lg line-clamp-1">
                        {job.organization}
                      </h3>
                      {job.isFeatured && (
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {job.posts?.map((p: any) => p.name).join(", ") || "General posts"}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {vacancy} Posts
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        DL: {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleFeature(job.id)}
                      className={`p-2 rounded-lg border transition-all ${
                        job.isFeatured
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-muted text-muted-foreground border-transparent hover:text-foreground"
                      }`}
                      title="Feature/Unfeature"
                    >
                      <Star className={`h-4 w-4 ${job.isFeatured ? "fill-amber-500" : ""}`} />
                    </button>
                    <button
                      onClick={() => handleEditTrigger(job)}
                      className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground border border-transparent transition-all"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-transparent transition-all"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-card">
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4 stroke-1" />
            <h3 className="font-extrabold text-lg text-foreground mb-1">No global jobs yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
              Add your first global job circular so that guest users can browse and follow them.
            </p>
            <button
              onClick={handleCreateTrigger}
              className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold text-sm"
            >
              Add Global Circular
            </button>
          </div>
        )
      ) : (
        /* ADD / EDIT FORM VIEW */
        <form onSubmit={handleSubmit} className="space-y-6">
          <button
            type="button"
            onClick={() => setMode("list")}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to circulars list
          </button>

          <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-6">
            <h3 className="text-xl font-extrabold text-foreground">
              {mode === "add" ? "Add Global Circular" : "Edit Global Circular"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Organization */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. NTRCA, Bangladesh Railway"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
              </div>

              {/* Fee */}
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
                  placeholder="e.g. 500"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Deadline *
                </label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
              </div>

              {/* Application Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Application Link</label>
                <input
                  type="url"
                  value={applicationLink}
                  onChange={(e) => setApplicationLink(e.target.value)}
                  placeholder="http://example.com/apply"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
              </div>

              {/* Circular Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Circular Link</label>
                <input
                  type="url"
                  value={circularLink}
                  onChange={(e) => setCircularLink(e.target.value)}
                  placeholder="http://example.com/pdf"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
              </div>

              {/* Feature Checkbox */}
              <div className="space-y-1.5 sm:col-span-2 flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={() => setIsFeatured(!isFeatured)}
                  className="accent-primary h-4.5 w-4.5"
                />
                <label htmlFor="isFeatured" className="text-sm font-bold text-foreground cursor-pointer select-none">
                  Mark this circular as Featured (Pinned to Homepage carousel)
                </label>
              </div>

              {/* Description */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Description / Info</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter details..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
              </div>
            </div>

            {/* Posts Sub-form */}
            <div className="space-y-3 pt-4 border-t border-border/60">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-base text-foreground">Circular Posts</h4>
                <button
                  type="button"
                  onClick={handleAddPost}
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors p-1"
                >
                  + Add Post Type
                </button>
              </div>

              <div className="space-y-3">
                {posts.map((post, index) => (
                  <div key={index} className="flex gap-2 items-end p-4 rounded-2xl bg-muted/40 border border-border/30">
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
                    <div className="w-20 space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Vacancy</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={post.postsCount || ""}
                        onChange={(e) => handlePostChange(index, "postsCount", Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Grade</label>
                      <input
                        type="text"
                        required
                        value={post.grade}
                        onChange={(e) => handlePostChange(index, "grade", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePost(index)}
                      disabled={posts.length === 1}
                      className="p-2.5 text-muted-foreground hover:text-rose-500 disabled:opacity-30"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-border/60">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm hover:bg-primary/95 transition-all shadow-md flex justify-center items-center gap-1.5"
              >
                {isPending ? "Saving..." : "Save Global Circular"}
              </button>
              <button
                type="button"
                onClick={() => setMode("list")}
                className="px-6 py-3.5 rounded-2xl border border-border bg-card text-foreground hover:bg-muted font-bold text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
