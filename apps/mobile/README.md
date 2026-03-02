# Lumi Ride Mobile (Rider + Driver)

Expo (React Native) mobile app for the Rider + Driver portals, powered by Supabase.

## Folder

`apps/mobile/`

## Prereqs

- Node.js 20.x (React Native 0.81 prints a warning unless Node is `>= 20.19.4`.)
- Expo Go installed on your phone (recommended for dev)

## Setup

1) Install deps

```bash
cd "apps/mobile"
npm install
```

2) Create Supabase project and enable Auth

- Supabase Dashboard -> Authentication -> Providers
- Enable Email/Password

3) Create DB tables + RLS

- Supabase Dashboard -> SQL Editor
- Paste and run: `apps/mobile/supabase/schema.sql`

4) Configure env vars

Create `apps/mobile/.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
```

(You can copy `apps/mobile/.env.example`.)

5) Run the app

```bash
npm run start
```

Scan the QR with Expo Go.

## What’s Included

- Auth: email + password (Supabase)
- Rider portal:
  - Booking wizard (3 steps) -> inserts into `bookings` with `status = pending_matching`
  - Trips list (reads from `bookings`)
  - Profile (placeholders for saved locations / payments) + dev role switch
- Driver portal:
  - Manifest (reads from `trips` + `bookings`, updates trip `state`)
  - Shift (clock in/out local placeholder)
  - Earnings (sum completed trips)
  - Profile + documents + verification badge (`driver_documents`)
  - Support chat (stores driver messages in `messages`) + SOS modal

## Quick Test Checklist

1) Sign up (email/password)
2) Confirm you land in Rider portal
3) Create booking
4) Go to Trips -> confirm booking appears
5) Switch role to Driver (Profile tab -> Developer tools -> Set Driver)
6) In Supabase, assign a trip to the driver (example SQL below)
7) Open Driver Manifest -> confirm trip appears and state can advance

### Example seed SQL (dev only)

After you have a rider and driver user created, you can seed:

```sql
-- set your current account to driver
update public.profiles set role = 'driver' where id = auth.uid();

-- add sample documents for current driver
insert into public.driver_documents (driver_id, doc_type, status, expiry)
values
  (auth.uid(), 'Driver License', 'Verified', '2028-09-12'),
  (auth.uid(), 'NDIS Worker Screening', 'Pending Renewal', '2026-03-01');
```

To create a booking + trip, replace the UUID placeholders:

```sql
insert into public.bookings (rider_id,pickup,dropoff,scheduled_at,base_fare,status)
values ('<rider_uuid>','Glen Waverley','Monash Medical Centre', now() + interval '1 hour', 74, 'pending_matching')
returning id;

insert into public.trips (booking_id, driver_id, state, eta)
values ('<booking_uuid>','<driver_uuid>','assigned','08 mins');
```

