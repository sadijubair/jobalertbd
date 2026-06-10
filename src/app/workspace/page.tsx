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
      {/* Decorative Blur */}
      <div className="absolute top-[10%] left-[20%] h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[100px]" />
      <div className="absolute bottom-[10%] right-[20%] h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[100px]" />
      
      <WorkspaceLogin />
    </div>
  );
}
