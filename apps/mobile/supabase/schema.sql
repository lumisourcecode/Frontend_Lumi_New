-- Lumi Ride (Mobile) - Supabase schema + RLS
-- Paste into Supabase SQL Editor and run.
-- This is intentionally minimal but complete for Rider + Driver portals.

-- Extensions
create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'rider' check (role in ('rider','driver','agent','admin')),
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Bookings (created by riders; later matched to drivers)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid not null references public.profiles(id) on delete cascade,
  pickup text not null,
  dropoff text not null,
  scheduled_at timestamptz not null,
  recurring boolean not null default false,
  mobility jsonb not null default '{}'::jsonb,
  plan_manager_email text,
  support_category text not null default 'Transport',
  lifting_fee numeric not null default 0,
  mptp_eligible boolean not null default false,
  base_fare numeric not null default 0,
  status text not null default 'pending_matching',
  created_at timestamptz not null default now()
);

create index if not exists bookings_rider_id_idx on public.bookings(rider_id);
create index if not exists bookings_status_idx on public.bookings(status);

-- Trips (assigned to a driver; links 1:1 with booking)
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  driver_id uuid not null references public.profiles(id) on delete cascade,
  state text not null default 'assigned' check (state in ('assigned','arrived','picked_up','drop_off')),
  eta text,
  created_at timestamptz not null default now()
);

create index if not exists trips_driver_id_idx on public.trips(driver_id);
create index if not exists trips_booking_id_idx on public.trips(booking_id);

-- Driver documents / verification
create table if not exists public.driver_documents (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  doc_type text not null,
  status text not null default 'Pending' check (status in ('Pending','Verified','Expired','Pending Renewal')),
  expiry date,
  created_at timestamptz not null default now()
);

create index if not exists driver_documents_driver_id_idx on public.driver_documents(driver_id);

-- Messages (basic support chat; can be linked to a trip later)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete set null,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists messages_trip_id_idx on public.messages(trip_id);

-- Trigger: auto-create profile on auth signup (optional but recommended)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name)
  values (new.id, 'rider', coalesce(new.raw_user_meta_data ->> 'full_name', null))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.trips enable row level security;
alter table public.driver_documents enable row level security;
alter table public.messages enable row level security;

-- Profiles: user reads/updates self
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

-- Bookings: rider can CRUD own
drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own"
on public.bookings for select
using (rider_id = auth.uid());

drop policy if exists "bookings_insert_own" on public.bookings;
create policy "bookings_insert_own"
on public.bookings for insert
with check (rider_id = auth.uid());

drop policy if exists "bookings_update_own" on public.bookings;
create policy "bookings_update_own"
on public.bookings for update
using (rider_id = auth.uid())
with check (rider_id = auth.uid());

-- Bookings: driver can read bookings for assigned trips
drop policy if exists "bookings_driver_read_assigned" on public.bookings;
create policy "bookings_driver_read_assigned"
on public.bookings for select
using (
  exists (
    select 1 from public.trips t
    where t.booking_id = bookings.id
      and t.driver_id = auth.uid()
  )
);

-- Trips: driver reads/updates own trips
drop policy if exists "trips_driver_select_own" on public.trips;
create policy "trips_driver_select_own"
on public.trips for select
using (driver_id = auth.uid());

drop policy if exists "trips_driver_update_state" on public.trips;
create policy "trips_driver_update_state"
on public.trips for update
using (driver_id = auth.uid())
with check (driver_id = auth.uid());

-- Trips: rider can read trips linked to their bookings
drop policy if exists "trips_rider_select_own" on public.trips;
create policy "trips_rider_select_own"
on public.trips for select
using (
  exists (
    select 1 from public.bookings b
    where b.id = trips.booking_id
      and b.rider_id = auth.uid()
  )
);

-- Driver documents: driver reads own
drop policy if exists "driver_documents_driver_select_own" on public.driver_documents;
create policy "driver_documents_driver_select_own"
on public.driver_documents for select
using (driver_id = auth.uid());

-- Messages: sender can read and insert own messages
drop policy if exists "messages_sender_select_own" on public.messages;
create policy "messages_sender_select_own"
on public.messages for select
using (sender_id = auth.uid());

drop policy if exists "messages_sender_insert_own" on public.messages;
create policy "messages_sender_insert_own"
on public.messages for insert
with check (sender_id = auth.uid());

-- Optional seed helpers (run manually after you create a driver profile)
-- Example: mark your account as driver
-- update public.profiles set role = 'driver' where id = auth.uid();
--
-- Example: create a fake booking + assigned trip (replace UUIDs)
-- insert into public.bookings (rider_id,pickup,dropoff,scheduled_at,base_fare,status)
-- values ('<rider_uuid>','Glen Waverley','Monash Medical Centre', now() + interval '1 hour', 74, 'pending_matching');
-- insert into public.trips (booking_id, driver_id, state, eta)
-- values ('<booking_uuid>','<driver_uuid>','assigned','08 mins');

