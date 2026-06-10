"use client";

import { toggleUserStatus } from "@/app/actions/workspaceActions";
import { useState, useTransition } from "react";
import { Users, Search, ShieldAlert, ShieldCheck, Mail, Calendar, Briefcase } from "lucide-react";
import { formatDateDMY } from "@/lib/format";

interface UsersManagerClientProps {
  initialUsers: any[];
}

export function UsersManagerClient({ initialUsers }: UsersManagerClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    
    // Optimistic Update
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, status: newStatus } : u))
    );

    startTransition(async () => {
      const res = await toggleUserStatus(userId, newStatus);
      if (!res.success) {
        alert(res.error || "Failed to toggle status");
        // Revert on error
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, status: currentStatus } : u))
        );
      }
    });
  };

  // Search filter
  const filteredUsers = users.filter(user => {
    const query = search.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(query)) ||
      user.email.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor registered job seekers, tracked job counts, and suspend or activate accounts.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>
      </div>

      {/* Users List Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`p-5 rounded-lg border bg-card shadow-xs flex justify-between items-start gap-4 transition-all ${
                user.status === "SUSPENDED" ? "border-rose-500/10 bg-rose-500/[0.01]" : "border-border"
              }`}
            >
              <div className="flex gap-3 min-w-0">
                {/* Avatar */}
                <div className="h-11 w-11 rounded-full overflow-hidden border border-border shrink-0 bg-muted">
                  <img
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name || "User")}`}
                    alt={user.name || "User"}
                    className="h-full w-full object-cover"
                  />
                </div>
                
                {/* Info */}
                <div className="space-y-1 min-w-0">
                  <div className="flex gap-2 items-center">
                    <h3 className="font-extrabold text-foreground text-sm sm:text-base truncate">
                      {user.name || "Anonymous"}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide shrink-0 ${
                      user.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-rose-500/10 text-rose-500"
                    }`}>
                      {user.status}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground font-semibold pt-1">
                    <span className="flex items-center gap-0.5">
                      <Briefcase className="h-3 w-3" />
                      {user.userJobs?.length || 0} Tracked
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Calendar className="h-3 w-3" />
                      Joined: {formatDateDMY(user.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => handleToggleStatus(user.id, user.status)}
                disabled={isPending}
                className={`p-2.5 rounded-lg border transition-all shrink-0 ${
                  user.status === "ACTIVE"
                    ? "bg-rose-500/5 text-rose-500 border-rose-500/10 hover:bg-rose-500/10"
                    : "bg-emerald-500/5 text-emerald-600 border-emerald-500/10 hover:bg-emerald-500/10"
                }`}
                title={user.status === "ACTIVE" ? "Suspend User" : "Activate User"}
              >
                {user.status === "ACTIVE" ? (
                  <ShieldAlert className="h-4.5 w-4.5" />
                ) : (
                  <ShieldCheck className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border-2 border-dashed border-border rounded-lg bg-card">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 stroke-1" />
          <h3 className="font-extrabold text-lg text-foreground mb-1">No users found</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Try adjusting your search filters or input queries.
          </p>
        </div>
      )}
    </div>
  );
}
