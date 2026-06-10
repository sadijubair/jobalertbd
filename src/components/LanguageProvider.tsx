"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Locale = "en" | "bn";

const translations = {
  en: {
    // Navigation
    nav_home: "Home",
    nav_search: "Search",
    nav_my_jobs: "My Jobs",
    nav_notifications: "Notifications",
    nav_profile: "Profile",
    nav_settings: "Settings",
    nav_workspace: "Workspace",

    // General
    days_left: "Days Left",
    day_left: "Day Left",
    today: "Today",
    yesterday: "Yesterday",
    expired: "Expired",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    logout: "Logout",
    login: "Login",
    or: "or",
    back: "Back",
    confirm: "Confirm",

    // Home / Search Screen
    search_placeholder: "Search organization or post name...",
    search_filters: "Search Filters",
    filter_all: "All Jobs",
    filter_today: "Deadline Today",
    filter_3days: "Deadline Within 3 Days",
    filter_7days: "Deadline Within 7 Days",
    filter_15days: "Deadline Within 15 Days",
    filter_newest: "Newest Jobs",
    filter_most_saved: "Most Saved",
    filter_featured: "Featured",
    featured_jobs: "Featured Jobs",
    latest_jobs: "Latest Jobs",
    deadline_soon: "Deadline Soon",
    popular_jobs: "Popular Jobs",
    no_jobs_found: "No jobs found",
    
    // Job details
    org: "Organization",
    app_fee: "Application Fee",
    app_link: "Application Link",
    circular_link: "Circular Link",
    deadline: "Deadline",
    posts: "Posts",
    post_name: "Post Name",
    vacancy: "Vacancy",
    grade: "Grade",
    save_job: "Save Job",
    unsave_job: "Tracking",
    share: "Share",
    apply: "Apply Now",
    report_issue: "Report an issue",

    // User Panel - Dashboard
    dashboard_title: "Dashboard",
    tracked_jobs: "Tracked Jobs",
    upcoming_deadlines: "Upcoming Deadlines",
    recent_activity: "Recent Activity",
    no_activity: "No recent activity",

    // User Panel - Add Job
    add_job_title: "Add Personal Job",
    add_job_desc: "Create a job circular to track its deadline. Only visible to you.",
    posts_list: "Posts in this circular",
    add_post: "Add Post",
    saving_job: "Saving Job...",

    // Newsletter
    newsletter_title: "Stay Alerted!",
    newsletter_desc: "Subscribe to our newsletter to receive the latest job circulars and deadline alerts straight to your inbox.",
    subscribe: "Subscribe",
    subscribing: "Subscribing...",
    email_placeholder: "Enter your email address",
    subscribe_success: "Thank you for subscribing!",

    // Settings
    settings_title: "Settings",
    theme: "Theme",
    theme_light: "Light",
    theme_dark: "Dark",
    theme_system: "System",
    language: "Language",
    language_en: "English",
    language_bn: "বাংলা",
    notification_settings: "Notification Preferences",
    new_jobs_alert: "New Job Published Alerts",
    alert_15d: "15 Days Before Deadline",
    alert_7d: "7 Days Before Deadline",
    alert_3d: "3 Days Before Deadline",
    alert_0d: "On Deadline Day",
    delivery_in_app: "In-App Notification Center",
    delivery_push: "Push Notification",
    delivery_email: "Email Notification",

    // Notification Center
    notifications_title: "Notification Center",
    all_notifs: "All",
    unread_notifs: "Unread",
    deadline_notifs: "Deadlines",
    announcements: "Announcements",
    mark_all_read: "Mark all as read",
    clear_all: "Clear all",
    no_notifications: "You're all caught up! No notifications.",
  },
  bn: {
    // Navigation
    nav_home: "হোম",
    nav_search: "সার্চ",
    nav_my_jobs: "আমার জবস",
    nav_notifications: "নোটিফিকেশন",
    nav_profile: "প্রোফাইল",
    nav_settings: "সেটিংস",
    nav_workspace: "ওয়ার্কস্পেস",

    // General
    days_left: "দিন বাকি",
    day_left: "দিন বাকি",
    today: "আজ",
    yesterday: "গতকাল",
    expired: "মেয়াদ শেষ",
    loading: "লোডিং...",
    save: "সংরক্ষণ করুন",
    cancel: "বাতিল",
    delete: "মুছে ফেলুন",
    edit: "সম্পাদনা",
    logout: "লগআউট",
    login: "লগইন",
    or: "অথবা",
    back: "ফিরে যান",
    confirm: "নিশ্চিত করুন",

    // Home / Search Screen
    search_placeholder: "প্রতিষ্ঠান বা পদের নাম দিয়ে খুঁজুন...",
    search_filters: "সার্চ ফিল্টারসমূহ",
    filter_all: "সব সার্কুলার",
    filter_today: "আজই শেষ দিন",
    filter_3days: "৩ দিনের মধ্যে শেষ",
    filter_7days: "৭ দিনের মধ্যে শেষ",
    filter_15days: "১৫ দিনের মধ্যে শেষ",
    filter_newest: "নতুন সার্কুলার",
    filter_most_saved: "জনপ্রিয় ট্র্যাকড",
    filter_featured: "ফিচার্ড",
    featured_jobs: "ফিচার্ড সার্কুলার",
    latest_jobs: "সাম্প্রতিক সার্কুলার",
    deadline_soon: "শীঘ্রই শেষ হচ্ছে",
    popular_jobs: "জনপ্রিয় সার্কুলার",
    no_jobs_found: "কোন সার্কুলার পাওয়া যায়নি",

    // Job details
    org: "প্রতিষ্ঠান",
    app_fee: "আবেদন ফি",
    app_link: "আবেদনের লিংক",
    circular_link: "মূল সার্কুলার লিংক",
    deadline: "আবেদনের শেষ তারিখ",
    posts: "পদসমূহ",
    post_name: "পদের নাম",
    vacancy: "পদ সংখ্যা",
    grade: "গ্রেড",
    save_job: "ট্র্যাক করুন",
    unsave_job: "ট্র্যাকিং চলছে",
    share: "শেয়ার",
    apply: "আবেদন করুন",
    report_issue: "রিপোর্ট করুন",

    // User Panel - Dashboard
    dashboard_title: "ড্যাশবোর্ড",
    tracked_jobs: "ট্র্যাক করা সার্কুলার",
    upcoming_deadlines: "আসন্ন ডেডলাইন",
    recent_activity: "সাম্প্রতিক কার্যক্রম",
    no_activity: "কোন সাম্প্রতিক কার্যক্রম নেই",

    // User Panel - Add Job
    add_job_title: "ব্যক্তিগত সার্কুলার যোগ করুন",
    add_job_desc: "ডেডলাইন ট্র্যাক করার জন্য একটি সার্কুলার তৈরি করুন। এটি শুধুমাত্র আপনি দেখতে পাবেন।",
    posts_list: "সার্কুলারের পদসমূহ",
    add_post: "পদ যোগ করুন",
    saving_job: "সংরক্ষণ করা হচ্ছে...",

    // Newsletter
    newsletter_title: "সবসময় আপডেটেড থাকুন!",
    newsletter_desc: "আমাদের নিউজলেটারে সাবস্ক্রাইব করুন এবং আপনার ইনবক্সে সরাসরি সর্বশেষ চাকরির সার্কুলার এবং ডেডলাইনের সতর্কতা পান।",
    subscribe: "সাবস্ক্রাইব করুন",
    subscribing: "সাবস্ক্রাইব করা হচ্ছে...",
    email_placeholder: "আপনার ইমেল এড্রেস লিখুন",
    subscribe_success: "সাবস্ক্রাইব করার জন্য ধন্যবাদ!",

    // Settings
    settings_title: "সেটিংস",
    theme: "থিম",
    theme_light: "লাইট মোড",
    theme_dark: "ডার্ক মোড",
    theme_system: "সিস্টেম ডিফল্ট",
    language: "ভাষা",
    language_en: "English",
    language_bn: "বাংলা",
    notification_settings: "নোটিফিকেশন সেটিংসমূহ",
    new_jobs_alert: "নতুন সার্কুলার প্রকাশ বিজ্ঞপ্তি",
    alert_15d: "ডেডলাইনের ১৫ দিন আগে",
    alert_7d: "ডেডলাইনের ৭ দিন আগে",
    alert_3d: "ডেডলাইনের ৩ দিন আগে",
    alert_0d: "ডেডলাইনের শেষ দিনে",
    delivery_in_app: "ইন-অ্যাপ নোটিফিকেশন সেন্টার",
    delivery_push: "পুশ নোটিফিকেশন",
    delivery_email: "ইমেইল নোটিফিকেশন",

    // Notification Center
    notifications_title: "নোটিফিকেশন সেন্টার",
    all_notifs: "সব",
    unread_notifs: "অপঠিত",
    deadline_notifs: "ডেডলাইন",
    announcements: "ঘোষণাসমূহ",
    mark_all_read: "সব পঠিত চিহ্নিত করুন",
    clear_all: "সব মুছে ফেলুন",
    no_notifications: "সব নোটিফিকেশন চেক করা হয়েছে! কোন নোটিফিকেশন নেই।",
  },
};

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof typeof translations.en) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const savedLocale = localStorage.getItem("jobalert_locale") as Locale;
    if (savedLocale === "en" || savedLocale === "bn") {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("jobalert_locale", newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = (key: keyof typeof translations.en): string => {
    return translations[locale][key] || translations["en"][key] || (key as string);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
