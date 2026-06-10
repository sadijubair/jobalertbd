import { getWorkspaceStats } from "@/app/actions/workspaceActions";
import { Briefcase, Users, Mail, Bell, AlertTriangle, Landmark } from "lucide-react";
import Link from "next/link";

export default async function WorkspaceDashboardPage() {
  const stats = await getWorkspaceStats();

  if ("error" in stats) {
    return <div className="text-rose-500">Error loading admin statistics.</div>;
  }

  const statCards = [
    {
      title: "Global Jobs",
      value: stats.globalJobs,
      icon: Briefcase,
      color: "text-blue-600 bg-blue-500/10",
      description: "Active published circulars",
      href: "/workspace/jobs",
    },
    {
      title: "Active Users",
      value: stats.users,
      icon: Users,
      color: "text-emerald-600 bg-emerald-500/10",
      description: "Registered Google profiles",
      href: "/workspace/dashboard",
    },
    {
      title: "Newsletter Subscribers",
      value: stats.subscribers,
      icon: Mail,
      color: "text-violet-600 bg-violet-500/10",
      description: "Digest email subscriptions",
      href: "/workspace/newsletters",
    },
    {
      title: "Tracked Relationships",
      value: stats.totalTracked,
      icon: Landmark,
      color: "text-amber-600 bg-amber-500/10",
      description: "Total job deadline track records",
      href: "/workspace/community",
    },
    {
      title: "Broadcasts Sent",
      value: stats.totalNotifications,
      icon: Bell,
      color: "text-cyan-600 bg-cyan-500/10",
      description: "Total announcements published",
      href: "/workspace/notifications",
    },
    {
      title: "Pending Reports",
      value: stats.pendingReports,
      icon: AlertTriangle,
      color: stats.pendingReports > 0 ? "text-rose-600 bg-rose-500/10" : "text-slate-600 bg-slate-500/10",
      description: "Broken links/deadlines reports",
      href: "/workspace/reports",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">Workspace overview</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of JobAlert BD system metrics and management controls.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="surface-panel flex items-start gap-4 rounded-lg p-5 transition-all hover:border-primary/35 hover:shadow-md"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${card.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  {card.title}
                </span>
                <span className="font-black text-2xl sm:text-3xl text-foreground block">
                  {card.value}
                </span>
                <span className="text-xs text-muted-foreground block font-medium">
                  {card.description}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
