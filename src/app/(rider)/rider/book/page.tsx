import Link from "next/link";
import { Button, Card } from "@/components/ui/primitives";

export default function RiderBookPage() {
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
        <Link href="/rider/history">
          <Button variant="outline">View My History</Button>
        </Link>
      </div>
    </Card>
  );
}
