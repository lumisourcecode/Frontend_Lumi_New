import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";

const users = [
  {
    name: "Priya Singh",
    email: "ops.admin@lumiride.com.au",
    role: "Super Admin",
    access: "Full",
    status: "Active",
    mfa: "Enabled",
  },
  {
    name: "Ethan Clarke",
    email: "dispatch.lead@lumiride.com.au",
    role: "Dispatch Admin",
    access: "Dispatch + Trips",
    status: "Active",
    mfa: "Enabled",
  },
  {
    name: "Nora Lim",
    email: "billing@lumiride.com.au",
    role: "Billing Admin",
    access: "Billing + Reports",
    status: "Suspended",
    mfa: "Disabled",
  },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Create users, control permissions, enforce MFA, and monitor admin access events.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Total Admin Users</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">37</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Pending Invites</p>
          <p className="text-2xl font-bold text-amber-700">6</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">MFA Coverage</p>
          <p className="text-2xl font-bold text-emerald-700">92%</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Access Escalations</p>
          <p className="text-2xl font-bold text-red-700">2</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Add User</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input placeholder="Full name" />
          <Input placeholder="Email" type="email" />
          <Select>
            <option>Role: Super Admin</option>
            <option>Role: Dispatch Admin</option>
            <option>Role: Billing Admin</option>
            <option>Role: Support Admin</option>
          </Select>
          <Select>
            <option>Access: Full</option>
            <option>Access: Scoped by module</option>
            <option>Access: Read-only</option>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Invite User</Button>
          <Button variant="outline">Send Password Setup Link</Button>
          <Button variant="outline">Force MFA Enrollment</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Directory</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-3">User</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Access</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">MFA</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email} className="border-b">
                  <td className="py-2 pr-3">
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="py-2 pr-3">{user.role}</td>
                  <td className="py-2 pr-3">{user.access}</td>
                  <td className="py-2 pr-3">
                    <Badge tone={user.status === "Active" ? "certified" : "pending"}>{user.status}</Badge>
                  </td>
                  <td className="py-2 pr-3">
                    <Badge tone={user.mfa === "Enabled" ? "certified" : "danger"}>{user.mfa}</Badge>
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline">Edit</Button>
                      <Button variant="outline">Permissions</Button>
                      <Button variant="outline">Audit Log</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
