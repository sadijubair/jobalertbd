import { getSession } from "@/lib/auth";
import { WorkspaceLogin } from "./WorkspaceLogin";
import { redirect } from "next/navigation";

export default async function WorkspacePage() {
  const session = await getSession();

  if (session && session.role === "ADMIN") {
    redirect("/workspace/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
      <WorkspaceLogin />
    </div>
  );
}
