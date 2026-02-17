"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Accessibility, CarFront, Dog } from "lucide-react";
import { applyMptpFareRules } from "@/lib/mptp";
import { Badge, Button, Card, Input, Progress, Select } from "@/components/ui/primitives";

export default function RiderDashboardPage() {
  const [step, setStep] = useState(1);
  const [baseFare, setBaseFare] = useState(75);
  const [mptpEligible, setMptpEligible] = useState(true);

  const pricing = useMemo(
    () => applyMptpFareRules({ baseFare, cardEligible: mptpEligible }),
    [baseFare, mptpEligible],
  );

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h2 className="text-xl font-bold">NDIS Budget Burn Tracker</h2>
        <p className="mt-1 text-sm text-indigo-100">Remaining: $8,900 / $12,000 transport budget</p>
        <div className="mt-3">
          <Progress value={74} />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-[var(--color-primary)]">Booking Wizard</h2>
        <p className="mb-4 text-sm text-slate-600">Step {step} of 3</p>

        {step === 1 ? (
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Pickup location" />
            <Input placeholder="Drop-off location" />
            <Input type="datetime-local" className="md:col-span-2" />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4" /> Recurring Trip
            </label>
            <div className="flex flex-wrap gap-2">
              <Badge tone="default">
                <Accessibility className="mr-1 size-3" /> Wheelchair
              </Badge>
              <Badge tone="default">
                <Dog className="mr-1 size-3" /> Service Animal
              </Badge>
            </div>
            <Select>
              <option>Wheelchair-accessible</option>
              <option>Service Animal</option>
              <option>Door-to-Door Assistance</option>
            </Select>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-3">
            <Input
              type="number"
              value={baseFare}
              onChange={(event) => setBaseFare(Number(event.target.value))}
              placeholder="Base fare"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={mptpEligible}
                onChange={(event) => setMptpEligible(event.target.checked)}
                className="size-4"
              />
              Eligible MPTP card holder
            </label>
            <Card className="bg-slate-50">
              <p className="text-sm">Subsidy Applied: ${pricing.subsidy}</p>
              <p className="text-sm font-semibold">Rider Pays: ${pricing.riderPayable}</p>
            </Card>
          </div>
        ) : null}

        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))}>
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
          ) : (
            <Button>Create Booking</Button>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-[var(--color-primary)]">Live Map</h3>
        <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <CarFront className="size-4 text-[var(--color-primary)]" />
            Driver is moving toward pickup location (placeholder map stream).
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-[var(--color-primary)]">My Account Shortcuts</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/rider/history">
            <Button>Travel History & Bills</Button>
          </Link>
          <Link href="/rider/profile">
            <Button variant="outline">Profile, Cards & Preferences</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Login Settings</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
