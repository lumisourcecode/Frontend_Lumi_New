"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Profile = {
  email: string;
  fullName: string;
  phone: string;
  dateOfBirth: string | null;
  addressLine1: string;
  suburb: string;
  state: string;
  postcode: string;
  licenseNumber: string;
  emergencyContact: string;
  vehicleRego: string;
  vehicleMake: string;
  vehicleColor: string;
  verificationStatus: string;
};

export default function DriverProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<Profile>("/driver/profile", undefined, session.accessToken)
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (!profile) return <p className="text-slate-500">Profile not found.</p>;

  const hasAddress = profile.addressLine1 && profile.suburb && profile.state && profile.postcode;
  const hasLicense = profile.licenseNumber && profile.emergencyContact;
  const hasVehicle = profile.vehicleRego && profile.vehicleMake;

  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#12195E] via-[#25309E] to-[#0072A8] text-white">
        <h1 className="text-2xl font-bold">Driver Profile</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Your NDIS driver profile. Complete all sections before applying.
        </p>
        <Badge tone={profile.verificationStatus === "Approved" ? "certified" : "pending"} className="mt-2">
          {profile.verificationStatus}
        </Badge>
        <Link href="/driver/onboard" className="mt-3 inline-block">
          <Button variant="outline" className="border-white/50 text-white hover:bg-white/10">
            {profile.verificationStatus === "Approved" ? "Update profile" : "Complete onboarding"}
          </Button>
        </Link>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Personal details</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div><dt className="text-slate-500">Email</dt><dd>{profile.email}</dd></div>
            <div><dt className="text-slate-500">Full name</dt><dd>{profile.fullName || "—"}</dd></div>
            <div><dt className="text-slate-500">Phone</dt><dd>{profile.phone || "—"}</dd></div>
            <div><dt className="text-slate-500">Date of birth</dt><dd>{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "—"}</dd></div>
            <div><dt className="text-slate-500">Address</dt><dd>{hasAddress ? `${profile.addressLine1}, ${profile.suburb} ${profile.state} ${profile.postcode}` : "—"}</dd></div>
          </dl>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">License & emergency</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div><dt className="text-slate-500">License number</dt><dd>{profile.licenseNumber || "—"}</dd></div>
            <div><dt className="text-slate-500">Emergency contact</dt><dd>{profile.emergencyContact || "—"}</dd></div>
          </dl>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Vehicle</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div><dt className="text-slate-500">Registration</dt><dd>{profile.vehicleRego || "—"}</dd></div>
            <div><dt className="text-slate-500">Make/model</dt><dd>{profile.vehicleMake || "—"}</dd></div>
            <div><dt className="text-slate-500">Color</dt><dd>{profile.vehicleColor || "—"}</dd></div>
          </dl>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Documents</h2>
          <p className="mt-2 text-sm text-slate-600">Manage NDIS compliance documents.</p>
          <Link href="/driver/documents" className="mt-2 inline-block">
            <Button variant="outline">View documents</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
