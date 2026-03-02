"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DriverEnrollPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/driver/onboard");
  }, [router]);
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <p className="text-slate-500">Redirecting to onboarding...</p>
    </div>
  );
}
