"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { subscribeNewsletter } from "@/app/actions/jobActions";
import { useState, useTransition } from "react";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";

export function NewsletterForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [digestType, setDigestType] = useState("WEEKLY");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setMessage(null);
    startTransition(async () => {
      const res = await subscribeNewsletter(email, digestType);
      if (res.success) {
        setMessage({ type: "success", text: t("subscribe_success") });
        setEmail("");
      } else {
        setMessage({ type: "error", text: res.error || "Something went wrong" });
      }
    });
  };

  return (
    <div className="relative p-6 sm:p-8 rounded-3xl border border-blue-500/10 bg-gradient-to-br from-blue-600/5 via-card to-cyan-500/5 shadow-sm overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-blue-500/10 blur-xl" />

      <div className="relative z-10 max-w-2xl">
        <h3 className="text-xl sm:text-2xl font-extrabold text-foreground mb-2 flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          {t("newsletter_title")}
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-6">
          {t("newsletter_desc")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("email_placeholder")}
              required
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/95 transition-all shadow-sm active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isPending ? t("subscribing") : t("subscribe")}
            </button>
          </div>

          {/* Digest Types Selection */}
          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
            <span>Frequency:</span>
            {[
              { id: "INSTANT", label: "Instant Alert" },
              { id: "DAILY", label: "Daily Digest" },
              { id: "WEEKLY", label: "Weekly Digest" },
            ].map((freq) => (
              <label key={freq.id} className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="radio"
                  name="digestType"
                  value={freq.id}
                  checked={digestType === freq.id}
                  onChange={() => setDigestType(freq.id)}
                  className="accent-primary"
                />
                <span className={digestType === freq.id ? "text-foreground" : ""}>
                  {freq.label}
                </span>
              </label>
            ))}
          </div>
        </form>

        {message && (
          <div className={`mt-4 flex items-center gap-2 text-sm font-semibold p-3 rounded-xl ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20"
              : "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20"
          }`}>
            {message.type === "success" ? (
              <CheckCircle className="h-4.5 w-4.5" />
            ) : (
              <AlertCircle className="h-4.5 w-4.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
