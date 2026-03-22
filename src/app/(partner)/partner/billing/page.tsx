"use client";

import { useEffect, useState } from "react";
import { 
  Badge, 
  Button, 
  Card, 
  Switch,
  Input,
  Label
} from "@/components/ui/primitives";
import { 
  FileCheck, 
  Settings2, 
  ArrowUpRight, 
  Layers,
  Search,
  CheckCircle2,
  Clock,
  Download
} from "lucide-react";
import { motion } from "framer-motion";
import { apiJson, getAuthSession } from "@/lib/api-client";

type Invoice = {
  id: string;
  invoice_number: string;
  client_name: string;
  total_amount: number;
  status: string;
  issue_date: string;
};

export default function PartnerBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [autoInvoice, setAutoInvoice] = useState(true);
  const [loading, setLoading] = useState(true);
  const session = getAuthSession();

  useEffect(() => {
    if (!session?.accessToken) return;
    refreshData();
  }, [session?.accessToken]);

  const refreshData = () => {
    setLoading(true);
    // Fetch Invoices
    apiJson<{ items: Invoice[] }>("/partner/invoices", undefined, session?.accessToken)
      .then(res => setInvoices(res.items))
      .catch(console.error);
      
    // Fetch Settings
    apiJson<any>("/partner/billing", undefined, session?.accessToken)
      .then(res => setAutoInvoice(res.auto_invoice))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const updateAutoInvoice = (val: boolean) => {
     setAutoInvoice(val);
     apiJson("/partner/billing", { method: 'PATCH', body: { autoInvoice: val } }, session?.accessToken);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-3xl font-black text-white">Billing & NDIS Claims</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Manage financial records and automated claiming for your clients.</p>
         </div>
         <Button className="bg-indigo-600 hover:bg-indigo-500">
            Export Financial Pack
         </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,320px]">
         <div className="space-y-6">
            <Card className="bg-slate-900/40 border-white/5 p-0 overflow-hidden">
               <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Search className="size-4 text-slate-500" />
                     <input placeholder="Filter by client name or invoice #..." className="bg-transparent border-none text-sm text-white focus:ring-0 w-64" />
                  </div>
                  <div className="flex items-center gap-4">
                     <Badge className="bg-emerald-500/10 text-emerald-400 border-none px-3 py-1">Synced to Xero</Badge>
                     <Badge className="bg-amber-500/10 text-amber-400 border-none px-3 py-1">Pending Approval</Badge>
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-white/2">
                           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Invoiced Entity</th>
                           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Number</th>
                           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                           <th className="px-6 py-4"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {loading ? (
                           <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">Loading ledger...</td></tr>
                        ) : invoices.length === 0 ? (
                           <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium italic">No financial activity recorded recently.</td></tr>
                        ) : invoices.map(inv => (
                           <tr key={inv.id} className="hover:bg-white/2 transition-colors group">
                              <td className="px-6 py-4">
                                 <p className="font-bold text-white text-sm">{inv.client_name}</p>
                                 <p className="text-[10px] text-slate-500 font-medium uppercase">{new Date(inv.issue_date).toLocaleDateString()}</p>
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-400 text-sm italic">{inv.invoice_number}</td>
                              <td className="px-6 py-4 text-sm font-black text-white">AUD {inv.total_amount}</td>
                              <td className="px-6 py-4">
                                 <Badge tone={inv.status === 'paid' ? 'success' : 'pending'} 
                                        className="text-[9px] font-black uppercase">
                                    {inv.status}
                                 </Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <Button variant="soft" size="sm" className="bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Download className="size-3" />
                                 </Button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </Card>
         </div>

         {/* Sidebar Controls */}
         <div className="space-y-8">
            <section className="space-y-4">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                  <Settings2 className="size-3 mr-2 text-indigo-400" /> Automation Rules
               </h3>
               <Card className="p-6 bg-slate-900/60 border-white/5 space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="space-y-0.5">
                        <Label className="text-sm font-bold text-white">Auto-Submit Claims</Label>
                        <p className="text-[10px] text-slate-500">Send PDF to manager instantly</p>
                     </div>
                     <Switch checked={autoInvoice} onCheckedChange={updateAutoInvoice} />
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-white/5">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500">Claim Frequency</Label>
                        <select className="w-full bg-slate-950 border-white/5 rounded-xl text-xs text-white p-3">
                           <option>Immediate (Per Trip)</option>
                           <option>Weekly Batch (Fridays)</option>
                           <option>Monthly Rollup</option>
                        </select>
                     </div>
                  </div>
               </Card>
            </section>

            <Card className="p-6 bg-emerald-500/5 border-emerald-500/10">
               <div className="flex items-center gap-3 mb-4">
                  <div className="size-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                     <FileCheck className="size-4 text-emerald-500" />
                  </div>
                  <h3 className="font-black text-white text-sm uppercase">Compliance Sync</h3>
               </div>
               <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Your NDIS Provider Profile is complete. All transport invoices will automatically include Item Code <span className="text-white">04_590_0125_6_1</span>.
               </p>
            </Card>

            <Card className="p-8 bg-slate-900/40 border-white/5 text-center space-y-4">
               <Layers className="size-8 text-indigo-400 mx-auto opacity-40" />
               <p className="text-xs text-slate-500 font-medium italic leading-relaxed">
                  Need custom billing logic for specialized care packages? 
               </p>
               <Button variant="outline" className="w-full border-white/10 text-[10px] font-black uppercase tracking-widest font-black">
                  Request Custom Rule
               </Button>
            </Card>
         </div>
      </div>
    </div>
  );
}
