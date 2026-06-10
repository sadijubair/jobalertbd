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
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border bg-card/90 backdrop-blur-md safe-pb shadow-lg md:hidden">
      <div className="mx-auto flex h-full max-w-lg items-center justify-around px-2">
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
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors duration-200 ${
                isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5.5 w-5.5" />
              <span className="text-[10px] mt-1 select-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
