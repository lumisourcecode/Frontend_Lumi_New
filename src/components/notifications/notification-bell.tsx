"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, ExternalLink, X } from "lucide-react";
import { apiJson, getAuthSession } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { RoleType } from "@/lib/navigation";

type Notification = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

const NOTIFICATION_ENDPOINTS: Record<RoleType, string> = {
  rider: "/rider/notifications",
  driver: "/driver/notifications",
  agent: "/agent/notifications",
  admin: "/admin/notifications",
};

function playNotificationSound() {
  try {
    const Ctx = typeof AudioContext !== "undefined" ? AudioContext : (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // ignore
  }
}

function getNotificationLink(role: RoleType, n: Notification): string | null {
  const p = n.payload;
  const link = p?.link as string | undefined;
  if (link) return link;
  const bookingId = p?.bookingId ?? p?.booking_id;
  const tripId = p?.tripId ?? p?.trip_id;
  if (role === "rider" && bookingId) return `/rider/history`;
  if (role === "driver" && (tripId || bookingId)) return `/driver/manifest`;
  if (role === "agent" && bookingId) return `/agent/bookings`;
  return null;
}

type NotificationBellProps = {
  role: RoleType;
  className?: string;
};

export function NotificationBell({ role, className }: NotificationBellProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Notification | null>(null);
  const [toast, setToast] = useState<Notification | null>(null);
  const prevUnreadRef = useRef(0);

  const endpoint = NOTIFICATION_ENDPOINTS[role];
  const hasEndpoint = endpoint && role !== "admin";

  const fetchNotifications = useCallback(() => {
    if (!hasEndpoint) return;
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: Notification[] }>(endpoint, undefined, session.accessToken)
      .then((r) => {
        const items = r.items || [];
        setNotifications(items);
        const unread = items.filter((n) => !n.read_at).length;
        if (unread > prevUnreadRef.current && prevUnreadRef.current > 0) {
          playNotificationSound();
          const newest = items.find((n) => !n.read_at);
          if (newest) setToast(newest);
        }
        prevUnreadRef.current = unread;
      })
      .catch(() => {});
  }, [endpoint, hasEndpoint]);

  useEffect(() => {
    if (!hasEndpoint) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, hasEndpoint]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  async function markRead(id: string) {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    const base = role === "rider" ? "/rider" : role === "agent" ? "/agent" : "/driver";
    try {
      await apiJson(`${base}/notifications/${id}/read`, { method: "PATCH" }, session.accessToken);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
    } catch {
      // ignore
    }
  }

  function formatType(type: string) {
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function openDetail(n: Notification) {
    setDetail(n);
    if (!n.read_at) markRead(n.id);
  }

  function goToLink(n: Notification) {
    const link = getNotificationLink(role, n);
    if (link) {
      setDetail(null);
      setOpen(false);
      router.push(link);
    }
  }

  if (!hasEndpoint) return null;

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-full z-50 mt-1 w-96 rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
            <div className="border-b border-slate-100 px-3 py-2">
              <h3 className="font-semibold text-slate-900">Notifications</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-slate-500">No notifications yet</p>
              ) : (
                notifications.slice(0, 15).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => openDetail(n)}
                    className={cn(
                      "w-full px-3 py-2.5 text-left text-sm transition hover:bg-slate-50",
                      !n.read_at && "bg-amber-50/50",
                    )}
                  >
                    <p className="font-medium text-slate-900">{formatType(n.type)}</p>
                    {n.payload?.pickup != null ? (
                      <p className="text-xs text-slate-600">
                        {String(n.payload.pickup)} → {String(n.payload.dropoff)}
                      </p>
                    ) : null}
                    {n.payload?.message != null ? (
                      <p className="text-xs text-slate-600 line-clamp-2">{String(n.payload.message)}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-slate-500">{new Date(n.created_at).toLocaleString()}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-[100] rounded-lg border border-slate-200 bg-white p-3 shadow-lg transition-all duration-200">
          <p className="font-medium text-slate-900">{formatType(toast.type)}</p>
          {toast.payload?.pickup != null ? (
            <p className="text-xs text-slate-600">{String(toast.payload.pickup)} → {String(toast.payload.dropoff)}</p>
          ) : null}
          <button
            type="button"
            onClick={() => { setToast(null); setOpen(true); openDetail(toast); }}
            className="mt-2 text-xs text-[var(--color-primary)] hover:underline"
          >
            View details
          </button>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      {detail && (
        <>
          <div className="fixed inset-0 z-[90] bg-black/40" onClick={() => setDetail(null)} aria-hidden />
          <div className="fixed left-1/2 top-1/2 z-[91] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-slate-900">{formatType(detail.type)}</h3>
              <button type="button" onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {detail.payload?.pickup != null && (
                <p><strong>Pickup:</strong> {String(detail.payload.pickup)}</p>
              )}
              {detail.payload?.dropoff != null && (
                <p><strong>Dropoff:</strong> {String(detail.payload.dropoff)}</p>
              )}
              {detail.payload?.scheduledAt != null && (
                <p><strong>Time:</strong> {new Date(String(detail.payload.scheduledAt)).toLocaleString()}</p>
              )}
              {detail.payload?.message != null && (
                <p>{String(detail.payload.message)}</p>
              )}
              {Object.entries(detail.payload || {}).filter(([k]) => !["pickup", "dropoff", "scheduledAt", "message", "bookingId", "tripId", "booking_id", "trip_id", "link"].includes(k)).map(([k, v]) => (
                <p key={k}><strong>{k}:</strong> {String(v)}</p>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">{new Date(detail.created_at).toLocaleString()}</p>
            {getNotificationLink(role, detail) && (
              <button
                type="button"
                onClick={() => goToLink(detail)}
                className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                <ExternalLink className="size-4" />
                {role === "rider" ? "View booking" : role === "driver" ? "Open manifest" : "View booking"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
