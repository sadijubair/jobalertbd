"use client";

import { sendBroadcastNotification } from "@/app/actions/workspaceActions";
import { useState, useTransition } from "react";
import { Bell, Megaphone, Send, CheckCircle2 } from "lucide-react";

export function BroadcastClient() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    startTransition(async () => {
      const res = await sendBroadcastNotification({ title, content });
      if (res.success) {
        setSent(true);
        setTitle("");
        setContent("");
        setTimeout(() => setSent(false), 3000);
      } else {
        alert(res.error || "Failed to send broadcast");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Broadcast Announcements
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Send in-app notifications and alerts to all registered users.
        </p>
      </div>

      <div className="max-w-xl p-6 rounded-3xl border border-border bg-card shadow-sm">
        {sent && (
          <div className="mb-4 flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 text-xs font-bold">
            <CheckCircle2 className="h-4.5 w-4.5" />
            <span>Broadcast announcement successfully dispatched!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
              <Megaphone className="h-3.5 w-3.5 text-primary" />
              Announcement Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Server Maintenance or Weekly Digest Available"
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
              <Bell className="h-3.5 w-3.5 text-primary" />
              Content / Message *
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the broadcast message content here..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm hover:bg-primary/95 transition-all shadow-md flex justify-center items-center gap-1.5"
          >
            <Send className="h-4 w-4" />
            {isPending ? "Dispatched..." : "Send Announcement"}
          </button>
        </form>
      </div>
    </div>
  );
}
