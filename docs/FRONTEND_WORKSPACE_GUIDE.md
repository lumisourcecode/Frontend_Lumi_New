# Lumi Ride Frontend Workspace Guide

## Purpose
This guide maps each major feature to the file/folder where you should build or edit it.

## Route Structure

### Public site
- Home: `src/app/(public)/page.tsx`
- About: `src/app/(public)/about/page.tsx`
- Book My Ride: `src/app/(public)/book-my-ride/page.tsx`
- Drive With Us: `src/app/(public)/drive-with-us/page.tsx`
- Partners: `src/app/(public)/partners/page.tsx`
- Help: `src/app/(public)/help/page.tsx`
- Public shell/header/footer: `src/app/(public)/layout.tsx`, `src/components/layout/public-header.tsx`

### Admin workspace
- Shell: `src/app/(admin)/layout.tsx`
- Navigation map: `src/lib/navigation.ts`
- Dashboard: `src/app/(admin)/admin/dashboard/page.tsx`
- Dispatch: `src/app/(admin)/admin/dispatch/page.tsx`
- Users: `src/app/(admin)/admin/users/page.tsx`
- Driver enrollments: `src/app/(admin)/admin/enrollments/page.tsx`
- CRM: `src/app/(admin)/admin/crm/page.tsx`
- Client history: `src/app/(admin)/admin/trips-history/page.tsx`
- Billing: `src/app/(admin)/admin/billing/page.tsx`
- Payments: `src/app/(admin)/admin/payments/page.tsx`
- Driver reviews: `src/app/(admin)/admin/reviews/page.tsx`
- Reports: `src/app/(admin)/admin/reports/page.tsx`
- Agent review: `src/app/(admin)/admin/agents/page.tsx`
- Compliance: `src/app/(admin)/admin/compliance/page.tsx`
- Settings: `src/app/(admin)/admin/settings/page.tsx`

### Rider workspace
- Layout: `src/app/(rider)/layout.tsx`
- Dashboard: `src/app/(rider)/rider/dashboard/page.tsx`
- Book: `src/app/(rider)/rider/book/page.tsx`
- History: `src/app/(rider)/rider/history/page.tsx`
- Profile: `src/app/(rider)/rider/profile/page.tsx`

### Driver workspace
- Layout: `src/app/(driver)/layout.tsx`
- Shift: `src/app/(driver)/driver/shift/page.tsx`
- Manifest: `src/app/(driver)/driver/manifest/page.tsx`
- Earnings: `src/app/(driver)/driver/earnings/page.tsx`

### Agent workspace
- Layout: `src/app/(agent)/layout.tsx`
- Clients: `src/app/(agent)/agent/clients/page.tsx`
- Bulk upload: `src/app/(agent)/agent/bulk-upload/page.tsx`
- Reports: `src/app/(agent)/agent/reports/page.tsx`
- Partner dashboard: `src/app/(agent)/agent/partners/page.tsx`

## Shared UI and behavior
- UI primitives (buttons, cards, inputs, badges): `src/components/ui/primitives.tsx`
- Portal shell (sidebar/topbar): `src/components/layout/portal-shell.tsx`
- Global colors/theme vars: `src/app/globals.css`
- Utility helpers: `src/lib/utils.ts`
- Dispatch and automation helpers: `src/lib/automation.ts`
- Fare rules (MPTP): `src/lib/mptp.ts`

## Recommended next implementation order
1. Connect forms to API routes or server actions.
2. Replace placeholder tables with real query data.
3. Add shared types in `src/lib` for `Booking`, `User`, `DriverApplication`, `Invoice`, and `Payment`.
4. Add charts (recharts or similar) for reports/dashboard trends.
5. Add route-level loading and empty states for each workspace page.

## Suggested backend contracts to implement first
- `POST /api/bookings`
- `POST /api/driver-applications`
- `GET /api/admin/dashboard`
- `GET /api/payments`
- `POST /api/payments/manual-confirm`
- `GET /api/reports/summary`
