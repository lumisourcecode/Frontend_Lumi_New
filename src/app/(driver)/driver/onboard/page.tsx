"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Input,
  Select,
} from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

const AU_STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

const NDIS_DOC_TYPES = [
  "Driver License (Australian)",
  "NDIS Worker Screening Check",
  "National Police Check",
  "Manual Handling Certificate",
  "CPR / First Aid Certificate",
  "Vehicle Registration",
  "Comprehensive Insurance",
];

const REQUIRED_DOCS = [
  "Driver License (Australian)",
  "NDIS Worker Screening Check",
  "National Police Check",
  "Manual Handling Certificate",
  "CPR / First Aid Certificate",
];

type OnboardingData = {
  profileCompletionPercent: number;
  steps: Array<{
    id: number;
    label: string;
    complete: boolean;
    required: string[];
  }>;
  canSubmit: boolean;
  enrollment: { status: string; verificationStage: string; adminNotes: string | null } | null;
  verificationStatus: string;
  documents: Array<{ doc_type: string; status: string }>;
};

type Profile = {
  fullName: string;
  phone: string;
  dateOfBirth: string;
  addressLine1: string;
  suburb: string;
  state: string;
  postcode: string;
  licenseNumber: string;
  emergencyContact: string;
  vehicleRego: string;
  vehicleMake: string;
  vehicleColor: string;
};

function StepPill({
  num,
  active,
  complete,
  error,
  onClick,
}: {
  num: number;
  active: boolean;
  complete: boolean;
  error: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-md transition-all duration-300 ${
        error
          ? "border-2 border-red-500 bg-red-50 text-red-600 ring-2 ring-red-200"
          : complete
            ? "bg-emerald-700 text-white shadow-emerald-900/30"
            : active
              ? "bg-[var(--color-primary)] text-white shadow-[var(--color-primary)]/30"
              : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      }`}
    >
      {complete && !active ? <Check className="size-5" strokeWidth={3} /> : num}
    </button>
  );
}

export default function DriverOnboardPage() {
  const router = useRouter();
  const [data, setData] = useState<OnboardingData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [stepError, setStepError] = useState(false);
  const [docType, setDocType] = useState(NDIS_DOC_TYPES[0]);
  const [expiry, setExpiry] = useState("");
  const session = getAuthSession();

  const fetchData = useCallback(() => {
    if (!session?.accessToken) return;
    apiJson<OnboardingData>("/driver/onboarding", undefined, session.accessToken)
      .then(setData)
      .catch(() => {});
    apiJson<Profile & { email: string }>("/driver/profile", undefined, session.accessToken)
      .then((p) => {
        setProfile({
          fullName: p.fullName ?? "",
          phone: p.phone ?? "",
          dateOfBirth: p.dateOfBirth ? String(p.dateOfBirth).slice(0, 10) : "",
          addressLine1: p.addressLine1 ?? "",
          suburb: p.suburb ?? "",
          state: p.state ?? "",
          postcode: p.postcode ?? "",
          licenseNumber: p.licenseNumber ?? "",
          emergencyContact: p.emergencyContact ?? "",
          vehicleRego: p.vehicleRego ?? "",
          vehicleMake: p.vehicleMake ?? "",
          vehicleColor: p.vehicleColor ?? "",
        });
      })
      .catch(() => {});
  }, [session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken) return;
    const t = setTimeout(() => fetchData(), 150);
    return () => clearTimeout(t);
  }, [session?.accessToken, fetchData]);

  useEffect(() => {
    if (data?.enrollment?.status === "approved") {
      router.replace("/driver/dashboard");
    }
  }, [data?.enrollment?.status, router]);

  async function saveProfile(updates: Partial<Profile>) {
    if (!session?.accessToken || !profile) return;
    setSaving(true);
    setMsg("");
    setStepError(false);
    try {
      await apiJson("/driver/profile", {
        method: "PATCH",
        body: JSON.stringify({ ...profile, ...updates }),
      }, session.accessToken);
      setProfile((p) => (p ? { ...p, ...updates } : null));
      setMsg("Saved.");
      fetchData();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  function validateStep(s: number): boolean {
    if (!profile) return false;
    if (s === 1) {
      return !!(profile.fullName?.trim() && profile.phone?.trim() && profile.dateOfBirth && profile.addressLine1?.trim() && profile.suburb?.trim() && profile.state?.trim() && profile.postcode?.trim());
    }
    if (s === 2) return !!(profile.licenseNumber?.trim() && profile.emergencyContact?.trim());
    if (s === 3) return !!(profile.vehicleRego?.trim() && profile.vehicleMake?.trim());
    if (s === 4) {
      const docTypes = (data?.documents ?? []).map((d) => d.doc_type);
      return REQUIRED_DOCS.every((d) => docTypes.includes(d));
    }
    return true;
  }

  async function handleSaveAndNext() {
    if (!validateStep(step)) {
      setStepError(true);
      setMsg("Please complete all required fields before continuing.");
      return;
    }
    setStepError(false);
    await saveProfile(profile ?? {});
    if (step < 5) setStep(step + 1);
  }

  function goPrev() {
    setStepError(false);
    setMsg("");
    if (step > 1) setStep(step - 1);
  }

  function goToStep(s: number) {
    setStepError(false);
    setMsg("");
    setStep(s);
  }

  async function addDocument() {
    if (!session?.accessToken) return;
    setSaving(true);
    setMsg("");
    setStepError(false);
    try {
      await apiJson("/driver/documents", {
        method: "POST",
        body: JSON.stringify({ docType, expiry: expiry || null }),
      }, session.accessToken);
      setMsg("Document added.");
      setExpiry("");
      fetchData();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function submitForVerification() {
    if (!session?.accessToken || !data?.canSubmit) return;
    setSaving(true);
    setMsg("");
    try {
      await apiJson("/driver/enroll", { method: "POST", body: JSON.stringify({}) }, session.accessToken);
      setMsg("Application submitted. We'll review and notify you.");
      fetchData();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  function handleFieldChange(updates: Partial<Profile>) {
    setProfile((p) => (p ? { ...p, ...updates } : null));
    setStepError(false);
  }

  if (!session?.accessToken) return null;
  if (data?.enrollment?.status === "approved") return null;

  const pc = data?.profileCompletionPercent ?? 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="overflow-hidden border-none bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white shadow-xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">Become an NDIS Driver</h1>
          <p className="mt-2 text-sm text-slate-300">
            Complete your profile and upload compliance documents. Australian NDIS transport requirements apply.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Data is saved when you click Save & continue. It persists across sessions.
          </p>
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Profile completion</span>
              <span className="font-bold text-white">{pc}%</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-600">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${pc}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <StepPill
                num={s}
                active={step === s}
                complete={data?.steps[s - 1]?.complete ?? false}
                error={stepError && step === s}
                onClick={() => goToStep(s)}
              />
              {s < 5 && (
                <div
                  className={`mx-0.5 h-0.5 w-6 rounded transition-colors ${
                    data?.steps[s - 1]?.complete ? "bg-emerald-400" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <Link
          href="/driver/profile"
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          View profile
        </Link>
      </div>

      {data?.enrollment?.status === "rejected" && data.enrollment.adminNotes && (
        <Card className="border-amber-300 bg-amber-50 shadow-sm">
          <p className="text-sm font-medium text-amber-800">Application feedback</p>
          <p className="mt-1 text-sm text-amber-700">{data.enrollment.adminNotes}</p>
          <p className="mt-2 text-xs text-amber-600">Update your profile and documents, then resubmit.</p>
        </Card>
      )}

      {step === 1 && (
        <Card className="shadow-lg">
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Step 1: Personal details</h2>
          <p className="mt-1 text-sm text-slate-600">Australian address format required.</p>
          <div className={`mt-4 grid gap-3 rounded-xl p-1 ${stepError ? "ring-2 ring-red-200 ring-offset-2" : ""}`}>
            <Input
              placeholder="Full legal name"
              value={profile?.fullName ?? ""}
              onChange={(e) => handleFieldChange({ fullName: e.target.value })}
              className={stepError && !profile?.fullName?.trim() ? "border-red-400" : ""}
            />
            <Input
              type="tel"
              placeholder="Phone (e.g. 04XX XXX XXX)"
              value={profile?.phone ?? ""}
              onChange={(e) => handleFieldChange({ phone: e.target.value })}
              className={stepError && !profile?.phone?.trim() ? "border-red-400" : ""}
            />
            <Input
              type="date"
              placeholder="Date of birth"
              value={profile?.dateOfBirth ?? ""}
              onChange={(e) => handleFieldChange({ dateOfBirth: e.target.value })}
              className={stepError && !profile?.dateOfBirth ? "border-red-400" : ""}
            />
            <Input
              placeholder="Street address"
              value={profile?.addressLine1 ?? ""}
              onChange={(e) => handleFieldChange({ addressLine1: e.target.value })}
              className={stepError && !profile?.addressLine1?.trim() ? "border-red-400" : ""}
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Suburb"
                value={profile?.suburb ?? ""}
                onChange={(e) => handleFieldChange({ suburb: e.target.value })}
                className={stepError && !profile?.suburb?.trim() ? "border-red-400" : ""}
              />
              <Select
                value={profile?.state ?? ""}
                onChange={(e) => handleFieldChange({ state: e.target.value })}
                className={stepError && !profile?.state ? "border-red-400" : ""}
              >
                <option value="">State</option>
                {AU_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
              <Input
                placeholder="Postcode"
                value={profile?.postcode ?? ""}
                onChange={(e) => handleFieldChange({ postcode: e.target.value })}
                className={stepError && !profile?.postcode?.trim() ? "border-red-400" : ""}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button disabled={saving} onClick={handleSaveAndNext} className="rounded-xl">
              {saving ? "Saving..." : "Save & continue"}
            </Button>
            {msg ? (
              <span className={`self-center text-sm ${stepError ? "text-red-600 font-medium" : "text-slate-600"}`}>
                {msg}
              </span>
            ) : null}
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="shadow-lg">
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Step 2: License & emergency contact</h2>
          <p className="mt-1 text-sm text-slate-600">Australian driver license number and emergency contact.</p>
          <div className={`mt-4 grid gap-3 rounded-xl p-1 ${stepError ? "ring-2 ring-red-200 ring-offset-2" : ""}`}>
            <Input
              placeholder="Australian driver license number"
              value={profile?.licenseNumber ?? ""}
              onChange={(e) => handleFieldChange({ licenseNumber: e.target.value })}
              className={stepError && !profile?.licenseNumber?.trim() ? "border-red-400" : ""}
            />
            <Input
              placeholder="Emergency contact name & phone"
              value={profile?.emergencyContact ?? ""}
              onChange={(e) => handleFieldChange({ emergencyContact: e.target.value })}
              className={stepError && !profile?.emergencyContact?.trim() ? "border-red-400" : ""}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={goPrev} className="rounded-xl">Previous</Button>
            <Button disabled={saving} onClick={handleSaveAndNext} className="rounded-xl">
              {saving ? "Saving..." : "Save & continue"}
            </Button>
            {msg ? (
              <span className={`self-center text-sm ${stepError ? "text-red-600 font-medium" : "text-slate-600"}`}>
                {msg}
              </span>
            ) : null}
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="shadow-lg">
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Step 3: Vehicle details</h2>
          <p className="mt-1 text-sm text-slate-600">Vehicle used for NDIS transport.</p>
          <div className={`mt-4 grid gap-3 rounded-xl p-1 ${stepError ? "ring-2 ring-red-200 ring-offset-2" : ""}`}>
            <Input
              placeholder="Registration number"
              value={profile?.vehicleRego ?? ""}
              onChange={(e) => handleFieldChange({ vehicleRego: e.target.value })}
              className={stepError && !profile?.vehicleRego?.trim() ? "border-red-400" : ""}
            />
            <Input
              placeholder="Make & model (e.g. Toyota Camry)"
              value={profile?.vehicleMake ?? ""}
              onChange={(e) => handleFieldChange({ vehicleMake: e.target.value })}
              className={stepError && !profile?.vehicleMake?.trim() ? "border-red-400" : ""}
            />
            <Input
              placeholder="Color"
              value={profile?.vehicleColor ?? ""}
              onChange={(e) => handleFieldChange({ vehicleColor: e.target.value })}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={goPrev} className="rounded-xl">Previous</Button>
            <Button disabled={saving} onClick={handleSaveAndNext} className="rounded-xl">
              {saving ? "Saving..." : "Save & continue"}
            </Button>
            {msg ? (
              <span className={`self-center text-sm ${stepError ? "text-red-600 font-medium" : "text-slate-600"}`}>
                {msg}
              </span>
            ) : null}
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card className="shadow-lg">
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Step 4: NDIS compliance documents</h2>
          <p className="mt-1 text-sm text-slate-600">
            Required for NDIS transport in Australia. Add each document type.
          </p>
          <ul className="mt-2 list-inside list-disc text-xs text-slate-600">
            {REQUIRED_DOCS.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <div className={`mt-4 rounded-xl p-1 ${stepError ? "ring-2 ring-red-200 ring-offset-2" : ""}`}>
            <div className="grid gap-3 sm:grid-cols-3">
              <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
                {NDIS_DOC_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
              <Input type="date" placeholder="Expiry" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
              <Button disabled={saving} onClick={addDocument} className="rounded-xl">Add document</Button>
            </div>
            <div className="mt-4 space-y-2">
              {data?.documents?.map((d, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm">
                  <span>{d.doc_type}</span>
                  <Badge tone={d.status === "Approved" ? "certified" : d.status === "Rejected" ? "danger" : "pending"}>
                    {d.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={goPrev} className="rounded-xl">Previous</Button>
            <Button disabled={saving} onClick={handleSaveAndNext} className="rounded-xl">
              {saving ? "Saving..." : "Save & continue"}
            </Button>
            {msg ? (
              <span className={`self-center text-sm ${stepError ? "text-red-600 font-medium" : "text-slate-600"}`}>
                {msg}
              </span>
            ) : null}
          </div>
        </Card>
      )}

      {step === 5 && (
        <Card className="shadow-lg">
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Step 5: Submit for verification</h2>
          {data?.enrollment?.status === "pending" ? (
            <div className="mt-4">
              <Badge tone="pending">Pending review</Badge>
              <p className="mt-2 text-sm text-slate-600">
                Your application is under review. We'll notify you when it's approved.
              </p>
              {data.enrollment.verificationStage && (
                <p className="mt-1 text-xs text-slate-500">Stage: {data.enrollment.verificationStage.replace(/_/g, " ")}</p>
              )}
            </div>
          ) : data?.canSubmit ? (
            <div className="mt-4">
              <p className="text-sm text-slate-600">
                All steps complete. Submit your application for admin verification.
              </p>
              <Button className="mt-4 rounded-xl" disabled={saving} onClick={submitForVerification}>
                {saving ? "Submitting..." : "Submit application"}
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-amber-700">
                Complete all steps above before submitting. Profile: {pc}%
              </p>
              <ul className="mt-2 list-inside list-disc text-xs text-slate-600">
                {data?.steps?.filter((s) => !s.complete).map((s) => (
                  <li key={s.id}>{s.label}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-4 flex gap-3">
            <Button variant="outline" onClick={goPrev} className="rounded-xl">Previous</Button>
            {msg ? <span className="self-center text-sm text-slate-600">{msg}</span> : null}
          </div>
        </Card>
      )}

      {data?.enrollment?.status === "approved" && (
        <Card className="border-emerald-200 bg-emerald-50 shadow-lg">
          <p className="font-medium text-emerald-800">You&apos;re approved!</p>
          <Link href="/driver/dashboard">
            <Button className="mt-2 rounded-xl">Go to Dashboard</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
