"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { subscribeNewsletter } from "@/app/actions/jobActions";
import { useState, useTransition } from "react";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

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
    <section className="surface-panel overflow-hidden rounded-lg p-5 sm:p-6">
      <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="mb-2 text-xl font-extrabold text-foreground sm:text-2xl">
            {t("newsletter_title")}
          </h3>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            {t("newsletter_desc")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("email_placeholder")}
              required
              className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm shadow-xs transition-all focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
            />
            <Button
              type="submit"
              disabled={isPending}
              className="h-10"
            >
              {isPending ? t("subscribing") : t("subscribe")}
            </Button>
          </div>

          {/* Digest Types Selection */}
          <FieldGroup className="gap-2" data-slot="checkbox-group">
            <span className="text-xs font-semibold text-muted-foreground">Frequency:</span>
            {[
              { id: "INSTANT", label: "Instant Alert" },
              { id: "DAILY", label: "Daily Digest" },
              { id: "WEEKLY", label: "Weekly Digest" },
            ].map((freq) => (
              <Field key={freq.id} orientation="horizontal" className="w-fit">
                <Checkbox
                  id={`digest-${freq.id.toLowerCase()}`}
                  checked={digestType === freq.id}
                  onCheckedChange={() => setDigestType(freq.id)}
                />
                <FieldLabel
                  htmlFor={`digest-${freq.id.toLowerCase()}`}
                  className={digestType === freq.id ? "text-foreground" : "text-muted-foreground"}
                >
                  {freq.label}
                </FieldLabel>
              </Field>
            ))}
          </FieldGroup>
        </form>

        {message && (
          <div className={`mt-4 flex items-center gap-2 rounded-lg p-3 text-sm font-semibold ${
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
    </section>
  );
}
