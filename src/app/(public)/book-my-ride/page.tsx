"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CarFront,
  CheckCircle2,
  Chrome,
  CreditCard,
  Lock,
  Mail,
  MapPin,
  MessageSquareMore,
  Sparkles,
} from "lucide-react";
import { applyMptpFareRules } from "@/lib/mptp";
import { Button, Card, Input, Progress, Select, Textarea } from "@/components/ui/primitives";

export default function BookMyRidePage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "create">("signin");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [fare, setFare] = useState(78);
  const [eligible, setEligible] = useState(true);
  const [saveCard, setSaveCard] = useState(true);
  const [form, setForm] = useState({
    pickup: "",
    destination: "",
    date: "",
    time: "",
    mobility: "Wheelchair",
    name: "",
    phone: "",
    email: "",
    password: "",
    usualLocation: "Home",
    serviceType: "Standard Accessible Ride",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    notes: "",
  });

  const mptp = useMemo(
    () => applyMptpFareRules({ baseFare: fare, cardEligible: eligible }),
    [fare, eligible],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <Card className="overflow-hidden border-none bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-2)] to-[var(--color-primary-3)] text-white">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold">Book My Ride</h1>
            <p className="mt-2 text-sm text-slate-200">
              Premium, accessible booking with secure login, saved cards, and realtime confirmations.
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm">
            <p className="font-semibold">Simple 4-step flow</p>
            <p className="mt-1 text-slate-200">
              Account {"->"} Trip {"->"} Rider Details {"->"} Payment & Confirm
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-bold text-[var(--color-primary)]">Secure Booking Wizard</h2>
          <div className="mt-2 flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${step >= s ? "bg-[var(--color-primary)]" : "bg-slate-200"}`}
              />
            ))}
          </div>
          <p className="mb-4 mt-2 text-xs text-slate-600">Step {step} of 4</p>

          {step === 1 ? (
            <div className="space-y-3">
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm ${
                    authMode === "signin" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-slate-600"
                  }`}
                  onClick={() => setAuthMode("signin")}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm ${
                    authMode === "create" ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-slate-600"
                  }`}
                  onClick={() => setAuthMode("create")}
                >
                  Create Account
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
                <Input
                  type="password"
                  placeholder={authMode === "create" ? "Set password" : "Password"}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                />
              </div>

              <Button className="w-full" onClick={() => setIsLoggedIn(true)}>
                {authMode === "create" ? "Create Account & Continue" : "Login & Continue"}
              </Button>
              <p className="text-center text-xs text-slate-500">or</p>
              <Button className="w-full" variant="outline" onClick={() => setIsLoggedIn(true)}>
                <Chrome className="mr-2 size-4" />
                Login with Google
              </Button>

              {isLoggedIn ? (
                <p className="flex items-center gap-2 text-xs text-emerald-700">
                  <CheckCircle2 className="size-4" />
                  Account verified. Continue to trip details.
                </p>
              ) : null}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Pickup location (Google Maps autocomplete placeholder)"
                value={form.pickup}
                onChange={(e) => setForm((p) => ({ ...p, pickup: e.target.value }))}
              />
              <Input
                placeholder="Destination"
                value={form.destination}
                onChange={(e) => setForm((p) => ({ ...p, destination: e.target.value }))}
              />
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
              />
              <Select
                value={form.usualLocation}
                onChange={(e) => setForm((p) => ({ ...p, usualLocation: e.target.value }))}
                className="md:col-span-2"
              >
                <option>Home</option>
                <option>Hospital</option>
                <option>Dialysis Clinic</option>
                <option>Aged Care Residence</option>
              </Select>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Select
                value={form.mobility}
                onChange={(e) => setForm((p) => ({ ...p, mobility: e.target.value }))}
              >
                <option>Wheelchair</option>
                <option>Carer Companion</option>
                <option>Service Animal</option>
                <option>Door-to-Door Assistance</option>
              </Select>
              <Select
                value={form.serviceType}
                onChange={(e) => setForm((p) => ({ ...p, serviceType: e.target.value }))}
              >
                <option>Standard Accessible Ride</option>
                <option>Medical Appointment Priority</option>
                <option>Assisted Escort Service</option>
              </Select>
              <Input
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
              <Input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
              <Input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="md:col-span-2"
              />
              <Input
                type="number"
                min={0}
                value={fare}
                onChange={(e) => setFare(Number(e.target.value))}
                placeholder="Estimated fare"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={eligible}
                  onChange={(e) => setEligible(e.target.checked)}
                  className="size-4"
                />
                MPTP eligible rider
              </label>
              <Textarea
                placeholder="Trip notes (gate code, support instructions, etc.)"
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="md:col-span-2"
              />
              <Card className="bg-slate-50 md:col-span-2">
                <p className="text-sm">Estimated Fare: ${fare.toFixed(2)}</p>
                <p className="text-sm">MPTP subsidy: ${mptp.subsidy.toFixed(2)} (cap $60)</p>
                <p className="text-sm font-semibold">Rider payable: ${mptp.riderPayable.toFixed(2)}</p>
              </Card>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Cardholder Name"
                value={form.cardName}
                onChange={(e) => setForm((p) => ({ ...p, cardName: e.target.value }))}
              />
              <Input
                placeholder="Card Number"
                value={form.cardNumber}
                onChange={(e) => setForm((p) => ({ ...p, cardNumber: e.target.value }))}
              />
              <Input
                placeholder="MM/YY"
                value={form.expiry}
                onChange={(e) => setForm((p) => ({ ...p, expiry: e.target.value }))}
              />
              <Input
                placeholder="CVV"
                value={form.cvv}
                onChange={(e) => setForm((p) => ({ ...p, cvv: e.target.value }))}
              />
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input
                  type="checkbox"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  className="size-4"
                />
                Save card securely for automatic future payments
              </label>
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input
                  type="checkbox"
                  checked={captchaChecked}
                  onChange={(e) => setCaptchaChecked(e.target.checked)}
                  className="size-4"
                />
                I am not a robot (Captcha placeholder)
              </label>
              <Card className="bg-slate-50 md:col-span-2">
                <p className="flex items-center gap-2 text-sm">
                  <Lock className="size-4 text-[var(--color-primary)]" />
                  Payment details are secured with tokenized storage (demo UI).
                </p>
              </Card>
            </div>
          ) : null}

          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))}>
              Back
            </Button>
            {step < 4 ? (
              <Button
                disabled={step === 1 && !isLoggedIn}
                onClick={() => setStep((s) => s + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                disabled={!captchaChecked}
                onClick={() => {
                  setSubmitted(true);
                }}
              >
                Confirm Booking
              </Button>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-[var(--color-primary)]">Rider Summary</h3>
          <p className="mt-2 text-xs text-slate-600">Transport budget: $3,800 remaining of $6,200</p>
          <div className="mt-2">
            <Progress value={61} />
          </div>

          <h3 className="mt-5 font-bold text-[var(--color-primary)]">Live Tracking</h3>
          <div className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3">
            <p className="flex items-center gap-2 text-xs text-slate-600">
              <CarFront className="size-4 text-[var(--color-primary)]" />
              Driver ETA map placeholder (realtime vehicle position).
            </p>
          </div>
          <h3 className="mt-5 font-bold text-[var(--color-primary)]">Quick Profile</h3>
          <div className="mt-2 space-y-2 text-xs text-slate-700">
            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-[var(--color-primary)]" />
              Usual location: Home, Monash Medical Centre, Dialysis Clinic
            </p>
            <p className="flex items-center gap-2">
              <CreditCard className="size-4 text-[var(--color-primary)]" />
              Card ready for future auto-payment
            </p>
            <p className="flex items-center gap-2">
              <Sparkles className="size-4 text-[var(--color-primary)]" />
              Service profile includes mobility and companion preferences
            </p>
          </div>
        </Card>
      </div>

      {submitted ? (
        <Card className="border-cyan-200 bg-cyan-50">
          <h3 className="font-bold text-[var(--color-primary)]">Booking Confirmed</h3>
          <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
            <p className="flex items-center gap-2">
              <Mail className="size-4 text-[var(--color-primary)]" />
              Instant email confirmation queued.
            </p>
            <p className="flex items-center gap-2">
              <MessageSquareMore className="size-4 text-[var(--color-primary)]" />
              SMS confirmation sent to rider phone.
            </p>
            <p className="flex items-center gap-2">
              <ArrowRight className="size-4 text-[var(--color-primary)]" />
              Reminder scheduled 1 hour before pickup.
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/rider/history">
              <Button>View Full Travel History</Button>
            </Link>
            <Link href="/rider/profile">
              <Button variant="outline">Manage Profile & Cards</Button>
            </Link>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
