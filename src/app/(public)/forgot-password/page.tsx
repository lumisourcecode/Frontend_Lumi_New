"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input } from "@/components/ui/primitives";
import { apiJson } from "@/lib/api-client";

const PORTAL_LABELS: Record<string, string> = {
  rider: "Rider",
  driver: "Driver",
  agent: "Partner",
  admin: "Admin",
};

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const portal = (searchParams.get("portal") ?? "rider") as string;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    try {
      await apiJson("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase(), portal }),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const loginHref = `/${portal}/login`;

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm border-0 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Forgot password
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your email and we&apos;ll send a reset link for the {PORTAL_LABELS[portal] ?? portal} portal.
        </p>

        {sent ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              If that email exists, we sent a reset link. Check your inbox.
            </p>
            <Link href={loginHref}>
              <Button variant="outline" className="w-full">
                ← Back to sign in
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <Input
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="h-11 w-full"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send reset link"}
            </Button>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}
            <Link
              href={loginHref}
              className="block text-center text-sm text-slate-500 hover:text-slate-700"
            >
              ← Back to sign in
            </Link>
          </form>
        )}

        <Link
          href="/login"
          className="mt-6 block text-center text-sm text-slate-500 hover:text-slate-700"
        >
          ← Portal selection
        </Link>
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
