"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";

export default function RiderBookPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function createQuickBooking() {
    const session = getAuthSession();
    if (!session?.accessToken) {
      setMessage("Please login first to create a booking.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const res = await apiJson<{ booking: { id: string } }>(
        "/rider/bookings",
        {
          method: "POST",
          body: JSON.stringify({
            pickup: "Home",
            dropoff: "Medical Centre",
            scheduledAt,
          }),
        },
        session.accessToken,
      );
      setMessage(`Quick booking created: ${res.booking.id}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to create booking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h1 className="text-xl font-bold text-[var(--color-primary)]">Book a Ride</h1>
      <p className="mt-2 text-sm text-slate-700">
        Use the premium booking flow with login options, card payment setup, and instant
        notifications.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/book-my-ride">
          <Button>Open Booking Portal</Button>
        </Link>
        <Button variant="outline" onClick={createQuickBooking} disabled={loading}>
          {loading ? "Creating..." : "Quick Test Booking"}
        </Button>
        <Link href="/rider/history">
          <Button variant="outline">View My History</Button>
        </Link>
      </div>
      {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
    </Card>
  );
}
