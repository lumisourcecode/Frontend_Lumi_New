"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button, Card, Input } from "@/components/ui/primitives";
import { apiJson, setAuthSession } from "@/lib/api-client";
import { PasswordStrength, getPasswordStrength } from "@/components/auth/password-strength";
import { cn } from "@/lib/utils";

type Portal = "rider" | "driver" | "agent" | "admin";

const PORTAL_LABELS: Record<Portal, string> = {
  rider: "Rider",
  driver: "Driver",
  agent: "Partner",
  admin: "Admin",
};

type PortalLoginFormProps = {
  portal: Portal;
  allowRegister?: boolean;
};

export function PortalLoginForm({ portal, allowRegister = true }: PortalLoginFormProps) {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canRegister = allowRegister && portal !== "admin";
  const { score } = getPasswordStrength(password);
  const isPasswordStrong = score >= 3 && password.length >= 8;

  function validateRegister(): string | null {
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email";
    if (isRegister && email !== emailConfirm) return "Emails do not match";
    if (!password) return "Password is required";
    if (isRegister && password !== passwordConfirm) return "Passwords do not match";
    if (isRegister && !isPasswordStrong) return "Use a stronger password (see suggestions)";
    return null;
  }

  async function submitAuth(mode: "login" | "register") {
    const validation = isRegister ? validateRegister() : null;
    if (validation) {
      setError(validation);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data =
        mode === "register"
          ? await apiJson<{
              accessToken: string;
              user: { id: string; email: string; roles: string[] };
            }>("/auth/register", {
              method: "POST",
              body: JSON.stringify({ email: email.trim().toLowerCase(), password, role: portal, fullName: fullName || undefined }),
            })
          : await apiJson<{
              accessToken: string;
              user: { id: string; email: string; roles: string[] };
            }>("/auth/login", {
              method: "POST",
              body: JSON.stringify({ email: email.trim().toLowerCase(), password, portal }),
            });

      setAuthSession({ accessToken: data.accessToken, user: data.user });
      if (portal === "admin") router.push("/admin/dashboard");
      else if (portal === "agent") router.push("/agent/dashboard");
      else if (portal === "driver") router.push("/driver/onboard");
      else router.push("/rider/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("Google sign-in not configured. Use email above.");
      return;
    }
    const redirectUri = typeof window !== "undefined"
      ? `${window.location.origin}/auth/google/callback`
      : "";
    const scope = "email profile";
    const state = portal;
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;
    window.location.href = url;
  }

  const [phoneMode, setPhoneMode] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  async function handleSendOtp() {
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid Australian phone number");
      return;
    }
    setPhoneLoading(true);
    setError("");
    try {
      await apiJson("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone: phone.replace(/\D/g, ""), portal }),
      });
      setOtpSent(true);
      setOtpCode("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send code");
    } finally {
      setPhoneLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otpCode.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setPhoneLoading(true);
    setError("");
    try {
      const data = await apiJson<{ accessToken: string; user: { id: string; email: string; roles: string[] } }>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone: phone.replace(/\D/g, ""), code: otpCode, portal }),
      });
      setAuthSession({ accessToken: data.accessToken, user: data.user });
      if (portal === "admin") router.push("/admin/dashboard");
      else if (portal === "agent") router.push("/agent/dashboard");
      else if (portal === "driver") router.push("/driver/onboard");
      else router.push("/rider/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setPhoneLoading(false);
    }
  }

  function handlePhone() {
    setPhoneMode(true);
    setError("");
    setOtpSent(false);
  }

  return (
    <Card className="w-full max-w-sm border-0 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">
        {PORTAL_LABELS[portal]} {isRegister ? "Sign up" : "Sign in"}
      </h1>

      {portal === "admin" && (
        <p className="mt-2 text-sm text-slate-500">
          Admin accounts are created by super admin only.
        </p>
      )}

      {portal === "agent" && canRegister && (
        <p className="mt-2 text-sm text-slate-500">
          Use your official work email.
        </p>
      )}

      {portal === "driver" && canRegister && (
        <p className="mt-2 text-sm text-slate-500">
          Verify your email after sign up to continue.
        </p>
      )}

      {canRegister && (
        <div className="mt-6 flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition",
              !isRegister ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
            )}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition",
              isRegister ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
            )}
          >
            Sign up
          </button>
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
          <Input
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white"
          />
        </div>

        {isRegister && canRegister && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm email</label>
            <Input
              placeholder="you@example.com"
              type="email"
              value={emailConfirm}
              onChange={(e) => setEmailConfirm(e.target.value)}
              className={cn(
                "h-11 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white",
                emailConfirm && email !== emailConfirm && "border-red-300",
              )}
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
          <div className="relative">
            <Input
              placeholder={isRegister ? "Create password (8+ chars, symbol, number)" : "Enter password"}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className="h-11 rounded-lg border-slate-200 bg-slate-50/50 pr-10 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {isRegister && (password.length > 0 || passwordFocused) && (
            <PasswordStrength password={password} inline />
          )}
        </div>

        {isRegister && canRegister && (
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
        )}

        {isRegister && canRegister && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name <span className="text-slate-400">(optional)</span></label>
            <Input
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-11 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white"
            />
          </div>
        )}

        <Button
          className="h-11 w-full rounded-lg font-medium"
          disabled={loading}
          onClick={() => submitAuth(isRegister && canRegister ? "register" : "login")}
        >
          {loading ? "Please wait..." : isRegister && canRegister ? "Create account" : "Sign in"}
        </Button>

        {(portal === "rider" || portal === "driver") && canRegister && !phoneMode && (
          <>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <p className="relative text-center text-xs text-slate-500">or continue with</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-11 flex-1 rounded-lg border-slate-200"
                onClick={handleGoogle}
              >
                <svg className="mr-2 size-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                className="h-11 flex-1 rounded-lg border-slate-200"
                onClick={handlePhone}
              >
                Phone
              </Button>
            </div>
          </>
        )}

        {(portal === "rider" || portal === "driver") && canRegister && phoneMode && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
            <p className="text-sm font-medium text-slate-700">Sign in with phone</p>
            {!otpSent ? (
              <>
                <Input
                  placeholder="04XX XXX XXX (Australian number)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className="h-11"
                />
                <div className="flex gap-2">
                  <Button disabled={phoneLoading} onClick={handleSendOtp} className="flex-1">
                    {phoneLoading ? "Sending..." : "Send code"}
                  </Button>
                  <Button variant="outline" onClick={() => setPhoneMode(false)}>Back</Button>
                </div>
              </>
            ) : (
              <>
                <Input
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-11"
                />
                <div className="flex gap-2">
                  <Button disabled={phoneLoading || otpCode.length !== 6} onClick={handleVerifyOtp} className="flex-1">
                    {phoneLoading ? "Verifying..." : "Verify"}
                  </Button>
                  <Button variant="outline" onClick={() => setOtpSent(false)}>Resend</Button>
                  <Button variant="outline" onClick={() => { setPhoneMode(false); setOtpSent(false); }}>Back</Button>
                </div>
              </>
            )}
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <Link
          href={`/forgot-password?portal=${portal}`}
          className="block text-center text-sm text-slate-500 hover:text-slate-700"
        >
          Forgot password?
        </Link>

        <Link
          href="/login"
          className="block text-center text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to portal selection
        </Link>
      </div>
    </Card>
  );
}
