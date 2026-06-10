import { getWorkspaceSubscribers } from "@/app/actions/workspaceActions";
import { NewsletterClient } from "./NewsletterClient";

export default async function WorkspaceNewslettersPage() {
  const res = await getWorkspaceSubscribers();

  if ("error" in res) {
    return <div className="text-rose-500">Error loading subscribers: {res.error}</div>;
  }

  return (
    <div className="space-y-6">
      <NewsletterClient subscribers={res.subscribers} />
    </div>
  );
}
