"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Card } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Activity = {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  payload: Record<string, unknown>;
  created_at: string;
  email: string;
};

export default function AdminActivityPage() {
  const [items, setItems] = useState<Activity[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) {
      setError("Please login as admin.");
      return;
    }
    apiJson<{ items: Activity[] }>("/admin/activity?limit=100", undefined, session.accessToken)
      .then((r) => setItems(r.items))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Who enrolled, which driver did what, ride requests, assignments.
        </p>
      </Card>
      {error ? <Card><p className="text-red-600">{error}</p></Card> : null}
      <Card>
        <div className="space-y-2">
          {items.map((a) => (
            <div key={a.id} className="flex flex-wrap items-start gap-2 rounded-xl border border-slate-200 p-3 text-sm">
              <Badge tone="default">{a.action}</Badge>
              <Link href={`/admin/users/${a.user_id}`} className="text-[var(--color-primary)] hover:underline">{a.email || a.user_id}</Link>
              <span className="text-slate-500">{a.entity_type} {a.entity_id}</span>
              <span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleString()}</span>
              {a.payload && Object.keys(a.payload).length > 0 && (
                <pre className="mt-1 w-full overflow-x-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(a.payload)}</pre>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
