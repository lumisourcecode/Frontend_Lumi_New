import { Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

export default function AgentBulkUploadPage() {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-gradient-to-r from-[#131E65] to-[#2A8CBC] text-white">
        <h1 className="text-2xl font-bold">Bulk Upload Center</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Upload high-volume client manifests and create rides at scale for care organizations.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Upload Manifest File</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input type="file" accept=".csv" />
          <Select>
            <option>Template: Standard Facility Manifest</option>
            <option>Template: Mental Health Outreach</option>
            <option>Template: Dialysis Group</option>
          </Select>
          <Select>
            <option>Date Format: DD/MM/YYYY</option>
            <option>Date Format: YYYY-MM-DD</option>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Validate File</Button>
          <Button variant="outline">Preview Rows</Button>
          <Button variant="outline">Import & Create Trips</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Column Mapping</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Select><option>Client Name to Column A</option></Select>
          <Select><option>Pickup Address to Column B</option></Select>
          <Select><option>Drop-off Address to Column C</option></Select>
          <Select><option>Date to Column D</option></Select>
          <Select><option>Time to Column E</option></Select>
          <Select><option>Mobility Needs to Column F</option></Select>
        </div>
        <Textarea className="mt-3" placeholder="Mapping notes and transformation rules" />
      </Card>
    </div>
  );
}
