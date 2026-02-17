import { Button, Card, Input, Select } from "@/components/ui/primitives";

export default function DriverPreferencesPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#151F69] to-[#3C8FC8] text-white">
        <h1 className="text-2xl font-bold">Preferences & Settings</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Configure trip preferences, notifications, navigation defaults, and privacy settings.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Trip Preferences</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Select>
            <option>Preferred Trip Length: Medium</option>
            <option>Preferred Trip Length: Short</option>
            <option>Preferred Trip Length: Long</option>
          </Select>
          <Select>
            <option>Navigation App: Google Maps</option>
            <option>Navigation App: Apple Maps</option>
            <option>Navigation App: Waze</option>
          </Select>
          <Select>
            <option>Auto-Accept Trips: Off</option>
            <option>Auto-Accept Trips: On</option>
          </Select>
          <Select>
            <option>Service Zone Lock: Off</option>
            <option>Service Zone Lock: On</option>
          </Select>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Notification Settings</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Select>
            <option>Trip Alerts: Push + SMS</option>
            <option>Trip Alerts: Push Only</option>
            <option>Trip Alerts: SMS Only</option>
          </Select>
          <Select>
            <option>Payout Alerts: Enabled</option>
            <option>Payout Alerts: Disabled</option>
          </Select>
          <Input placeholder="Emergency contact name" />
          <Input placeholder="Emergency contact phone" />
        </div>
        <Button className="mt-3">Save Preferences</Button>
      </Card>
    </div>
  );
}
