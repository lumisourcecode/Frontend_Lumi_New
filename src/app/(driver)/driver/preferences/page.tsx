"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

export default function DriverPreferencesPage() {
  const [emergencyContact, setEmergencyContact] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ emergencyContact: string }>("/driver/profile", undefined, session.accessToken)
      .then((p) => setEmergencyContact(p.emergencyContact || ""))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setSaving(true);
    setMsg("");
    try {
      await apiJson("/driver/profile", {
        method: "PATCH",
        body: JSON.stringify({ emergencyContact }),
      }, session.accessToken);
      setMsg("Preferences saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#151F69] to-[#3C8FC8] text-white">
        <h1 className="text-2xl font-bold">Preferences & Settings</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Configure trip preferences, notifications, navigation defaults, and privacy settings.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Trip Preferences</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Select>
            <option>Preferred Trip Length: Medium</option>
            <option>Preferred Trip Length: Short</option>
            <option>Preferred Trip Length: Long</option>
          </Select>
          <Select>
            <option>Navigation App: Google Maps</option>
            <option>Navigation App: Apple Maps</option>
            <option>Navigation App: Waze</option>
          </Select>
          <Select>
            <option>Auto-Accept Trips: Off</option>
            <option>Auto-Accept Trips: On</option>
          </Select>
          <Select>
            <option>Service Zone Lock: Off</option>
            <option>Service Zone Lock: On</option>
          </Select>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Notification Settings</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Select>
            <option>Trip Alerts: Push + SMS</option>
            <option>Trip Alerts: Push Only</option>
            <option>Trip Alerts: SMS Only</option>
          </Select>
          <Select>
            <option>Payout Alerts: Enabled</option>
            <option>Payout Alerts: Disabled</option>
          </Select>
          <Input
            placeholder="Emergency contact (name + phone)"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
          />
        </div>
        {loading ? (
          <p className="mt-3 text-sm text-slate-500">Loading...</p>
        ) : (
          <>
            <Button className="mt-3" disabled={saving} onClick={save}>
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
            {msg ? <p className="mt-2 text-sm text-slate-600">{msg}</p> : null}
          </>
        )}
      </Card>
    </div>
  );
}
