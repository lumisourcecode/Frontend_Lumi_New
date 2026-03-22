"use client";

import { useEffect, useState } from "react";
import { 
  Badge, 
  Button, 
  Card, 
  Progress 
} from "@/components/ui/primitives";
import { 
  Receipt, 
  Download, 
  Send, 
  Plus, 
  MoreHorizontal, 
  FileText,
  CreditCard,
  History,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { apiJson, getAuthSession } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Invoice = {
  id: string;
  invoice_number: string;
  recipient_email: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  issue_date: string;
  pdf_url?: string;
};

export default function AdminBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const session = getAuthSession();

  useEffect(() => {
    if (!session?.accessToken) return;
    refreshInvoices();
  }, [session?.accessToken]);

  const refreshInvoices = () => {
    setLoading(true);
    apiJson<{ items: Invoice[] }>("/admin/invoices", undefined, session?.accessToken)
      .then(res => setInvoices(res.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const stats = [
    { label: "Accounts Receivable", value: "$42,850", trend: "+$2,4k this week", color: "indigo" },
    { label: "Paid This Month", value: "$128,400", trend: "92% collection rate", color: "emerald" },
    { label: "Pending Claims", value: "24", trend: "Awaiting NDIS review", color: "amber" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Financial Oversight</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Manage NDIS claims, manual invoices, and Xero synchronization.</p>
         </div>
         <div className="flex gap-3">
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
               <Download className="size-4 mr-2" /> Export Report
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
               <Plus className="size-4 mr-2" /> Manual Invoice
            </Button>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map(s => (
          <Card key={s.label} className="p-6 bg-slate-900/40 border-white/5 relative overflow-hidden">
             <div className={cn("absolute -top-12 -right-12 size-24 blur-[40px] opacity-10 rounded-full", `bg-${s.color}-500`)} />
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
             <p className="text-3xl font-black text-white">{s.value}</p>
             <p className={cn("text-[10px] font-bold mt-2", s.color === 'emerald' ? 'text-emerald-400' : 'text-slate-400')}>
                {s.trend}
             </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
         {/* Live Ledger */}
         <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center">
                  <History className="size-4 mr-2 text-indigo-400" /> Recent Ledger
               </h2>
               <div className="flex gap-2">
                  <Badge className="bg-white/5 text-slate-400">All</Badge>
                  <Badge className="bg-indigo-500/10 text-indigo-400 border-none">Pending</Badge>
               </div>
            </div>

            <Card className="overflow-hidden border-white/5 bg-slate-900/40 p-0">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-white/5 bg-white/2">
                           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Invoice</th>
                           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Recipient</th>
                           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Amount</th>
                           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                           <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {loading ? (
                           <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">Synchronizing with ledger...</td></tr>
                        ) : invoices.length === 0 ? (
                           <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">No recorded transactions found.</td></tr>
                        ) : invoices.map(inv => (
                           <tr key={inv.id} className="hover:bg-white/2 transition-colors group">
                              <td className="px-6 py-4">
                                 <p className="font-bold text-white text-sm">{inv.invoice_number}</p>
                                 <p className="text-[10px] text-slate-500 font-medium">{new Date(inv.issue_date).toLocaleDateString()}</p>
                              </td>
                              <td className="px-6 py-4">
                                 <p className="text-sm text-slate-300 font-medium">{inv.recipient_email}</p>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <p className="font-black text-white text-sm">AUD {inv.total_amount}</p>
                              </td>
                              <td className="px-6 py-4">
                                 <Badge tone={inv.status === 'paid' ? 'success' : inv.status === 'sent' ? 'info' : 'pending'} 
                                        className="text-[9px] font-black uppercase">
                                    {inv.status}
                                 </Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="soft" size="sm" className="size-8 p-0 bg-white/5 hover:bg-white/10">
                                       <Download className="size-3" />
                                    </Button>
                                    <Button variant="soft" size="sm" className="size-8 p-0 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400">
                                       <Send className="size-3" />
                                    </Button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </Card>
         </div>

         {/* Right Sidebar - Integrations & Alerts */}
         <div className="space-y-8">
            <section className="space-y-4">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 group flex items-center">
                  Integrations <ArrowRight className="size-3 ml-2 opacity-0 group-hover:opacity-100 transition-all font-black" />
               </h3>
               <Card className="p-5 bg-slate-900/60 border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-[#13B5EA]/10 flex items-center justify-center">
                           <span className="text-[#13B5EA] font-black text-xs">Xero</span>
                        </div>
                        <div>
                           <p className="text-sm font-bold text-white">Xero Cloud</p>
                           <p className="text-[10px] text-emerald-400 font-bold uppercase">Connected</p>
                        </div>
                     </div>
                     <Button variant="soft" size="sm" className="text-[10px] font-black uppercase bg-white/5">Sync Now</Button>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                     <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2">
                        <span>Last Sync</span>
                        <span>12 mins ago</span>
                     </div>
                     <Progress value={100} className="h-1 bg-white/5" indicatorClassName="bg-emerald-500" />
                  </div>
               </Card>
            </section>

            <section className="space-y-4">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">High Priority Alerts</h3>
               <div className="space-y-3">
                  <Card className="p-4 bg-rose-500/5 border-rose-500/10 border-l-4 border-l-rose-500">
                     <div className="flex gap-3">
                        <AlertCircle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                           <p className="text-xs font-bold text-white">Missing ABN for Participant</p>
                           <p className="text-[10px] text-slate-500 mt-1">Invoice INV-9042 needs Participant ABN to sync to Xero.</p>
                        </div>
                     </div>
                  </Card>
                  <Card className="p-4 bg-amber-500/5 border-amber-500/10 border-l-4 border-l-amber-500 opacity-60">
                     <div className="flex gap-3">
                        <FileText className="size-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                           <p className="text-xs font-bold text-white">Xero Token Refreshing</p>
                           <p className="text-[10px] text-slate-500 mt-1">Manual refresh required in 48 hours for service continuity.</p>
                        </div>
                     </div>
                  </Card>
               </div>
            </section>
            
            <Card className="p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/20 text-center">
               <CreditCard className="size-8 text-indigo-400 mx-auto mb-4" />
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Manual Billing Support</h3>
               <p className="text-[10px] text-slate-400 font-medium mt-2 leading-relaxed">
                  Direct debit integration for enterprise partners is now available in beta. Contact treasury to enable.
               </p>
               <Button variant="outline" className="w-full mt-4 text-[10px] font-black uppercase bg-white/5 border-white/10 tracking-widest"> Treasury Portal </Button>
            </Card>
         </div>
      </div>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
   return (
      <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
         <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
   )
}
