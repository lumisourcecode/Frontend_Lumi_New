"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Profile = { email: string; orgName: string; contactName: string };
const PROFILE_DRAFT_KEY = "partner_profile_extended_settings_v1";

export default function PartnerProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orgName, setOrgName] = useState("");
  const [contactName, setContactName] = useState("");
  const [abn, setAbn] = useState("");
  const [financeEmail, setFinanceEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpFrom, setSmtpFrom] = useState("");
  const [mailTo, setMailTo] = useState("");
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
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
        if (typeof window !== "undefined") {
          const raw = window.localStorage.getItem(PROFILE_DRAFT_KEY);
          if (raw) {
            try {
              const draft = JSON.parse(raw) as {
                abn?: string;
                financeEmail?: string;
                supportPhone?: string;
                tenantSlug?: string;
                logoUrl?: string;
                smtpHost?: string;
                smtpPort?: string;
                smtpUser?: string;
                smtpFrom?: string;
              };
              if (draft.abn) setAbn(draft.abn);
              if (draft.financeEmail) setFinanceEmail(draft.financeEmail);
              if (draft.supportPhone) setSupportPhone(draft.supportPhone);
              if (draft.tenantSlug) setTenantSlug(draft.tenantSlug);
              if (draft.logoUrl) setLogoUrl(draft.logoUrl);
              if (draft.smtpHost) setSmtpHost(draft.smtpHost);
              if (draft.smtpPort) setSmtpPort(draft.smtpPort);
              if (draft.smtpUser) setSmtpUser(draft.smtpUser);
              if (draft.smtpFrom) setSmtpFrom(draft.smtpFrom);
            } catch {
              window.localStorage.removeItem(PROFILE_DRAFT_KEY);
            }
          }
        }
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
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          PROFILE_DRAFT_KEY,
          JSON.stringify({ abn, financeEmail, supportPhone, tenantSlug, logoUrl, smtpHost, smtpPort, smtpUser, smtpFrom }),
        );
      }
      setMsg("Profile and company settings saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function sendPartnerMailTest() {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    if (!mailTo || !mailSubject || !mailBody) {
      setMsg("Mail to, subject and message are required.");
      return;
    }
    setMsg("");
    try {
      await apiJson("/partner/support-tickets", {
        method: "POST",
        body: JSON.stringify({
          subject: `Partner outbound mail: ${mailSubject}`,
          message: `TENANT=${tenantSlug || "-"} FROM=${smtpFrom || "-"} HOST=${smtpHost || "-"} TO=${mailTo}\n\n${mailBody}`,
          priority: "normal",
        }),
      }, session.accessToken);
      setMsg("Mail queued via partner communications workflow.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to queue email");
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
          <Input
            value={abn}
            onChange={(e) => setAbn(e.target.value)}
            placeholder="ABN / Registration Number"
          />
          <Input
            value={financeEmail}
            onChange={(e) => setFinanceEmail(e.target.value)}
            placeholder="Finance Email"
          />
          <Input
            value={supportPhone}
            onChange={(e) => setSupportPhone(e.target.value)}
            placeholder="Support Phone"
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Extended settings are kept in your browser for quick operations, while core organization
          details sync to backend.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} placeholder="Partner tenant slug (e.g. acme-care)" />
          <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="Logo URL (for white-label branding)" />
          <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="SMTP host" />
          <Input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="SMTP port" />
          <Input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="SMTP username" />
          <Input value={smtpFrom} onChange={(e) => setSmtpFrom(e.target.value)} placeholder="SMTP from email" />
        </div>
        {logoUrl ? (
          <div className="mt-3 rounded-xl border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Brand Logo Preview</p>
            <img src={logoUrl} alt="Partner logo" className="mt-2 h-12 w-auto object-contain" />
          </div>
        ) : null}
        <div className="mt-4 rounded-xl border border-slate-200 p-3">
          <h3 className="font-semibold text-[var(--color-primary)]">Send Mail from Partner Dashboard</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Input value={mailTo} onChange={(e) => setMailTo(e.target.value)} placeholder="Recipient email" />
            <Input value={mailSubject} onChange={(e) => setMailSubject(e.target.value)} placeholder="Subject" />
            <Input value={mailBody} onChange={(e) => setMailBody(e.target.value)} placeholder="Message body" className="md:col-span-2" />
          </div>
          <div className="mt-3">
            <Button variant="outline" onClick={sendPartnerMailTest}>Send Test Mail</Button>
          </div>
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
