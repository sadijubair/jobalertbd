import { getReports } from "@/app/actions/workspaceActions";
import { ReportsClient } from "./ReportsClient";

export default async function WorkspaceReportsPage() {
  const res = await getReports();

  if ("error" in res) {
    return <div className="text-rose-500">Error loading reports: {res.error}</div>;
  }

  return (
    <div className="space-y-6">
      <ReportsClient initialReports={res.reports} />
    </div>
  );
}
