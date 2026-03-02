"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiJson, setAuthSession } from "@/lib/api-client";

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state") as "rider" | "driver" | null;
    const portal = state || "rider";

    if (!code) {
      setError("No authorization code received.");
      return;
    }

    const redirectUri = typeof window !== "undefined"
      ? `${window.location.origin}/auth/google/callback`
      : "";

    apiJson<{ accessToken: string; user: { id: string; email: string; roles: string[] } }>(
      "/auth/google",
      {
        method: "POST",
        body: JSON.stringify({ code, redirectUri, portal }),
      },
    )
      .then((data) => {
        setAuthSession({ accessToken: data.accessToken, user: data.user });
        if (portal === "driver") router.push("/driver/onboard");
        else router.push("/rider/dashboard");
        router.refresh();
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Google sign-in failed"));
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-600">{error}</p>
        <a href="/login" className="text-sm text-slate-600 hover:underline">
          ← Back to portal selection
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <p className="text-slate-600">Signing you in...</p>
    </div>
  );
}
