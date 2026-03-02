"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

const CRITERIA = [
  { id: "upperLower", label: "Upper & lower case letters", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { id: "symbol", label: "A symbol (#$&@!)", test: (p: string) => /[#$&@!%*?^+=._-]/.test(p) },
  { id: "number", label: "A number", test: (p: string) => /\d/.test(p) },
  { id: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
] as const;

export function getPasswordStrength(password: string): { score: number; criteria: { id: string; met: boolean }[] } {
  const criteria = CRITERIA.map((c) => ({ id: c.id, met: c.test(password) }));
  const score = criteria.filter((c) => c.met).length;
  return { score, criteria };
}

type PasswordStrengthProps = {
  password: string;
  showTooltip?: boolean;
  inline?: boolean;
  className?: string;
};

export function PasswordStrength({ password, showTooltip = true, inline = false, className }: PasswordStrengthProps) {
  const { score, criteria } = useMemo(() => getPasswordStrength(password), [password]);
  const visible = password.length > 0 && showTooltip;

  if (!visible) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200/80 bg-slate-50/80 p-3",
        inline ? "mt-2 w-full max-w-sm" : "absolute left-full top-0 z-10 ml-2 w-56 bg-white shadow-lg",
        className,
      )}
    >
      <p className="mb-2 text-xs font-medium text-slate-600">Strong password</p>
      <div className="mb-2 flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full",
              i <= score ? "bg-emerald-500" : "bg-slate-200",
            )}
          />
        ))}
      </div>
      <p className="mb-1.5 text-xs text-slate-500">It&apos;s better to have:</p>
      <ul className="space-y-1">
        {CRITERIA.map((c, i) => {
          const met = criteria[i]?.met ?? false;
          return (
            <li
              key={c.id}
              className={cn(
                "flex items-center gap-2 text-xs",
                met ? "text-emerald-600" : "text-slate-400",
              )}
            >
              <span className={cn("font-bold", met ? "text-emerald-500" : "text-slate-300")}>
                {met ? "✔" : "○"}
              </span>
              {c.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function usePasswordStrength(password: string) {
  return useMemo(() => getPasswordStrength(password), [password]);
}
