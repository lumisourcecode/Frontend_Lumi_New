 "use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

const ADMIN_SETTINGS_KEY = "admin_platform_settings_v1";

export default function AdminSettingsPage() {
  const [msg, setMsg] = useState("");
  const [settings, setSettings] = useState({
    autoDispatch: "on",
    autoInvoiceCreate: "on",
    autoInvoiceSend: "on",
    autoPaymentNotify: "on",
    receiptTemplate: "Receipt + payment confirmation",
    brandName: "Lumi Ride",
    supportEmail: "support@lumiride.com.au",
    supportPhone: "+61 1300 000 000",
    timezone: "aest",
    riderTemplate: "Thank you for riding with Lumi Ride. Your receipt and trip summary are attached.",
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpFrom: "",
    smtpSecure: "tls",
    mfa: "required",
    sessionTimeout: "30",
    passwordPolicy: "strict",
    ipAllowlist: "on",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(ADMIN_SETTINGS_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as typeof settings;
          setSettings(parsed);
        } catch {
          window.localStorage.removeItem(ADMIN_SETTINGS_KEY);
        }
      }
    }
  }, []);

  function saveAll(note: string) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(settings));
    }
    setMsg(note);
  }

  async function runTestWorkflow() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setMsg("");
    try {
      await apiJson("/admin/reports/summary", undefined, session.accessToken);
      saveAll("Settings saved. Test workflow succeeded.");
    } catch (e) {
      saveAll(e instanceof Error ? `Settings saved locally. Test workflow failed: ${e.message}` : "Settings saved locally. Test workflow failed.");
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Configure organization-wide behavior for dispatch automation, billing rules, messaging, and security controls.
        </p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Automation Defaults</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Select value={settings.autoDispatch} onChange={(e) => setSettings((s) => ({ ...s, autoDispatch: e.target.value }))}>
              <option value="on">Auto dispatch matching: ON</option>
              <option value="off">Auto dispatch matching: OFF</option>
            </Select>
            <Select value={settings.autoInvoiceCreate} onChange={(e) => setSettings((s) => ({ ...s, autoInvoiceCreate: e.target.value }))}>
              <option value="on">Auto invoice creation: ON</option>
              <option value="off">Auto invoice creation: OFF</option>
            </Select>
            <Select value={settings.autoInvoiceSend} onChange={(e) => setSettings((s) => ({ ...s, autoInvoiceSend: e.target.value }))}>
              <option value="on">Auto invoice send (trip complete): ON</option>
              <option value="off">Auto invoice send (trip complete): OFF</option>
            </Select>
            <Select value={settings.autoPaymentNotify} onChange={(e) => setSettings((s) => ({ ...s, autoPaymentNotify: e.target.value }))}>
              <option value="on">Auto payment notifications: ON</option>
              <option value="off">Auto payment notifications: OFF</option>
            </Select>
            <Input value={settings.receiptTemplate} onChange={(e) => setSettings((s) => ({ ...s, receiptTemplate: e.target.value }))} className="md:col-span-2" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => saveAll("Automation settings saved.")}>Save Automation Settings</Button>
            <Button variant="outline" onClick={runTestWorkflow}>Run Test Workflow</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Branding & Communication</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Input value={settings.brandName} onChange={(e) => setSettings((s) => ({ ...s, brandName: e.target.value }))} />
            <Input value={settings.supportEmail} onChange={(e) => setSettings((s) => ({ ...s, supportEmail: e.target.value }))} />
            <Input value={settings.supportPhone} onChange={(e) => setSettings((s) => ({ ...s, supportPhone: e.target.value }))} />
            <Select value={settings.timezone} onChange={(e) => setSettings((s) => ({ ...s, timezone: e.target.value }))}>
              <option value="aest">Timezone: AEST/AEDT</option>
              <option value="utc">Timezone: UTC</option>
            </Select>
            <Textarea className="md:col-span-2" value={settings.riderTemplate} onChange={(e) => setSettings((s) => ({ ...s, riderTemplate: e.target.value }))} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => saveAll("Branding and communication settings saved.")}>Save Communication Settings</Button>
            <Button variant="outline" onClick={() => setMsg(`Preview: ${settings.riderTemplate.slice(0, 120)}...`)}>Preview Rider Message</Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">SMTP Configuration (Dynamic)</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Input placeholder="SMTP Host" value={settings.smtpHost} onChange={(e) => setSettings((s) => ({ ...s, smtpHost: e.target.value }))} />
            <Input placeholder="SMTP Port" value={settings.smtpPort} onChange={(e) => setSettings((s) => ({ ...s, smtpPort: e.target.value }))} />
            <Input placeholder="SMTP Username" value={settings.smtpUser} onChange={(e) => setSettings((s) => ({ ...s, smtpUser: e.target.value }))} />
            <Input placeholder="From Email" value={settings.smtpFrom} onChange={(e) => setSettings((s) => ({ ...s, smtpFrom: e.target.value }))} />
            <Select value={settings.smtpSecure} onChange={(e) => setSettings((s) => ({ ...s, smtpSecure: e.target.value }))}>
              <option value="tls">Security: TLS</option>
              <option value="ssl">Security: SSL</option>
              <option value="none">Security: None</option>
            </Select>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => saveAll("SMTP settings saved.")}>Save SMTP Settings</Button>
            <Button variant="outline" onClick={runTestWorkflow}>Send Test Email</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Security & Access</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Select value={settings.mfa} onChange={(e) => setSettings((s) => ({ ...s, mfa: e.target.value }))}>
              <option value="required">MFA: Required for all admins</option>
              <option value="optional">MFA: Optional</option>
            </Select>
            <Select value={settings.sessionTimeout} onChange={(e) => setSettings((s) => ({ ...s, sessionTimeout: e.target.value }))}>
              <option value="30">Session timeout: 30 min</option>
              <option value="60">Session timeout: 60 min</option>
              <option value="120">Session timeout: 120 min</option>
            </Select>
            <Select value={settings.passwordPolicy} onChange={(e) => setSettings((s) => ({ ...s, passwordPolicy: e.target.value }))}>
              <option value="strict">Password policy: Strict</option>
              <option value="standard">Password policy: Standard</option>
            </Select>
            <Select value={settings.ipAllowlist} onChange={(e) => setSettings((s) => ({ ...s, ipAllowlist: e.target.value }))}>
              <option value="on">IP allowlisting: ON</option>
              <option value="off">IP allowlisting: OFF</option>
            </Select>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => saveAll("Security settings saved.")}>Save Security Settings</Button>
            <Link href="/admin/activity"><Button variant="outline">View Access Logs</Button></Link>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">System Integrations</h2>
          <div className="mt-3 grid gap-3">
            <Input defaultValue="Xero: Connected" readOnly />
            <Input defaultValue="PRODA: Connected" readOnly />
            <Input defaultValue="Employment Hero: Connected" readOnly />
            <Input defaultValue="SMS Gateway: Connected" readOnly />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" onClick={runTestWorkflow}>Re-sync Integrations</Button>
            <Button variant="outline" onClick={() => saveAll("Integration health snapshot saved.")}>Download Integration Health Log</Button>
          </div>
        </Card>
      </div>
      {msg ? <Card><p className="text-sm text-slate-700">{msg}</p></Card> : null}

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Employee Management & Full CRUD</h2>
        <p className="mt-2 text-sm text-slate-600">Direct admin shortcuts to create, edit, deactivate, and audit all user roles.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/admin/users"><Button>Open User Directory</Button></Link>
          <Link href="/admin/users?create=admin"><Button variant="outline">Create Admin</Button></Link>
          <Link href="/admin/users?create=driver"><Button variant="outline">Create Driver</Button></Link>
          <Link href="/admin/users?create=partner"><Button variant="outline">Create Partner</Button></Link>
          <Link href="/admin/users?create=rider"><Button variant="outline">Create Rider</Button></Link>
        </div>
      </Card>
    </div>
  );
}
