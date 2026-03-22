"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Phone, ChevronLeft, ShieldCheck, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, Input, Badge } from "@/components/ui/primitives";
import { apiJson, setAuthSession } from "@/lib/api-client";
import { PasswordStrength, getPasswordStrength } from "@/components/auth/password-strength";
import { cn } from "@/lib/utils";

type Portal = "rider" | "driver" | "partner" | "admin";

const PORTAL_LABELS: Record<Portal, string> = {
  rider: "Rider",
  driver: "Driver",
  partner: "Partner",
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

  const [phoneMode, setPhoneMode] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const canRegister = allowRegister && portal !== "admin";
  const { score } = getPasswordStrength(password);
  const isPasswordStrong = score >= 3 && password.length >= 8;

  function validateRegister(): string | null {
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email";
    if (isRegister && email !== emailConfirm) return "Emails do not match";
    if (!password) return "Password is required";
    if (isRegister && password !== passwordConfirm) return "Passwords do not match";
    if (isRegister && !isPasswordStrong) return "Use a stronger password";
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
      const paths = { admin: "/admin/dashboard", partner: "/partner/dashboard", driver: "/driver/onboard", rider: "/rider/dashboard" };
      router.push(paths[portal]);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) { setError("Google sign-in not configured."); return; }
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = "email profile";
    const state = portal;
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;
    window.location.href = url;
  }

  async function handleSendOtp() {
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) { setError("Invalid phone number"); return; }
    setPhoneLoading(true);
    setError("");
    try {
      await apiJson("/auth/send-otp", { method: "POST", body: JSON.stringify({ phone: phone.replace(/\D/g, ""), portal }) });
      setOtpSent(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to send code"); }
    finally { setPhoneLoading(false); }
  }

  async function handleVerifyOtp() {
    if (otpCode.length !== 6) { setError("Enter 6-digit code"); return; }
    setPhoneLoading(true);
    setError("");
    try {
      const data = await apiJson<{ accessToken: string; user: { id: string; email: string; roles: string[] } }>("/auth/verify-otp", {
        method: "POST", body: JSON.stringify({ phone: phone.replace(/\D/g, ""), code: otpCode, portal })
      });
      setAuthSession({ accessToken: data.accessToken, user: data.user });
      router.push(portal === "admin" ? "/admin/dashboard" : portal === "partner" ? "/partner/dashboard" : portal === "driver" ? "/driver/onboard" : "/rider/dashboard");
    } catch (e) { setError(e instanceof Error ? e.message : "Invalid code"); }
    finally { setPhoneLoading(false); }
  }

  return (
    <Card className="w-full max-w-md border-white/5 bg-slate-900/40 backdrop-blur-2xl p-8 relative overflow-hidden">
      {/* Visual Accents */}
      <div className="absolute -top-24 -right-24 size-48 bg-sky-500/10 blur-[60px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
             <h1 className="text-3xl font-black text-white">{PORTAL_LABELS[portal]}</h1>
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
               {isRegister ? "Create Account" : "Access Portal"}
             </p>
          </div>
          <Badge tone="info" className="bg-sky-500/10 text-[10px]">{portal}</Badge>
        </div>

        {canRegister && !phoneMode && (
          <div className="flex p-1 bg-slate-950/50 rounded-2xl border border-white/5">
            <button
              onClick={() => setIsRegister(false)}
              className={cn("flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-xl", !isRegister ? "bg-sky-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-100")}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={cn("flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-xl", isRegister ? "bg-sky-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-100")}
            >
              Sign Up
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!phoneMode ? (
            <motion.div 
              key="email" 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 10 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                    <Mail className="size-3" /> Email Address
                 </label>
                 <Input
                   placeholder="you@lumiride.com.au"
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                 />
              </div>

              {isRegister && (
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Confirm Email</label>
                   <Input
                     placeholder="Confirm your email"
                     type="email"
                     value={emailConfirm}
                     onChange={(e) => setEmailConfirm(e.target.value)}
                   />
                </div>
              )}

              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center justify-between">
                    <span className="flex items-center gap-2"><Lock className="size-3" /> Password</span>
                    {!isRegister && (
                      <Link href={`/forgot-password?portal=${portal}`} className="text-sky-400 hover:text-sky-300">Forgot?</Link>
                    )}
                 </label>
                 <div className="relative group">
                   <Input
                     placeholder={isRegister ? "Min 8 chars, 1 symbol" : "Enter password"}
                     type={showPassword ? "text" : "password"}
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     onFocus={() => setPasswordFocused(true)}
                     onBlur={() => setPasswordFocused(false)}
                     className="pr-12"
                   />
                   <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sky-400 transition-colors"
                   >
                     {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                   </button>
                 </div>
                 {isRegister && (password.length > 0 || passwordFocused) && (
                   <div className="pt-2">
                     <PasswordStrength password={password} inline />
                   </div>
                 )}
              </div>

              {isRegister && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Confirm Password</label>
                     <Input
                       placeholder="Repeat password"
                       type={showPassword ? "text" : "password"}
                       value={passwordConfirm}
                       onChange={(e) => setPasswordConfirm(e.target.value)}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                       <User className="size-3" /> Full Name
                     </label>
                     <Input
                       placeholder="Your Name"
                       value={fullName}
                       onChange={(e) => setFullName(e.target.value)}
                     />
                   </div>
                </motion.div>
              )}

              <Button
                disabled={loading}
                className="w-full h-12 shadow-xl"
                onClick={() => submitAuth(isRegister ? "register" : "login")}
              >
                {loading ? "Authenticating..." : isRegister ? "Complete Sign Up" : "Enter Portal"}
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="phone" 
              initial={{ opacity: 0, x: 10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="space-y-5">
                {!otpSent ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                      <Phone className="size-3" /> Phone Number (AU)
                    </label>
                    <Input
                      placeholder="04XX XXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    />
                    <Button disabled={phoneLoading} onClick={handleSendOtp} className="w-full mt-4">
                      {phoneLoading ? "Sending Code..." : "Send SMS Login Code"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                      <ShieldCheck className="size-3" /> Verification Code
                    </label>
                    <Input
                      placeholder="6-digit code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    />
                    <Button disabled={phoneLoading || otpCode.length !== 6} onClick={handleVerifyOtp} className="w-full">
                      {phoneLoading ? "Verifying..." : "Verify & Sign In"}
                    </Button>
                    <button onClick={() => setOtpSent(false)} className="w-full text-center text-xs text-sky-400 font-bold uppercase tracking-widest">Resend SMS</button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setPhoneMode(false)}
                className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase hover:text-white transition-colors"
              >
                <ChevronLeft className="size-3" /> Back to Email
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alternatives */}
        {(portal === "rider" || portal === "driver") && !phoneMode && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px bg-white/5 flex-1" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">or</span>
              <div className="h-px bg-white/5 flex-1" />
            </div>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 rounded-2xl h-11"
                onClick={handleGoogle}
              >
                <svg className="size-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-2xl h-11"
                onClick={() => setPhoneMode(true)}
              >
                <Phone className="size-4 mr-2 text-slate-400" /> Phone
              </Button>
            </div>
          </div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
             <p className="text-xs font-bold text-rose-400 text-center">{error}</p>
          </motion.div>
        )}

        <div className="pt-4 text-center">
           <Link 
             href="/login" 
             className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-colors"
           >
              ← Portal Selection
           </Link>
        </div>
      </div>
    </Card>
  );
}
