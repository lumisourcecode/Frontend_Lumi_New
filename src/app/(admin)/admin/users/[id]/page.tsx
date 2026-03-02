"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge, Button, Card, Input } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";
import { PasswordStrength, getPasswordStrength } from "@/components/auth/password-strength";

type UserDetail = {
  user: { id: string; email: string; is_active: boolean; is_super_admin?: boolean; roles: string[]; created_at: string };
  riderProfile: { full_name: string; phone: string; ndis_id: string } | null;
  driverProfile: { full_name: string; phone: string; vehicle_rego: string; verification_status: string } | null;
  agentProfile: { org_name: string; contact_name: string } | null;
  adminProfile: { display_name: string } | null;
  bookingsCount: number;
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<UserDetail | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<"rider" | "driver" | "agent" | "admin" | false>(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    ndisId: "",
    vehicleRego: "",
    orgName: "",
    contactName: "",
    displayName: "",
  });
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [sendEmail, setSendEmail] = useState(true);

  const session = getAuthSession();

  useEffect(() => {
    if (!session?.accessToken) {
      setError("Please login as admin.");
      return;
    }
    apiJson<UserDetail>(`/admin/users/${id}`, undefined, session.accessToken)
      .then((d) => {
        setData(d);
        const r = d.riderProfile;
        const dr = d.driverProfile;
        const a = d.agentProfile;
        const ad = d.adminProfile;
        setForm({
          fullName: r?.full_name || dr?.full_name || a?.contact_name || ad?.display_name || "",
          phone: r?.phone || dr?.phone || "",
          ndisId: r?.ndis_id || "",
          vehicleRego: dr?.vehicle_rego || "",
          orgName: a?.org_name || "",
          contactName: a?.contact_name || "",
          displayName: ad?.display_name || "",
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [id, session?.accessToken]);

  async function saveProfile() {
    if (!session?.accessToken) return;
    setSaving(true);
    setMsg("");
    try {
      await apiJson(`/admin/users/${id}/profile`, {
        method: "PUT",
        body: JSON.stringify({
          fullName: form.fullName || undefined,
          phone: form.phone || undefined,
          ndisId: form.ndisId || undefined,
          vehicleRego: form.vehicleRego || undefined,
          orgName: form.orgName || undefined,
          contactName: form.contactName || undefined,
          displayName: form.displayName || undefined,
        }),
      }, session.accessToken);
      setMsg("Profile saved.");
      setEditing(false as const);
      apiJson<UserDetail>(`/admin/users/${id}`, undefined, session.accessToken).then(setData);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!session?.accessToken) return;
    const { score } = getPasswordStrength(newPassword);
    if (score < 3 || newPassword.length < 8) {
      setMsg("Use a stronger password (8+ chars, upper & lower, number, symbol)");
      return;
    }
    setSaving(true);
    setMsg("");
    try {
      await apiJson(`/admin/users/${id}/change-password`, {
        method: "POST",
        body: JSON.stringify({ newPassword, sendEmail }),
      }, session.accessToken);
      setMsg(sendEmail ? "Password updated and email sent to user." : "Password updated.");
      setChangePwOpen(false);
      setNewPassword("");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive() {
    if (!session?.accessToken || !data) return;
    if (data.user.is_super_admin) return;
    setSaving(true);
    try {
      await apiJson(`/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !data.user.is_active }),
      }, session.accessToken);
      setData((prev) => prev ? { ...prev, user: { ...prev.user, is_active: !prev.user.is_active } } : null);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  if (error) return <Card><p className="text-red-600">{error}</p></Card>;
  if (!data) return <Card><p>Loading...</p></Card>;

  const { user, riderProfile, driverProfile, agentProfile, adminProfile, bookingsCount } = data;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/admin/users"><Button variant="outline">← Back</Button></Link>
      </div>
      <Card>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">User Detail</h1>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Roles:</strong> {user.roles.join(", ")}</p>
          <p><strong>Status:</strong> <Badge tone={user.is_active ? "certified" : "pending"}>{user.is_active ? "Active" : "Suspended"}</Badge></p>
          <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
        </div>
        {!user.is_super_admin && (
          <Button
            className="mt-3"
            variant={user.is_active ? "danger" : "primary"}
            disabled={saving}
            onClick={toggleActive}
          >
            {user.is_active ? "Suspend User" : "Activate User"}
          </Button>
        )}
        <div className="mt-4 border-t border-slate-200 pt-4">
          <h3 className="font-medium text-slate-700">Change Password (Super Admin only)</h3>
          <p className="mt-1 text-sm text-slate-500">Set a new password and optionally email it to the user.</p>
          {changePwOpen ? (
            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">New password</label>
                <Input
                  type="password"
                  placeholder="8+ chars, symbol, number"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="max-w-xs"
                />
                <PasswordStrength password={newPassword} inline />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                />
                Email new password to user
              </label>
              <div className="flex gap-2">
                <Button disabled={saving} onClick={changePassword}>Update & Send</Button>
                <Button variant="outline" onClick={() => { setChangePwOpen(false); setNewPassword(""); }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="mt-2" onClick={() => setChangePwOpen(true)}>Change Password</Button>
          )}
        </div>
      </Card>
      {riderProfile && (
        <Card>
          <h2 className="font-bold text-[var(--color-primary)]">Rider Profile</h2>
          {editing === "rider" ? (
            <div className="mt-3 space-y-3">
              <Input placeholder="Full name" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
              <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              <Input placeholder="NDIS ID" value={form.ndisId} onChange={(e) => setForm((p) => ({ ...p, ndisId: e.target.value }))} />
              <p className="text-sm">Bookings: {bookingsCount}</p>
              <div className="flex gap-2">
                <Button disabled={saving} onClick={saveProfile}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="mt-2 grid gap-2 text-sm">
              <p>Name: {riderProfile.full_name || "-"}</p>
              <p>Phone: {riderProfile.phone || "-"}</p>
              <p>NDIS ID: {riderProfile.ndis_id || "-"}</p>
              <p>Bookings: {bookingsCount}</p>
              <Button variant="outline" className="mt-2" onClick={() => setEditing("rider")}>Edit Profile</Button>
            </div>
          )}
        </Card>
      )}
      {driverProfile && (
        <Card>
          <h2 className="font-bold text-[var(--color-primary)]">Driver Profile</h2>
          {editing === "driver" ? (
            <div className="mt-3 space-y-3">
              <Input placeholder="Full name" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
              <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              <Input placeholder="Vehicle rego" value={form.vehicleRego} onChange={(e) => setForm((p) => ({ ...p, vehicleRego: e.target.value }))} />
              <p className="text-sm">Verification: <Badge tone={driverProfile.verification_status === "Approved" ? "certified" : "pending"}>{driverProfile.verification_status}</Badge></p>
              <div className="flex gap-2">
                <Button disabled={saving} onClick={saveProfile}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="mt-2 grid gap-2 text-sm">
              <p>Name: {driverProfile.full_name || "-"}</p>
              <p>Phone: {driverProfile.phone || "-"}</p>
              <p>Vehicle: {driverProfile.vehicle_rego || "-"}</p>
              <p>Verification: <Badge tone={driverProfile.verification_status === "Approved" ? "certified" : "pending"}>{driverProfile.verification_status}</Badge></p>
              <Button variant="outline" className="mt-2" onClick={() => setEditing("driver")}>Edit Profile</Button>
            </div>
          )}
        </Card>
      )}
      {agentProfile && (
        <Card>
          <h2 className="font-bold text-[var(--color-primary)]">Agent Profile</h2>
          {editing === "agent" ? (
            <div className="mt-3 space-y-3">
              <Input placeholder="Org name" value={form.orgName} onChange={(e) => setForm((p) => ({ ...p, orgName: e.target.value }))} />
              <Input placeholder="Contact name" value={form.contactName} onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))} />
              <div className="flex gap-2">
                <Button disabled={saving} onClick={saveProfile}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="mt-2 grid gap-2 text-sm">
              <p>Org: {agentProfile.org_name || "-"}</p>
              <p>Contact: {agentProfile.contact_name || "-"}</p>
              <Button variant="outline" className="mt-2" onClick={() => setEditing("agent")}>Edit Profile</Button>
            </div>
          )}
        </Card>
      )}
      {adminProfile && (
        <Card>
          <h2 className="font-bold text-[var(--color-primary)]">Admin Profile</h2>
          {editing === "admin" ? (
            <div className="mt-3 space-y-3">
              <Input placeholder="Display name" value={form.displayName} onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))} />
              <div className="flex gap-2">
                <Button disabled={saving} onClick={saveProfile}>Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="mt-2 grid gap-2 text-sm">
              <p>Display: {adminProfile.display_name || "-"}</p>
              <Button variant="outline" className="mt-2" onClick={() => setEditing("admin")}>Edit Profile</Button>
            </div>
          )}
        </Card>
      )}
      {msg ? <p className="text-sm text-slate-600">{msg}</p> : null}
    </div>
  );
}
