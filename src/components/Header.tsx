"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  CircleUserRound,
  LayoutDashboard,
  LogIn,
  LogOut,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LanguageSwitchIcon } from "@/components/AppIcons";

interface HeaderProps {
  session: {
    userId: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    avatar?: string | null;
  } | null;
}

export function Header({ session }: HeaderProps) {
  const { locale, setLocale, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  const toggleLanguage = () => {
    setLocale(locale === "en" ? "bn" : "en");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-foreground">
            JobAlert
          </span>
          <span className="hidden rounded-md border border-border bg-card px-1.5 py-0.5 text-xs font-semibold text-muted-foreground sm:inline-flex">
            BD
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            title="Toggle language"
          >
            <LanguageSwitchIcon className="h-5 w-5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="rounded-full">
                  {session.avatar ? (
                    <span className="h-8 w-8 overflow-hidden rounded-full border border-border/80">
                      <img
                        src={session.avatar}
                        alt={session.name}
                        className="h-full w-full object-cover"
                      />
                    </span>
                  ) : (
                    <CircleUserRound className="h-8 w-8 text-muted-foreground" />
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 border-border p-2">
                <div className="px-2.5 py-2">
                  <p className="truncate text-sm font-bold text-foreground">
                    {session.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {session.email}
                  </p>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link
                    href={session.role === "ADMIN" ? "/workspace/dashboard" : "/app/dashboard"}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {session.role === "ADMIN" ? t("nav_workspace") : t("dashboard_title")}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/app/profile"
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <User className="h-4 w-4" />
                    {t("nav_profile")}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild variant="destructive">
                  <a
                    href="/api/auth/logout"
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-semibold"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link href="/api/auth/google">
                <LogIn className="h-3.5 w-3.5" />
                {t("login")}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
