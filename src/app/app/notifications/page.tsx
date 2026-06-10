import { getSession } from "@/lib/auth";
import { getUserNotifications } from "@/app/actions/userActions";
import { Header } from "@/components/Header";
import { NotificationsClient } from "./NotificationsClient";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "USER") {
    redirect("/api/auth/google");
  }

  const res = await getUserNotifications();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Global Header */}
      <Header session={session} />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 py-6 pb-24 md:pb-12">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">
          Notification Center
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Stay on top of deadlines and important system announcements.
        </p>

        <NotificationsClient
          initialNotifications={res.notifications}
        />
      </main>
    </div>
  );
}
