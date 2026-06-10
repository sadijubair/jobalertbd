"use client";

import { adminLoginAction } from "@/app/actions/authActions";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Shield, Key, User, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export function WorkspaceLogin() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await adminLoginAction(null, formData);
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        router.push("/workspace/dashboard");
      }
    });
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-8 rounded-lg border border-border bg-card shadow-lg space-y-6">
      <div className="text-center space-y-2">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mx-auto">
          <Shield className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
          Admin Workspace
        </h1>
        <p className="text-sm text-muted-foreground">
          Log in with your administrator credentials.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 text-xs font-bold">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            Username
          </label>
          <input
            type="text"
            name="username"
            required
            placeholder="Username or email"
            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
            <Key className="h-3.5 w-3.5" />
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-extrabold text-sm hover:bg-primary/95 transition-all shadow-md  disabled:opacity-50"
        >
          {isPending ? "Logging in..." : "Login to Workspace"}
        </button>
      </form>

      <div className="text-center pt-2">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Public Application
        </Link>
      </div>

    </div>
  );
}
