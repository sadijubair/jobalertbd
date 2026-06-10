"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { updateUserSettings, savePushSubscriptionAction } from "@/app/actions/userActions";
import { subscribeToPushNotifications } from "@/components/PWARegister";
import { useTheme } from "next-themes";
import { useState, useTransition } from "react";
import type { ComponentType } from "react";
import { Sun, Bell, Shield, Mail, BellRing, LogOut, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LanguageSwitchIcon } from "@/components/AppIcons";

interface ProfileClientProps {
  session: {
    userId: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
  };
  initialPreferences: {
    newJobsEnabled: boolean;
    deadline15Days: boolean;
    deadline7Days: boolean;
    deadline3Days: boolean;
    deadlineToday: boolean;
    inAppEnabled: boolean;
    pushEnabled: boolean;
    emailEnabled: boolean;
  };
}

export function ProfileClient({ session, initialPreferences }: ProfileClientProps) {
  const { t, locale, setLocale } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [, startTransition] = useTransition();

  // Notification Preferences States
  const [prefs, setPrefs] = useState(initialPreferences);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleToggle = (field: keyof typeof initialPreferences) => {
    const isEnablingPush = field === "pushEnabled" && !prefs.pushEnabled;
    const updated = { ...prefs, [field]: !prefs[field] };
    
    setPrefs(updated);

    // Auto-save preference changes
    startTransition(async () => {
      if (isEnablingPush) {
        const subscription = await subscribeToPushNotifications();
        if (subscription) {
          const auth = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!)));
          const p256dh = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!)));
          await savePushSubscriptionAction({
            endpoint: subscription.endpoint,
            keys: { auth, p256dh },
          });
        } else {
          alert("Web Push registration failed. Please verify that notifications are enabled in your browser settings.");
          setPrefs(prev => ({ ...prev, pushEnabled: false }));
          return;
        }
      }

      const res = await updateUserSettings(updated);
      if (res.success) {
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);
      }
    });
  };

  const deadlineOptions: { id: keyof typeof initialPreferences; label: string }[] = [
    { id: "deadline15Days", label: t("alert_15d") },
    { id: "deadline7Days", label: t("alert_7d") },
    { id: "deadline3Days", label: t("alert_3d") },
    { id: "deadlineToday", label: t("alert_0d") },
  ];

  const deliveryOptions: {
    id: keyof typeof initialPreferences;
    label: string;
    icon: ComponentType<{ className?: string }>;
  }[] = [
    { id: "inAppEnabled", label: t("delivery_in_app"), icon: BellRing },
    { id: "pushEnabled", label: t("delivery_push"), icon: Bell },
    { id: "emailEnabled", label: t("delivery_email"), icon: Mail },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="p-6 rounded-lg border border-border bg-card shadow-sm flex items-center gap-4">
        <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-primary/20 bg-muted">
          {session.avatar ? (
            <img
              src={session.avatar}
              alt={session.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-lg font-extrabold text-primary">
              {session.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h2 className="font-extrabold text-xl text-foreground leading-tight">
            {session.name}
          </h2>
          <p className="text-sm text-muted-foreground">{session.email}</p>
          <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
            {session.role}
          </span>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="space-y-4">
        {/* 1. Appearance & Language */}
        <div className="p-6 rounded-lg border border-border bg-card shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-foreground flex items-center gap-2 border-b border-border/40 pb-2.5">
            <Shield className="h-5 w-5 text-primary" />
            General Settings
          </h3>

          {/* Theme Selection */}
          <div className="flex justify-between items-center py-1.5">
            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              {t("theme")}
            </span>
            <div className="flex bg-muted p-1 rounded-lg gap-1">
              {[
                { id: "light", label: t("theme_light") },
                { id: "dark", label: t("theme_dark") },
                { id: "system", label: t("theme_system") },
              ].map((tOpt) => (
                <button
                  key={tOpt.id}
                  onClick={() => setTheme(tOpt.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    theme === tOpt.id
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tOpt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div className="flex justify-between items-center py-1.5 border-t border-border/40 pt-3">
            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
              <LanguageSwitchIcon className="h-4 w-4 text-muted-foreground" />
              {t("language")}
            </span>
            <div className="flex bg-muted p-1 rounded-lg gap-1">
              {[
                { id: "en", label: t("language_en") },
                { id: "bn", label: t("language_bn") },
              ].map((langOpt) => (
                <button
                  key={langOpt.id}
                  onClick={() => setLocale(langOpt.id as "en" | "bn")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    locale === langOpt.id
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {langOpt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Notification Preferences */}
        <div className="p-6 rounded-lg border border-border bg-card shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
            <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              {t("notification_settings")}
            </h3>
            {showSaveSuccess && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="h-3 w-3" /> Auto-Saved
              </span>
            )}
          </div>

          {/* New Job Alert Toggle */}
          <div className="flex justify-between items-center py-1">
            <div>
              <span className="text-sm font-bold text-foreground block">{t("new_jobs_alert")}</span>
              <span className="text-[11px] text-muted-foreground">Receive updates when admins add global circulars</span>
            </div>
            <Switch
              id="new-jobs-enabled"
              checked={prefs.newJobsEnabled}
              onCheckedChange={() => handleToggle("newJobsEnabled")}
            />
          </div>

          {/* Timeline Thresholds */}
          <div className="space-y-3 pt-3 border-t border-border/40">
            <span className="text-xs font-bold text-muted-foreground uppercase block">Deadline Warning Days</span>
            {deadlineOptions.map((dOpt) => (
              <div key={dOpt.id} className="flex justify-between items-center">
                <Label htmlFor={dOpt.id} className="text-xs font-semibold text-foreground">
                  {dOpt.label}
                </Label>
                <Switch
                  id={dOpt.id}
                  size="sm"
                  checked={prefs[dOpt.id]}
                  onCheckedChange={() => handleToggle(dOpt.id)}
                />
              </div>
            ))}
          </div>

          {/* Delivery Channels */}
          <div className="space-y-3 pt-3 border-t border-border/40">
            <span className="text-xs font-bold text-muted-foreground uppercase block">Delivery Channels</span>
            {deliveryOptions.map((chanOpt) => {
              const Icon = chanOpt.icon;
              return (
                <div key={chanOpt.id} className="flex justify-between items-center py-1">
                  <Label htmlFor={chanOpt.id} className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {chanOpt.label}
                  </Label>
                  <Switch
                    id={chanOpt.id}
                    size="sm"
                    checked={prefs[chanOpt.id]}
                    onCheckedChange={() => handleToggle(chanOpt.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Actions / Logout */}
        <div className="pt-2">
          <a
            href="/api/auth/logout"
            className="w-full flex items-center justify-center gap-2 p-4 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-500 font-extrabold text-sm hover:bg-rose-500/10 transition-all text-center"
          >
            <LogOut className="h-4.5 w-4.5" />
            {t("logout")}
          </a>
        </div>
      </div>
    </div>
  );
}
