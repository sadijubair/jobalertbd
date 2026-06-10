import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Briefcase, Globe, Bell, Mail, AlertTriangle, LogOut, Sun, Moon, Languages, Users } from "lucide-react";

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
    <div className="flex min-h-screen bg-muted/40 text-foreground">
      {/* 1. Sidebar Nav (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card shrink-0">
        {/* Brand */}
        <div className="h-16 border-b border-border flex items-center px-6 gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            W
          </div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Workspace <span className="text-foreground text-xs font-medium">Admin</span>
          </span>
        </div>

        {/* Links */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <Icon className="h-4.5 w-4.5 text-muted-foreground" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-border flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">
              A
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-sm text-foreground truncate">{session.name}</h4>
              <span className="text-[10px] text-muted-foreground block font-bold uppercase">Administrator</span>
            </div>
          </div>
          <a
            href="/api/auth/logout"
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 font-bold text-xs transition-all text-center"
          >
            <LogOut className="h-4 w-4" />
            Logout Workspace
          </a>
        </div>
      </aside>

      {/* 2. Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="md:hidden h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              W
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
        <main className="flex-1 p-6 overflow-y-auto max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
