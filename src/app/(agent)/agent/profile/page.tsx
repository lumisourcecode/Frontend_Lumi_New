"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Profile = { email: string; orgName: string; contactName: string };

export default function PartnerProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orgName, setOrgName] = useState("");
  const [contactName, setContactName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<Profile>("/partner/profile", undefined, session.accessToken)
      .then((p) => {
        setProfile(p);
        setOrgName(p.orgName);
        setContactName(p.contactName);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setSaving(true);
    setMsg("");
    try {
      await apiJson("/partner/profile", {
        method: "PATCH",
        body: JSON.stringify({ orgName, contactName }),
      }, session.accessToken);
      setMsg("Profile saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Partner Profile</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Update your organization details and contact information. This appears on client communications.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Organization & Contact</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Input
            value={profile?.email ?? ""}
            placeholder="Email"
            disabled
            title="Email cannot be changed here"
          />
          <Input
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Organization Name"
          />
          <Input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Contact Name"
          />
        </div>
        {loading ? (
          <p className="mt-2 text-sm text-slate-500">Loading...</p>
        ) : (
          <div className="mt-3 flex gap-2">
            <Button disabled={saving} onClick={saveProfile}>
              {saving ? "Saving..." : "Save Profile"}
            </Button>
            {msg ? <span className="text-sm text-slate-600">{msg}</span> : null}
          </div>
        )}
      </Card>
    </div>
  );
}
