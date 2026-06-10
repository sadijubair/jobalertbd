import { getWorkspaceJobs } from "@/app/actions/workspaceActions";
import { JobsManagerClient } from "./JobsManagerClient";

export default async function WorkspaceJobsPage() {
  const res = await getWorkspaceJobs();

  if ("error" in res) {
    return <div className="text-rose-500">Error loading global circulars: {res.error}</div>;
  }

  return (
    <div className="space-y-6">
      <JobsManagerClient initialJobs={res.jobs} />
    </div>
  );
}
