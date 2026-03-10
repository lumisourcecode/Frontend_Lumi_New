"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button, Card, Input } from "@/components/ui/primitives";
import { apiJson, setAuthSession } from "@/lib/api-client";
import { PasswordStrength, getPasswordStrength } from "@/components/auth/password-strength";
import { cn } from "@/lib/utils";

const PORTAL_LABELS: Record<string, string> = {
  rider: "Rider",
  driver: "Driver",
  partner: "Partner",
  admin: "Admin",
};

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const portal = (searchParams.get("portal") ?? "rider") as string;

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { score } = getPasswordStrength(password);
  const isPasswordStrong = score >= 3 && password.length >= 8;

  useEffect(() => {
    if (!token) setError("Invalid reset link. Request a new one.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    if (!isPasswordStrong) {
      setError("Use a stronger password (see suggestions)");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const data = await apiJson<{
        accessToken: string;
        user: { id: string; email: string; roles: string[] };
      }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password, portal }),
      });
      setAuthSession({ accessToken: data.accessToken, user: data.user });
      if (portal === "admin") router.push("/admin/dashboard");
      else if (portal === "partner") router.push("/partner/dashboard");
      else if (portal === "driver") router.push("/driver/onboard");
      else router.push("/rider/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <Card className="w-full max-w-sm border-0 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Invalid link</h1>
        <p className="mt-2 text-sm text-slate-500">
          This reset link is invalid or expired. Request a new one.
        </p>
        <Link href={`/forgot-password?portal=${portal}`} className="mt-6 block">
          <Button className="w-full">Request new link</Button>
        </Link>
        <Link href="/login" className="mt-4 block text-center text-sm text-slate-500 hover:text-slate-700">
          ← Portal selection
        </Link>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm border-0 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Set new password</h1>
      <p className="mt-2 text-sm text-slate-500">
        Choose a strong password for your {PORTAL_LABELS[portal] ?? portal} account.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">New password</label>
          <div className="relative">
            <Input
              placeholder="8+ chars, symbol, number"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className={cn(
                "h-11 rounded-lg border-slate-200 bg-slate-50/50 pr-10 focus:bg-white",
                password.length > 0 && !isPasswordStrong && "border-amber-300",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {(password.length > 0 || passwordFocused) && (
            <PasswordStrength password={password} inline />
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label>
          <Input
            placeholder="Confirm password"
            type={showPassword ? "text" : "password"}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className={cn(
              "h-11 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white",
              passwordConfirm && password !== passwordConfirm && "border-red-300",
            )}
          />
        </div>
        <Button
          type="submit"
          className="h-11 w-full"
          disabled={loading || !isPasswordStrong || password !== passwordConfirm}
        >
          {loading ? "Updating..." : "Reset password"}
        </Button>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        <Link
          href={`/${portal}/login`}
          className="block text-center text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to sign in
        </Link>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
