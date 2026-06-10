"use client";

import { sendNewsletter } from "@/app/actions/workspaceActions";
import { useState, useTransition } from "react";
import { Mail, Send, Users, CheckCircle } from "lucide-react";
import { formatDateDMY } from "@/lib/format";

interface NewsletterClientProps {
  subscribers: any[];
}

export function NewsletterClient({ subscribers }: NewsletterClientProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("WEEKLY");
  const [isPending, startTransition] = useTransition();
  const [sentCount, setSentCount] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body) return;

    startTransition(async () => {
      const res = await sendNewsletter({ subject, body, type });
      if (res.success) {
        setSentCount(res.count || 0);
        setSubject("");
        setBody("");
        setTimeout(() => setSentCount(null), 4000);
      } else {
        alert(res.error || "Failed to dispatch newsletter");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      
      {/* Compose Form (Left 3 columns) */}
      <div className="lg:col-span-3 space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Compose Newsletter
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Draft and distribute digests or instant alert emails to subscribers.
          </p>
        </div>

        <div className="p-6 rounded-lg border border-border bg-card shadow-sm">
          {sentCount !== null && (
            <div className="mb-4 flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 text-xs font-bold">
              <CheckCircle className="h-4.5 w-4.5" />
              <span>Newsletter successfully sent to {sentCount} subscribers!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Type select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Recipient Group</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-muted text-sm text-foreground focus:outline-none"
                >
                  <option value="ALL">All Subscribers</option>
                  <option value="INSTANT">Instant Alert Subscribers</option>
                  <option value="DAILY">Daily Digest Subscribers</option>
                  <option value="WEEKLY">Weekly Digest Subscribers</option>
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Email Subject *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Weekly Job Alerts: 12 New Circulars & Upcoming Deadlines"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
              </div>

              {/* Body */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Email Body (Markdown/HTML supported) *</label>
                <textarea
                  required
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type newsletter contents..."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-extrabold text-sm hover:bg-primary/95 transition-all shadow-md flex justify-center items-center gap-1.5"
            >
              <Send className="h-4 w-4" />
              {isPending ? "Sending..." : "Send Newsletter"}
            </button>
          </form>
        </div>
      </div>

      {/* Subscribers List (Right 2 columns) */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="font-extrabold text-lg text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Subscribers ({subscribers.length})
        </h2>

        <div className="p-4 rounded-lg border border-border bg-card max-h-[460px] overflow-y-auto space-y-3 shadow-xs">
          {subscribers.length > 0 ? (
            subscribers.map((sub) => (
              <div key={sub.id} className="flex justify-between items-center text-xs border-b border-border/40 pb-2.5 last:border-0 last:pb-0">
                <div className="space-y-0.5 truncate pr-2">
                  <span className="font-bold text-foreground truncate block">{sub.email}</span>
                  <span className="text-[10px] text-muted-foreground block">
                    Subscribed: {formatDateDMY(sub.createdAt)}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold tracking-wider">
                  {sub.type}
                </span>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No newsletter subscribers.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
