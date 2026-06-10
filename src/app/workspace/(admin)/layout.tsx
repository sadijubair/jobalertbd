import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Briefcase, Globe, Bell, Mail, AlertTriangle, LogOut, Users, BriefcaseBusiness } from "lucide-react";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default async function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const session = await getSession();

  // Guard all admin workspace subroutes
  if (!session || session.role !== "ADMIN") {
    redirect("/workspace");
  }

  const sidebarLinks = [
    { href: "/workspace/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/workspace/jobs", label: "Global Jobs", icon: Briefcase },
    { href: "/workspace/community", label: "Community Discoveries", icon: Globe },
    { href: "/workspace/notifications", label: "Broadcasts", icon: Bell },
    { href: "/workspace/newsletters", label: "Newsletters", icon: Mail },
    { href: "/workspace/reports", label: "Flagged Reports", icon: AlertTriangle },
    { href: "/workspace/users", label: "User Management", icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* 1. Sidebar Nav (Desktop) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/80 bg-card md:flex">
        {/* Brand */}
        <div className="flex h-16 items-center gap-2 border-b border-border/80 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-sm font-extrabold text-foreground">JobAlert BD</span>
            <span className="text-xs font-semibold text-muted-foreground">Workspace Admin</span>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 space-y-1 p-3">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4.5 w-4.5 text-muted-foreground" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="flex flex-col gap-3 border-t border-border/80 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-bold text-primary">
              A
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-sm text-foreground truncate">{session.name}</h4>
              <span className="text-[10px] text-muted-foreground block font-bold uppercase">Administrator</span>
            </div>
          </div>
          <a
            href="/api/auth/logout"
            className="flex items-center justify-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 p-2.5 text-center text-xs font-bold text-rose-500 transition-all hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4" />
            Logout Workspace
          </a>
        </div>
      </aside>

      {/* 2. Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-border/80 bg-background/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground md:hidden">
              <BriefcaseBusiness className="h-4.5 w-4.5" />
            </div>
            <span className="md:hidden font-extrabold text-base text-foreground">
              Workspace Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Public View */}
            <Link
              href="/"
              className="text-xs font-bold text-primary hover:underline"
            >
              Public App View
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
