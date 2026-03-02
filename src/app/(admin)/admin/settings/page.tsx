import { Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Configure organization-wide behavior for dispatch automation, billing rules, messaging, and security controls.
        </p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Automation Defaults</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Select defaultValue="on">
              <option value="on">Auto dispatch matching: ON</option>
              <option value="off">Auto dispatch matching: OFF</option>
            </Select>
            <Select defaultValue="on">
              <option value="on">Auto invoice creation: ON</option>
              <option value="off">Auto invoice creation: OFF</option>
            </Select>
            <Select defaultValue="on">
              <option value="on">Auto invoice send (trip complete): ON</option>
              <option value="off">Auto invoice send (trip complete): OFF</option>
            </Select>
            <Select defaultValue="on">
              <option value="on">Auto payment notifications: ON</option>
              <option value="off">Auto payment notifications: OFF</option>
            </Select>
            <Input defaultValue="Receipt + payment confirmation" className="md:col-span-2" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button>Save Automation Settings</Button>
            <Button variant="outline">Run Test Workflow</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Branding & Communication</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Input defaultValue="Lumi Ride" />
            <Input defaultValue="support@lumiride.com.au" />
            <Input defaultValue="+61 1300 000 000" />
            <Select defaultValue="aest">
              <option value="aest">Timezone: AEST/AEDT</option>
              <option value="utc">Timezone: UTC</option>
            </Select>
            <Textarea className="md:col-span-2" defaultValue="Thank you for riding with Lumi Ride. Your receipt and trip summary are attached." />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button>Save Communication Settings</Button>
            <Button variant="outline">Preview Rider Message</Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Security & Access</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Select defaultValue="required">
              <option value="required">MFA: Required for all admins</option>
              <option value="optional">MFA: Optional</option>
            </Select>
            <Select defaultValue="30">
              <option value="30">Session timeout: 30 min</option>
              <option value="60">Session timeout: 60 min</option>
              <option value="120">Session timeout: 120 min</option>
            </Select>
            <Select defaultValue="strict">
              <option value="strict">Password policy: Strict</option>
              <option value="standard">Password policy: Standard</option>
            </Select>
            <Select defaultValue="on">
              <option value="on">IP allowlisting: ON</option>
              <option value="off">IP allowlisting: OFF</option>
            </Select>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button>Save Security Settings</Button>
            <Button variant="outline">View Access Logs</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">System Integrations</h2>
          <div className="mt-3 grid gap-3">
            <Input defaultValue="Xero: Connected" readOnly />
            <Input defaultValue="PRODA: Connected" readOnly />
            <Input defaultValue="Employment Hero: Connected" readOnly />
            <Input defaultValue="SMS Gateway: Connected" readOnly />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline">Re-sync Integrations</Button>
            <Button variant="outline">Download Integration Health Log</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
