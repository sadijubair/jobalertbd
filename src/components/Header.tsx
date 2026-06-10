"use client";

import Link from "next/link";
import { Sun, Moon, Languages, LogIn, LayoutDashboard, LogOut } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface HeaderProps {
  session: {
    userId: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
  } | null;
}

export function Header({ session }: HeaderProps) {
  const { locale, setLocale, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    setLocale(locale === "en" ? "bn" : "en");
  };

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md px-4 py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform duration-200">
            JA
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            JobAlert <span className="text-foreground font-medium text-sm">BD</span>
          </span>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Toggle Language / ভাষা পরিবর্তন"
          >
            <Languages className="h-5 w-5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Toggle Theme"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* User Profile / Login */}
          {session ? (
            <div className="flex items-center gap-2 ml-1">
              <Link
                href={session.role === "ADMIN" ? "/workspace/dashboard" : "/app/dashboard"}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 transition-all shadow-sm"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                {session.role === "ADMIN" ? t("nav_workspace") : t("dashboard_title")}
              </Link>
              <Link
                href="/app/profile"
                className="h-8 w-8 rounded-full overflow-hidden border border-primary/20 hover:ring-2 hover:ring-primary/40 transition-all"
              >
                <img
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(session.name)}`}
                  alt={session.name}
                  className="h-full w-full object-cover"
                />
              </Link>
              <a
                href="/api/auth/logout"
                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title={t("logout")}
              >
                <LogOut className="h-5 w-5" />
              </a>
            </div>
          ) : (
            <Link
              href="/api/auth/google"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 transition-all shadow-sm"
            >
              <LogIn className="h-3.5 w-3.5" />
              {t("login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
