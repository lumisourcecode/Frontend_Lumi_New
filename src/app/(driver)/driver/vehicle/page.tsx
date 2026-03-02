"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Profile = { vehicleMake: string; vehicleRego: string; vehicleColor: string; verificationStatus: string };

export default function DriverVehiclePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleRego, setVehicleRego] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<Profile & { email: string; fullName: string; phone: string }>("/driver/profile", undefined, session.accessToken)
      .then((p) => {
        setProfile(p);
        setVehicleMake(p.vehicleMake);
        setVehicleRego(p.vehicleRego);
        setVehicleColor(p.vehicleColor);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function saveVehicle() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setSaving(true);
    setMsg("");
    try {
      await apiJson("/driver/profile", {
        method: "PATCH",
        body: JSON.stringify({ vehicleMake, vehicleRego, vehicleColor }),
      }, session.accessToken);
      setMsg("Vehicle details saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#1A216A] to-[#2183B8] text-white">
        <h1 className="text-2xl font-bold">Vehicle & Equipment</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Keep vehicle details, maintenance, accessibility equipment, and permits up to date.
        </p>
        <Link href="/driver/onboard" className="mt-2 inline-block text-sm text-indigo-200 underline">
          Complete onboarding &rarr;
        </Link>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Vehicle Profile</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Input
              value={vehicleMake}
              onChange={(e) => setVehicleMake(e.target.value)}
              placeholder="Vehicle make/model"
            />
            <Input
              value={vehicleRego}
              onChange={(e) => setVehicleRego(e.target.value)}
              placeholder="Registration"
            />
            <Input
              value={vehicleColor}
              onChange={(e) => setVehicleColor(e.target.value)}
              placeholder="Color"
            />
            <Select>
              <option>Wheelchair-capable: Yes</option>
              <option>Wheelchair-capable: No</option>
            </Select>
            <Input placeholder="Registration expiry" type="date" />
            <Input placeholder="Insurance expiry" type="date" />
          </div>
          {loading ? (
            <p className="mt-3 text-sm text-slate-500">Loading...</p>
          ) : (
            <>
              <Button className="mt-3" disabled={saving} onClick={saveVehicle}>
                {saving ? "Saving..." : "Save Vehicle Details"}
              </Button>
              {msg ? <p className="mt-2 text-sm text-slate-600">{msg}</p> : null}
            </>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Maintenance Log</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="rounded-xl border border-slate-200 p-3">Last service: 2026-01-12 <Badge tone="certified">Passed</Badge></div>
            <div className="rounded-xl border border-slate-200 p-3">Tire check: 2026-02-01 <Badge tone="certified">Passed</Badge></div>
            <div className="rounded-xl border border-slate-200 p-3">Lift inspection due: 2026-02-20 <Badge tone="pending">Due Soon</Badge></div>
          </div>
          <Textarea className="mt-3" placeholder="Report vehicle issue or damage..." />
          <Button className="mt-3" variant="outline">Submit Maintenance Ticket</Button>
        </Card>
      </div>
    </div>
  );
}
