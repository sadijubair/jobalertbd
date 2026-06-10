import { getSession } from "@/lib/auth";
import { getUserSettings } from "@/app/actions/userActions";
import { Header } from "@/components/Header";
import { ProfileClient } from "./ProfileClient";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getSession();
  
  if (!session || session.role !== "USER") {
    redirect("/api/auth/google");
  }

  const res = await getUserSettings();
  if ("error" in res || !res.preferences) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header session={session} />
        <main className="flex-1 p-6 text-center text-rose-500">
          Error loading preferences: {res.error}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Global Header */}
      <Header session={session} />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 py-6 pb-24 md:pb-12">
        <ProfileClient
          session={session}
          initialPreferences={res.preferences}
        />
      </main>
    </div>
  );
}
