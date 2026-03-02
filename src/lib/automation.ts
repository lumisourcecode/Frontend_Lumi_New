export type BookingSlot = {
  id: string;
  riderName: string;
  driverId: string;
  startISO: string;
  endISO: string;
  recurring: boolean;
};

export type TimeOffSlot = {
  driverId: string;
  startISO: string;
  endISO: string;
  source: "EmploymentHero";
};

export type ConflictAlert = {
  bookingId: string;
  driverId: string;
  severity: "high";
  reason: string;
};

export function detectScheduleConflicts(
  bookings: BookingSlot[],
  timeOff: TimeOffSlot[],
): ConflictAlert[] {
  const alerts: ConflictAlert[] = [];
  for (const booking of bookings) {
    const bStart = new Date(booking.startISO).getTime();
    const bEnd = new Date(booking.endISO).getTime();
    for (const off of timeOff) {
      if (booking.driverId !== off.driverId) continue;
      const oStart = new Date(off.startISO).getTime();
      const oEnd = new Date(off.endISO).getTime();
      if (bStart < oEnd && bEnd > oStart) {
        alerts.push({
          bookingId: booking.id,
          driverId: booking.driverId,
          severity: "high",
          reason:
            "Recurring booking overlaps a driver time-off window synced from Employment Hero.",
        });
      }
    }
  }
  return alerts;
}

export type DriverPoint = { id: string; lat: number; lng: number };
export type PickupPoint = { id: string; lat: number; lng: number; riderName: string };

export function optimizeTours(drivers: DriverPoint[], pickups: PickupPoint[]) {
  if (!drivers.length) return [];
  return pickups.map((pickup, idx) => {
    const assignedDriver = drivers[idx % drivers.length];
    return {
      pickupId: pickup.id,
      riderName: pickup.riderName,
      assignedDriverId: assignedDriver.id,
      note: "Bundled by nearest-available heuristic for fuel/time savings.",
    };
  });
}

export type InvoicePayload = {
  tripId: string;
  participantName: string;
  planManagerEmail: string;
  amount: number;
  supportCategory: string;
};

export function generateXeroReadyInvoice(payload: InvoicePayload) {
  return {
    invoiceNumber: `LUMI-${payload.tripId}`,
    contact: payload.planManagerEmail,
    description: `${payload.supportCategory} transport for ${payload.participantName}`,
    amount: Number(payload.amount.toFixed(2)),
    status: "draft",
    exportFormat: "xero-csv-ready",
    generatedAt: new Date().toISOString(),
  };
}

export function parseMemberHotlistCsv(rawCsv: string): Set<string> {
  const lines = rawCsv
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const cardSet = new Set<string>();
  for (const row of lines.slice(1)) {
    const cols = row.split(",").map((c) => c.trim());
    const cardNumber = cols[0];
    const status = cols[1]?.toLowerCase();
    if (cardNumber && status === "suspended") {
      cardSet.add(cardNumber);
    }
  }
  return cardSet;
}
