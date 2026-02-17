import Link from "next/link";
import { Chrome, Clock3, ShieldCheck } from "lucide-react";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <Card className="border-none bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-2)] to-[var(--color-primary-3)] text-white">
        <h1 className="text-3xl font-bold">Welcome Back to Lumi</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-200">
          One secure sign-in for riders, drivers, partners, and admin teams with role-based access and protected records.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="text-lg font-bold text-[var(--color-primary)]">Secure Login</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Button className="md:col-span-2">
              <Chrome className="mr-2 size-4" />
              Continue with Google
            </Button>
            <Input placeholder="Email or phone" />
            <Input placeholder="Password / OTP" type="password" />
            <Select defaultValue="user" className="md:col-span-2">
              <option value="user">Login as User (Rider)</option>
              <option value="driver">Login as Driver</option>
              <option value="partner">Login as Partner</option>
              <option value="admin">Login as Admin</option>
            </Select>
            <Button className="md:col-span-2">Sign In</Button>
            <p className="md:col-span-2 text-xs text-slate-600">
              Demo mode enabled. All roles can open their dashboard directly for now.
            </p>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-bold text-[var(--color-primary)]">Role Status</h3>
          <div className="mt-3 space-y-2 text-sm">
            <p>User Login: <Badge tone="certified">Enabled</Badge></p>
            <p>Driver Login: <Badge tone="certified">Enabled</Badge></p>
            <p>Partner Login: <Badge tone="certified">Enabled</Badge></p>
            <p>Admin Login: <Badge tone="certified">Enabled</Badge></p>
          </div>
          <p className="mt-4 text-xs text-slate-600">
            Trip history and billing data stay account-protected for privacy and compliance.
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="font-bold text-[var(--color-primary)]">Quick Dashboard Access</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/rider/dashboard"><Button>User Dashboard</Button></Link>
          <Link href="/driver/dashboard"><Button>Driver Dashboard</Button></Link>
          <Link href="/agent/dashboard"><Button>Partner Dashboard</Button></Link>
          <Link href="/admin/dashboard"><Button>Admin Dashboard</Button></Link>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
            <ShieldCheck className="size-4" />
            Secure account
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Personal details, payment preferences, and service accessibility data are protected.
          </p>
        </Card>
        <Card>
          <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
            <Clock3 className="size-4" />
            Faster rebooking
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Save locations, support needs, and preferred cards for one-tap booking.
          </p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-[var(--color-primary)]">History & Bills</p>
          <p className="mt-2 text-xs text-slate-600">
            All ride records, invoices, and payment receipts available in one place.
          </p>
          <Link href="/rider/history" className="mt-3 inline-block">
            <Button variant="outline">Open Travel History</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
