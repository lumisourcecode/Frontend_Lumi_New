"use client";

import { useMemo, useState } from "react";
import { Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

export default function PartnerBulkUploadPage() {
  const [csvText, setCsvText] = useState("");
  const [status, setStatus] = useState("");
  const rows = useMemo(() => csvText.split("\n").map((r) => r.trim()).filter(Boolean), [csvText]);

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
          <Input type="file" accept=".csv" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const txt = await file.text();
            setCsvText(txt);
          }} />
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
          <Button onClick={() => setStatus(rows.length > 0 ? `Validated ${rows.length} row(s).` : "No rows found.")}>Validate File</Button>
          <Button variant="outline">Preview Rows</Button>
          <Button variant="outline">Import & Create Trips</Button>
        </div>
        {status ? <p className="mt-2 text-sm text-slate-600">{status}</p> : null}
        {rows.length > 0 && (
          <div className="mt-3 rounded-xl border border-slate-200 p-3 text-xs text-slate-600">
            Preview first row: {rows[0]}
          </div>
        )}
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
        <Textarea className="mt-3" placeholder="Mapping notes and transformation rules" value={csvText} onChange={(e) => setCsvText(e.target.value)} />
      </Card>
    </div>
  );
}
