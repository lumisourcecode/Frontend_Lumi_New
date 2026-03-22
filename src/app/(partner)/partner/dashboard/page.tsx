"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Calendar, 
  Activity, 
  AlertCircle, 
  ShieldCheck, 
  Heart, 
  Plus, 
  Search,
  LayoutDashboard,
  FileText,
  CreditCard,
  Briefcase,
  Layers,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge, Button, Card, Input, Progress } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Stats = { clientsEnrolled: number; ridesToday: number; inTransit: number; pendingApprovals: number };

export default function PartnerDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<Stats>("/partner/stats", undefined, session.accessToken)
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Search & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 max-w-xl relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
          <Input 
            placeholder="Search clients, staff, or bookings..." 
            className="pl-12 bg-slate-950/50 border-white/5 focus:bg-slate-900"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Link href="/partner/bookings">
            <Button className="shadow-lg shadow-sky-500/20">
              <Plus className="size-4 mr-2" /> New Booking
            </Button>
          </Link>
          <Button variant="outline">
            <Layers className="size-4 mr-2" /> Bulk Manifest
          </Button>
        </div>
      </div>

      {/* Hero / Brand Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-slate-900 to-indigo-950 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="size-4 text-rose-400 fill-rose-400/20" />
                <Badge tone="info" className="bg-sky-500/20">Partner Ecosystem</Badge>
              </div>
              <h1 className="text-3xl font-black gradient-text">Operations Center</h1>
              <p className="text-slate-400 text-sm max-w-xl font-medium leading-relaxed">
                Centralized command for Aged Care, NDIS, and Corporate transport.
                Manage your workforce and client journeys with real-time insight.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
               <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Invoicing Health</p>
                 <div className="flex items-center gap-3">
                   <h4 className="text-xl font-black text-sky-400">$12,450</h4>
                   <Badge tone="certified" className="text-[8px] h-4">On Track</Badge>
                 </div>
               </div>
               <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Compliance</p>
                 <div className="flex items-center gap-3">
                   <h4 className="text-xl font-black text-emerald-400">98%</h4>
                   <ShieldCheck className="size-4 text-emerald-400" />
                 </div>
               </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Clients", value: stats?.clientsEnrolled ?? "0", icon: Users, trend: "+4 this week", color: "sky" },
          { label: "Daily Rides", value: stats?.ridesToday ?? "0", icon: Activity, trend: "8% above avg", color: "indigo" },
          { label: "In Transit", value: stats?.inTransit ?? "0", icon: Clock, trend: "Avg ETA 12m", color: "emerald" },
          { label: "Approvals", value: stats?.pendingApprovals ?? "0", icon: AlertCircle, trend: "Needs attention", color: "rose" },
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="group relative overflow-hidden transition-all hover:border-white/10">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all">
                <item.icon className="size-10" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
              <h3 className="text-2xl font-black text-slate-100">{item.value}</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase flex items-center gap-1">
                {item.trend}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Main Productivity Section */}
        <div className="lg:col-span-8 space-y-8">
          {/* Live Operations Map Placeholder */}
          <Card className="p-0 overflow-hidden relative h-[450px]">
             <div className="absolute top-0 left-0 right-0 z-10 p-6 pointer-events-none">
                <div className="flex items-center justify-between">
                   <div className="space-y-2 pointer-events-auto">
                      <Badge tone="info" className="bg-sky-500/30 backdrop-blur-xl">Network Overview</Badge>
                      <h2 className="text-xl font-black text-white drop-shadow-md">Active Client Flows</h2>
                   </div>
                   <div className="pointer-events-auto flex gap-2">
                      <Button size="sm" variant="outline" className="bg-slate-900/80 backdrop-blur-md">Live ETAs</Button>
                      <Button size="sm" variant="outline" className="bg-slate-900/80 backdrop-blur-md">Hotspots</Button>
                   </div>
                </div>
             </div>
             
             <div className="w-full h-full bg-slate-950 flex items-center justify-center">
                <div className="absolute inset-0 opacity-20">
                   <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500 blur-[130px] rounded-full" />
                   <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 blur-[130px] rounded-full" />
                </div>
                <div className="relative z-20 text-center space-y-4 max-w-sm px-6">
                   <Activity className="size-16 text-slate-800 mx-auto" />
                   <h4 className="text-lg font-bold text-slate-300">Intelligent Logistics View</h4>
                   <p className="text-sm text-slate-500 leading-relaxed font-medium">
                     Real-time tracking of all facility pickups and NDIS provider drop-offs across your territory.
                   </p>
                   <Button variant="outline" size="sm" className="mt-4">Expand Live View</Button>
                </div>
             </div>
             
             <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 to-transparent">
                <div className="flex gap-3">
                   <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Facility A: All Clear</span>
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Facility B: 2 Delays</span>
                   </div>
                </div>
             </div>
          </Card>

          {/* Workforce / Roster CRM Preview */}
          <div className="grid gap-8 md:grid-cols-2">
             <Card>
                <div className="flex items-center justify-between mb-6">
                   <h3 className="font-bold text-slate-100 flex items-center gap-2">
                      <Calendar className="size-4 text-sky-400" /> Care Roster
                   </h3>
                   <Link href="/partner/roster" className="text-[10px] font-bold text-slate-500 hover:text-sky-400 uppercase tracking-widest">View All</Link>
                </div>
                <div className="space-y-4">
                   {[
                     { staff: "Sarah J.", role: "Registered Nurse", shift: "8:00 AM - 4:00 PM", status: "certified" },
                     { staff: "Michael T.", role: "Support Worker", shift: "10:30 AM - 6:30 PM", status: "certified" },
                     { staff: "Elena R.", role: "Case Manager", shift: "9:00 AM - 5:00 PM", status: "pending" },
                   ].map((item, idx) => (
                     <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="size-8 rounded-xl bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                             {item.staff.split(' ').map(n=>n[0]).join('')}
                           </div>
                           <div>
                              <p className="text-xs font-bold text-slate-100">{item.staff}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{item.role}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-bold text-sky-400">{item.shift}</p>
                           <Badge tone={item.status as any} className="text-[8px] h-3.5 mt-0.5">{item.status}</Badge>
                        </div>
                     </div>
                   ))}
                </div>
             </Card>

             <Card>
                <div className="flex items-center justify-between mb-6">
                   <h3 className="font-bold text-slate-100 flex items-center gap-2">
                      <CreditCard className="size-4 text-indigo-400" /> Billing Insight
                   </h3>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                        <span>NDIS Budget Utilization</span>
                        <span className="text-sky-400">72%</span>
                      </div>
                      <Progress value={72} />
                   </div>
                   <div className="space-y-3">
                      {[
                        { label: "Pending Claims", amount: "$3,210", color: "indigo" },
                        { label: "Draft Invoices", amount: "$1,890", color: "slate" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                           <span className="text-xs font-bold text-slate-400">{item.label}</span>
                           <span className="text-sm font-black text-slate-100">{item.amount}</span>
                        </div>
                      ))}
                   </div>
                   <Button variant="outline" size="sm" className="w-full">Open Financial Hub</Button>
                </div>
             </Card>
          </div>
        </div>

        {/* Sidebar Context Cards */}
        <div className="lg:col-span-4 space-y-8">
           {/* Critical Alerts */}
           <Card className="bg-rose-500/5 border-rose-500/20 backdrop-blur-xl">
              <h3 className="font-bold text-rose-100 flex items-center gap-2 mb-4">
                 <AlertCircle className="size-4 text-rose-400" /> Urgent Follow-up
              </h3>
              <div className="space-y-3">
                 <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/10 space-y-2">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">Escalation</p>
                    <p className="text-xs text-slate-300 leading-relaxed font-bold">
                      NDIS Enrollment expiring for 2 clients (John D., Maria S.) within 48 hours.
                    </p>
                    <Button variant="danger" size="sm" className="w-full h-9 text-[10px]">Renew Now</Button>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <p className="text-xs font-bold text-slate-200">Incident Reported</p>
                    <p className="text-[10px] text-slate-500">Pick-up delay at Monash Medical via Driver #402.</p>
                 </div>
              </div>
           </Card>

           {/* Quick Operations Menu */}
           <Card className="p-0 overflow-hidden border-none shadow-2xl">
              <div className="p-6 bg-slate-900/80 space-y-1">
                 <h3 className="text-lg font-black text-white flex items-center gap-2">
                   <LayoutDashboard className="size-4 text-sky-400" /> Admin Console
                 </h3>
                 <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Internal CRM Suite</p>
              </div>
              <div className="p-2 space-y-1 bg-slate-950/50">
                {[
                  { label: "Client CRM", icon: Users, href: "/partner/clients", color: "sky" },
                  { label: "Shift Care", icon: Briefcase, href: "/partner/roster", color: "indigo" },
                  { label: "Attendance", icon: Clock, href: "/partner/reports", color: "emerald" },
                  { label: "Employee Hub", icon: ShieldCheck, href: "/partner/profile", color: "amber" },
                  { label: "Xero Invoicing", icon: FileText, href: "/partner/billing", color: "blue" },
                ].map((item) => (
                  <Link key={item.label} href={item.href}>
                    <button className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/5 transition-all group">
                       <item.icon className={cn("size-4 text-slate-500 group-hover:scale-110 transition-transform", `group-hover:text-${item.color}-400`)} />
                       <span className="text-sm font-bold text-slate-400 group-hover:text-slate-100">{item.label}</span>
                    </button>
                  </Link>
                ))}
              </div>
           </Card>

           {/* Performance Insight */}
           <Card className="bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border-sky-500/20">
              <h4 className="text-xs font-black text-sky-400 uppercase tracking-[0.2em] mb-3">System Intelligence</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Analysis of today's shifts suggests moving 2 support workers to <strong>Morning Prep</strong> for optimized coverage.
              </p>
              <Button variant="soft" size="sm" className="w-full mt-4">Apply Recommendation</Button>
           </Card>
        </div>
      </div>
    </div>
  );
}
