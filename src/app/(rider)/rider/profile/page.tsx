import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

export default function RiderProfilePage() {
  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Rider Profile & Preferences</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Manage personal details, usual locations, payment methods, service preferences, and
          referral rewards.
        </p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Personal Information</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Input defaultValue="Alex Morgan" placeholder="Full name" />
            <Input defaultValue="+61 400 111 222" placeholder="Phone" />
            <Input defaultValue="alex.morgan@example.com" placeholder="Email" className="md:col-span-2" />
            <Input defaultValue="430998211" placeholder="NDIS Number" />
            <Select defaultValue="plan-managed">
              <option value="plan-managed">Plan Managed</option>
              <option value="self-managed">Self Managed</option>
              <option value="agency-managed">Agency Managed</option>
            </Select>
            <Input defaultValue="planmanager@agency.com" placeholder="Plan Manager Email" className="md:col-span-2" />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Usual Locations</h2>
          <div className="mt-3 space-y-2">
            <div className="rounded-2xl border border-slate-200 p-3 text-sm">Home: 18 Oak Ave, Glen Waverley</div>
            <div className="rounded-2xl border border-slate-200 p-3 text-sm">Hospital: Monash Medical Centre</div>
            <div className="rounded-2xl border border-slate-200 p-3 text-sm">Clinic: Eastside Dialysis Unit</div>
          </div>
          <Button variant="outline" className="mt-3">
            Add New Saved Location
          </Button>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Cards & Auto Payment</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="rounded-2xl border border-slate-200 p-3">
              Visa ending 4242 <Badge tone="certified">Default</Badge>
            </div>
            <div className="rounded-2xl border border-slate-200 p-3">Mastercard ending 9341</div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Input placeholder="Cardholder Name" />
            <Input placeholder="Card Number" />
            <Input placeholder="MM/YY" />
            <Input placeholder="CVV" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button>Save Card</Button>
            <Button variant="outline">Enable Automatic Payment</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Service Preferences</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Select defaultValue="wheelchair">
              <option value="wheelchair">Wheelchair-accessible</option>
              <option value="service-animal">Service Animal</option>
              <option value="companion">Carer Companion</option>
              <option value="door-assist">Door-to-door assistance</option>
            </Select>
            <Select defaultValue="english">
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="mandarin">Mandarin</option>
              <option value="arabic">Arabic</option>
            </Select>
            <Textarea
              placeholder="Special instructions for drivers and support workers"
              className="md:col-span-2"
              defaultValue="Please call on arrival. Gate code: 2418."
            />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Emergency & Carer Contacts</h2>
          <div className="mt-3 grid gap-3">
            <Input defaultValue="Priya Morgan - Daughter (+61 444 333 222)" />
            <Input defaultValue="Care Coordinator - Lakeside Support (+61 422 998 221)" />
            <Button variant="outline">Add Contact</Button>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Refer & Earn</h2>
          <p className="mt-2 text-sm text-slate-700">
            Invite a friend and both get <strong>$20 off</strong> on your next eligible ride.
          </p>
          <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm">
            Referral Code: <strong>LUMI-ALEX-20</strong>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button>Share Referral Link</Button>
            <Button variant="outline">View Referral Rewards</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
