"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Briefcase, Bell, User } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export function Navigation() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Hide navigation inside Workspace admin panel
  if (pathname?.startsWith("/workspace")) {
    return null;
  }

  const navItems = [
    { href: "/", label: t("nav_home"), icon: Home },
    { href: "/search", label: t("nav_search"), icon: Search },
    { href: "/app/jobs", label: t("nav_my_jobs"), icon: Briefcase },
    { href: "/app/notifications", label: t("nav_notifications"), icon: Bell },
    { href: "/app/profile", label: t("nav_profile"), icon: User },
  ];

  return (
    <nav className="safe-pb fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-background/95 shadow-[0_-12px_30px_rgba(31,25,16,0.08)] backdrop-blur-md md:hidden">
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Check if active: exact match for root, prefix match for app paths
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-full min-w-0 flex-col items-center justify-center gap-1 transition-colors duration-200 ${
                isActive ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className={`rounded-lg p-1.5 ${isActive ? "bg-primary/10" : ""}`}>
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="w-full truncate text-center text-[10px] leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
