"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl px-6 text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-[0_10px_20px_-5px_rgba(14,165,233,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(14,165,233,0.4)] hover:brightness-110",
        outline:
          "border border-white/10 bg-white/5 text-slate-100 backdrop-blur-md hover:bg-white/10 hover:border-white/20",
        soft: "bg-sky-500/10 text-sky-400 hover:bg-sky-500/20",
        ghost: "text-slate-400 hover:text-white hover:bg-white/5",
        danger: "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20",
      },
      size: {
        default: "h-12",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-white/5 bg-slate-900/50 px-4 text-sm text-slate-100 placeholder:text-slate-500 transition-all focus:bg-slate-900 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      className={cn(
        "h-12 w-full rounded-2xl border border-white/5 bg-slate-900/50 px-4 text-sm text-slate-100 transition-all focus:bg-slate-900 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 outline-none appearance-none",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[100px] w-full rounded-2xl border border-white/5 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition-all focus:bg-slate-900 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("premium-card p-6", className)}
      {...props}
    />
  );
}

export function Label({ className, ...props }: HTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none text-slate-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}

type SwitchProps = {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
};

export function Switch({ checked = false, onCheckedChange, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50",
        checked ? "bg-sky-500" : "bg-slate-700",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute top-0.5 left-0.5 inline-block h-6 w-6 rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "certified" | "pending" | "danger" | "info" | "success";
}) {
  const tones: Record<string, string> = {
    default: "bg-slate-800/50 text-slate-400 border border-white/5",
    certified: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    info: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Progress({
  value = 0,
  className,
  indicatorClassName,
}: {
  value?: number;
  className?: string;
  indicatorClassName?: string;
}) {
  return (
    <div className={cn("h-1.5 w-full rounded-full bg-slate-800 overflow-hidden", className)}>
      <div
        className={cn(
          "h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(14,165,233,0.5)]",
          indicatorClassName,
        )}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
