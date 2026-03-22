"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Badge, 
  Button, 
  Card, 
  Progress 
} from "@/components/ui/primitives";
import { 
  Users, 
  Car, 
  Clock, 
  ClipboardCheck, 
  Activity, 
  Zap, 
  ShieldCheck, 
  ArrowUpRight,
  Settings,
  AlertTriangle,
  Info
} from "lucide-react";
import { motion } from "framer-motion";
import { apiJson, getAuthSession } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Stats = {
  ridersCount: number;
  driversCount: number;
  pendingEnrollmentsCount: number;
  bookingsCount: number;
  pendingTripsCount: number;
  activeTripsCount: number;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const session = getAuthSession();

  useEffect(() => {
    if (!session?.accessToken) return;
    apiJson<Stats>("/admin/stats", undefined, session.accessToken)
      .then(setStats)
      .catch(() => {});
  }, [session?.accessToken]);

  const kpis = [
    { label: "Total Riders", value: stats?.ridersCount ?? "...", icon: Users, trend: "+12%", color: "sky" },
    { label: "Verified Drivers", value: stats?.driversCount ?? "...", icon: Car, trend: "+5%", color: "emerald" },
    { label: "Total Bookings", value: stats?.bookingsCount ?? "...", icon: ClipboardCheck, trend: "+24%", color: "indigo" },
    { label: "Pending Dispatch", value: stats?.pendingTripsCount ?? "...", icon: Clock, trend: "-2%", color: "rose" },
    { label: "Active Revenue", value: stats?.activeTripsCount ?? "...", icon: Zap, trend: "+18%", color: "amber" },
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Immersive Header Card */}
      <motion.div variants={item}>
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-slate-900 to-indigo-950 p-8 md:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-sky-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
             <div className="space-y-4">
               <Badge tone="info" className="bg-sky-500/10 border-sky-500/20 py-1.5 px-4 text-[10px] tracking-widest font-black uppercase">
                 <ShieldCheck className="size-3 mr-2 text-sky-400" /> System Integrity: Optimal
               </Badge>
               <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Admin Command Center</h1>
               <p className="max-w-xl text-slate-400 font-medium text-sm leading-relaxed">
                 Unified management of Lumi's Australian transport operations. Monitor live dispatch, oversee NDIS compliance, and manage enterprise user access.
               </p>
               <div className="flex flex-wrap gap-4 pt-2">
                 <Button>Generate Operations PDF</Button>
                 <Button variant="outline" className="border-white/10 hover:bg-white/5">System Logs</Button>
               </div>
             </div>
             
             <Card className="w-full lg:w-72 bg-slate-950/40 backdrop-blur-2xl border-white/10 p-6 space-y-4 shadow-none">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Status</p>
                   <div className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] animate-pulse" />
                </div>
                <div>
                   <p className="text-3xl font-black text-white">Stable</p>
                   <p className="text-xs text-slate-500 mt-1 font-medium italic">Latency: 24ms (Normal)</p>
                </div>
                <div className="pt-2">
                   <Progress value={98} className="h-1.5 bg-white/5" indicatorClassName="bg-emerald-500" />
                   <p className="text-[9px] font-bold text-slate-600 uppercase mt-2">API Uptime 99.98%</p>
                </div>
             </Card>
          </div>
        </Card>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi, idx) => (
          <motion.div key={kpi.label} variants={item}>
            <Card className="p-6 bg-slate-900/40 border-white/5 hover:border-white/10 transition-colors group relative overflow-hidden">
               <div className={cn("absolute -top-12 -right-12 size-24 blur-[40px] opacity-10 rounded-full", `bg-${kpi.color}-500`)} />
               <div className="flex items-center justify-between mb-4">
                  <div className={cn("size-10 rounded-xl flex items-center justify-center bg-slate-950 border border-white/5", `text-${kpi.color}-400`)}>
                     <kpi.icon className="size-5" />
                  </div>
                  <Badge className="bg-white/5 text-[9px] font-black border-none text-emerald-400">{kpi.trend}</Badge>
               </div>
               <p className="text-2xl font-black text-white">{kpi.value}</p>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{kpi.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Priority Actions */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-black text-white uppercase tracking-widest">Priority Workflow Queue</h2>
              <Link href="/admin/activity" className="text-[10px] font-bold text-sky-400 uppercase tracking-widest hover:text-sky-300 transition-colors">Clear All</Link>
           </div>
           
           <div className="space-y-4">
              {(stats?.pendingEnrollmentsCount ?? 0) > 0 && (
                <Card className="p-5 flex items-center justify-between bg-rose-500/5 border-rose-500/10 hover:bg-rose-500/10 transition-colors border-l-4 border-l-rose-500">
                   <div className="flex gap-4 items-center">
                      <div className="size-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                         <AlertTriangle className="size-5 text-rose-500" />
                      </div>
                      <div>
                         <p className="font-bold text-white">Driver Verification Pending</p>
                         <p className="text-xs text-slate-400">{stats?.pendingEnrollmentsCount} applications awaiting document review.</p>
                      </div>
                   </div>
                   <Link href="/admin/enrollments">
                     <Button size="sm" variant="soft" className="bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border-rose-500/20">Review Now</Button>
                   </Link>
                </Card>
              )}

              {(stats?.pendingTripsCount ?? 0) > 0 && (
                <Card className="p-5 flex items-center justify-between bg-amber-500/5 border-amber-500/10 hover:bg-amber-500/10 transition-colors border-l-4 border-l-amber-500">
                   <div className="flex gap-4 items-center">
                      <div className="size-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                         <Clock className="size-5 text-amber-500" />
                      </div>
                      <div>
                         <p className="font-bold text-white">Unassigned Trips Detected</p>
                         <p className="text-xs text-slate-400">{stats?.pendingTripsCount} bookings currently in the dispatch queue.</p>
                      </div>
                   </div>
                   <Link href="/admin/dispatch">
                     <Button size="sm" variant="soft" className="bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border-amber-500/20">Assign Driver</Button>
                   </Link>
                </Card>
              )}

              <Card className="p-5 flex items-center justify-between bg-sky-500/5 border-sky-500/10 border-l-4 border-l-sky-500 opacity-60">
                 <div className="flex gap-4 items-center">
                    <div className="size-10 rounded-full bg-sky-500/20 flex items-center justify-center">
                       <Info className="size-5 text-sky-500" />
                    </div>
                    <div>
                       <p className="font-bold text-white">Daily Operational Report</p>
                       <p className="text-xs text-slate-400">Nightly sync complete. All invoices pushed to Xero.</p>
                    </div>
                 </div>
                 <Badge tone="info" className="bg-sky-500/10 text-[9px]">COMPLETED</Badge>
              </Card>
           </div>
        </motion.div>

        {/* Quick Actions & Tools */}
        <motion.div variants={item} className="space-y-6">
           <h2 className="text-lg font-black text-white uppercase tracking-widest px-2">Rapid Tools</h2>
           <Card className="p-4 bg-slate-900/40 border-white/5 space-y-3">
              {[
                { label: "Onboard Driver", icon: Users, href: "/admin/enrollments" },
                { label: "Manual Booking", icon: Zap, href: "/admin/dispatch" },
                { label: "Activity Logs", icon: Activity, href: "/admin/activity" },
                { label: "User Management", icon: Settings, href: "/admin/users" },
                { label: "Billing & Xero", icon: ClipboardCheck, href: "/admin/billing" },
              ].map(action => (
                <Link key={action.label} href={action.href} className="group w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all">
                   <div className="flex items-center gap-4">
                      <action.icon className="size-5 text-slate-400 group-hover:text-sky-400 transition-colors" />
                      <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{action.label}</span>
                   </div>
                   <ArrowUpRight className="size-4 text-slate-600 group-hover:text-sky-400 transition-colors" />
                </Link>
              ))}
           </Card>
           
           <Card className="p-8 bg-gradient-to-br from-sky-600/20 to-indigo-600/20 border-sky-500/20 text-center space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Need Support?</h3>
              <p className="text-xs text-slate-400 font-medium px-4">Direct access to the Dev Ops emergency line for operational issues.</p>
              <Button variant="outline" className="w-full bg-white/5 border-white/10 text-xs">Contact Infrastructure Team</Button>
           </Card>
        </motion.div>
      </div>

      {/* Automation Health Matrix */}
      <motion.div variants={item} className="space-y-6">
         <h2 className="text-lg font-black text-white uppercase tracking-widest px-2">Automation Health Matrix</h2>
         <div className="grid gap-6 md:grid-cols-4">
            {[
              { label: "NDIS Claim Sync", value: 91, color: "emerald" },
              { label: "Xero Invoicing", value: 95, color: "sky" },
              { label: "Dispatch AI Engine", value: 78, color: "amber" },
              { label: "Twilio SMS Gateway", value: 99, color: "indigo" },
            ].map(m => (
              <Card key={m.label} className="p-6 bg-slate-900/60 border-white/10">
                 <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-slate-300">{m.label}</p>
                    <span className={cn("text-xs font-black", `text-${m.color}-400`)}>{m.value}%</span>
                 </div>
                 <Progress value={m.value} className="h-2 bg-white/5" indicatorClassName={cn(`bg-${m.color}-500`)} />
              </Card>
            ))}
         </div>
      </motion.div>
    </motion.div>
  );
}
