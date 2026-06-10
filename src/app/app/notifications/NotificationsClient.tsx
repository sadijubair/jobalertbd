"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { markNotificationRead, markAllNotificationsRead, clearAllNotifications } from "@/app/actions/userActions";
import { useState, useTransition } from "react";
import { Bell, Check, Trash2, Calendar, Megaphone, Info } from "lucide-react";
import { formatDateTimeDMY } from "@/lib/format";

interface NotificationsClientProps {
  initialNotifications: any[];
}

export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("all");
  const [isPending, startTransition] = useTransition();

  const handleMarkRead = (id: string) => {
    // Optimistic Update
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
    startTransition(async () => {
      await markNotificationRead(id);
    });
  };

  const handleMarkAllRead = () => {
    // Optimistic Update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    startTransition(async () => {
      await markAllNotificationsRead();
    });
  };

  const handleClearAll = () => {
    // Optimistic Update
    setNotifications([]);
    startTransition(async () => {
      await clearAllNotifications();
    });
  };

  // Filter Logic
  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.isRead;
    if (filter === "deadline") return notif.type === "REMINDER";
    if (filter === "announcement") return notif.type === "ANNOUNCEMENT";
    return true;
  });

  const getIcon = (type: string) => {
    if (type === "REMINDER") return <Calendar className="h-4.5 w-4.5 text-amber-500" />;
    if (type === "ANNOUNCEMENT") return <Megaphone className="h-4.5 w-4.5 text-blue-500" />;
    return <Info className="h-4.5 w-4.5 text-primary" />;
  };

  return (
    <div className="space-y-6">
      {/* Filtering and Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-border w-full sm:w-auto pb-1 overflow-x-auto scrollbar-none">
          {[
            { id: "all", label: t("all_notifs") },
            { id: "unread", label: t("unread_notifs") },
            { id: "deadline", label: t("deadline_notifs") },
            { id: "announcement", label: t("announcements") },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 -mb-[6px] ${
                filter === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleMarkAllRead}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
            >
              <Check className="h-3.5 w-3.5" />
              {t("mark_all_read")}
            </button>
            <button
              onClick={handleClearAll}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 text-xs font-bold text-muted-foreground hover:text-rose-500 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("clear_all")}
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkRead(notif.id)}
              className={`flex gap-4 p-4 rounded-lg border transition-all cursor-pointer ${
                notif.isRead
                  ? "bg-card border-border/60 hover:bg-muted/10 opacity-75"
                  : "bg-card border-primary/20 hover:border-primary/40 shadow-xs"
              }`}
            >
              {/* Icon Container */}
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                notif.isRead ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
              }`}>
                {getIcon(notif.type)}
              </div>

              {/* Message Details */}
              <div className="flex-1 space-y-0.5">
                <div className="flex justify-between items-start gap-2">
                  <h4 className={`font-bold text-sm sm:text-base ${notif.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                    {notif.title}
                  </h4>
                  {!notif.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {notif.content}
                </p>
                <span className="text-[10px] text-muted-foreground block font-semibold pt-1">
                  {formatDateTimeDMY(notif.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border border-dashed border-border rounded-lg bg-card">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 stroke-1" />
          <h3 className="font-extrabold text-lg text-foreground mb-1">
            {t("no_notifications")}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            We will alert you here as soon as new circulars are published or when tracked deadlines start nearing.
          </p>
        </div>
      )}
    </div>
  );
}
