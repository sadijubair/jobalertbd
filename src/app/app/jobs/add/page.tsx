import { getSession } from "@/lib/auth";
import { Header } from "@/components/Header";
import { AddJobForm } from "./AddJobForm";
import { redirect } from "next/navigation";

export default async function AddJobPage() {
  const session = await getSession();
  
  if (!session || session.role !== "USER") {
    redirect("/api/auth/google");
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Global Header */}
      <Header session={session} />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 py-6 pb-24 md:pb-12">
        <AddJobForm />
      </main>
    </div>
  );
}
