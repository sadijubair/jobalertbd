import { getCommunityDiscoveries } from "@/app/actions/workspaceActions";
import { CommunityDiscoveriesClient } from "./CommunityDiscoveriesClient";

export default async function WorkspaceCommunityPage() {
  const res = await getCommunityDiscoveries();

  if ("error" in res) {
    return <div className="text-rose-500">Error loading community discoveries: {res.error}</div>;
  }

  return (
    <div className="space-y-6">
      <CommunityDiscoveriesClient initialJobs={res.jobs} />
    </div>
  );
}
