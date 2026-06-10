import { getWorkspaceUsers } from "@/app/actions/workspaceActions";
import { UsersManagerClient } from "./UsersManagerClient";

export default async function WorkspaceUsersPage() {
  const res = await getWorkspaceUsers();

  if ("error" in res) {
    return <div className="text-rose-500">Error loading users: {res.error}</div>;
  }

  return (
    <div className="space-y-6">
      <UsersManagerClient initialUsers={res.users} />
    </div>
  );
}
