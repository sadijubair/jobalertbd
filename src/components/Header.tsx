"use client";

import Link from "next/link";
import { Sun, Moon, Languages, LogIn, LayoutDashboard, LogOut, User, ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

          {/* User Profile Dropdown / Login */}
          {session ? (
            <div className="relative ml-1" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-muted transition-all border border-border/50 group"
              >
                <div className="h-8 w-8 rounded-full overflow-hidden border border-primary/20 group-hover:ring-2 group-hover:ring-primary/30 transition-all">
                  <img
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(session.name)}`}
                    alt={session.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block pr-0.5" />
              </button>

              {/* Dropdown Menu Container */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card/95 backdrop-blur-md p-2.5 shadow-xl animate-fade-in z-50">
                  {/* User details header */}
                  <div className="px-2.5 py-2 mb-1">
                    <p className="text-sm font-bold text-foreground truncate">{session.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.email}</p>
                  </div>
                  
                  <div className="h-px bg-border my-1" />

                  {/* Dashboard link */}
                  <Link
                    href={session.role === "ADMIN" ? "/workspace/dashboard" : "/app/dashboard"}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all font-medium"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {session.role === "ADMIN" ? t("nav_workspace") : t("dashboard_title")}
                  </Link>

                  {/* Profile link */}
                  <Link
                    href="/app/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all font-medium"
                  >
                    <User className="h-4 w-4" />
                    {t("nav_profile")}
                  </Link>

                  <div className="h-px bg-border my-1" />

                  {/* Logout link */}
                  <a
                    href="/api/auth/logout"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 text-sm text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all font-semibold"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </a>
                </div>
              )}
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
