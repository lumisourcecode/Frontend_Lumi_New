"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Map as MapIcon, 
  Zap, 
  Clock, 
  TrendingUp, 
  ShieldAlert, 
  DollarSign, 
  Navigation,
  CheckCircle2,
  AlertCircle,
  Play,
  Coffee,
  Wallet
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Badge,
  Button,
  Card,
  Input,
  Select,
} from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Stats = { tripsToday: number; totalTrips: number; inProgress: number };

export default function DriverDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [manifest, setManifest] = useState<Array<{ id: string; pickup: string; dropoff: string; state: string }>>([]);
  const [notifications, setNotifications] = useState<Array<{ id: string; type: string; payload: Record<string, any>; read_at: string | null; created_at: string }>>([]);
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ verificationStatus: string; enrollment: { status: string } | null }>("/driver/onboarding", undefined, session.accessToken)
      .then((d) => {
        const ok = d.verificationStatus === "Approved" || d.enrollment?.status === "approved";
        setVerified(ok);
        if (!ok) router.replace("/driver/onboard");
      })
      .catch(() => setVerified(false));
  }, [router]);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken || verified !== true) return;
    
    // Polling interval for real-time feel
    const fetchData = () => {
      apiJson<Stats>("/driver/stats", undefined, session.accessToken!).then(setStats).catch(() => {});
      apiJson<{ items: any[] }>("/driver/manifest", undefined, session.accessToken!).then(r => setManifest(r.items.slice(0, 5))).catch(() => {});
      apiJson<{ items: any[] }>("/driver/notifications", undefined, session.accessToken!).then(r => setNotifications(r.items || [])).catch(() => {});
    };
    
    fetchData();
    const timer = setInterval(fetchData, 30000);
    return () => clearInterval(timer);
  }, [verified]);

  if (verified === false || verified === null) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Driver Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <Badge tone="certified" className="mb-2">Verified Partner</Badge>
              <h1 className="text-3xl font-black gradient-text">Driver Operations</h1>
              <p className="text-slate-400 text-sm max-w-md font-medium leading-relaxed">
                Stay online to receive high-priority transport requests from NDIS and Aged Care partners.
              </p>
            </div>
            <div className="flex gap-3">
              <Button size="lg" className="shadow-lg shadow-sky-500/20">
                <Play className="size-4 mr-2" /> Start Shift
              </Button>
              <Button variant="outline" size="lg">
                <Coffee className="size-4 mr-2" /> Break
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Online Time", value: "3h 42m", sub: "Goal: 8h", icon: Clock, color: "sky" },
          { label: "Trips Today", value: stats?.tripsToday ?? "0", sub: `${stats?.inProgress ?? 0} Active`, icon: Navigation, color: "emerald" },
          { label: "Total Trips", value: stats?.totalTrips ?? "—", sub: "Life-time", icon: TrendingUp, color: "indigo" },
          { label: "Earnings", value: "$142.50", sub: "Pending: $24", icon: Wallet, color: "amber" },
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="group relative overflow-hidden transition-all hover:border-white/10">
              <div className={cn("absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all")}>
                <item.icon className="size-10" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
              <h3 className="text-2xl font-black text-slate-100">{item.value}</h3>
              <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase">{item.sub}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Main Operational View */}
        <div className="lg:col-span-8 space-y-8">
          {/* Notifications / Priority alerts */}
          {notifications.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-amber-100 flex items-center gap-2">
                    <Bell className="size-4 text-amber-400 animate-pulse" /> Priority Alerts
                  </h3>
                </div>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((n) => (
                    <div key={n.id} className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-100 uppercase tracking-tight">{n.type.replace(/_/g, " ")}</p>
                        {n.payload?.pickup && (
                          <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px] sm:max-w-md">
                            {n.payload.pickup} → {n.payload.dropoff}
                          </p>
                        )}
                      </div>
                      <Badge tone={n.read_at ? "default" : "pending"} className="shrink-0">Action Needed</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Demand Map / Hotspots */}
          <Card className="overflow-hidden p-0 relative h-[450px]">
             <div className="absolute top-0 left-0 right-0 z-10 p-6 pointer-events-none">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 pointer-events-auto">
                    <Badge tone="info" className="bg-sky-500/20 backdrop-blur-xl">High Demand Zone</Badge>
                    <h2 className="text-xl font-black text-white drop-shadow-md">Surge Analysis</h2>
                  </div>
                  <div className="flex flex-col gap-2 pointer-events-auto">
                     <Button size="sm" variant="outline" className="bg-slate-900/80 backdrop-blur-xl">Surge +25%</Button>
                  </div>
                </div>
             </div>
             
             <div className="w-full h-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
                {/* Heatmap Simulation Background */}
                <div className="absolute inset-0 opacity-40">
                   <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-sky-500 blur-[80px] rounded-full animate-pulse" />
                   <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-500 blur-[120px] rounded-full" />
                </div>
                <div className="relative z-20 text-center space-y-4 max-w-sm px-6">
                   <MapIcon className="size-16 text-slate-700 mx-auto" />
                   <h4 className="text-lg font-bold text-slate-300">Live Heatmap Overlay</h4>
                   <p className="text-sm text-slate-500 leading-relaxed font-medium">
                     Position yourself in high-demand zones to increase trip frequency. Surplus demand detected in SE Melbourne.
                   </p>
                   <Button variant="outline" size="sm" className="mt-4">Position Me</Button>
                </div>
             </div>

             <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 to-transparent">
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" size="sm">Go to Surge Zone</Button>
                  <Button variant="outline" size="sm">Set Filter</Button>
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex">Smart Routing</Button>
                </div>
             </div>
          </Card>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Controls */}
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-700 border-none shadow-2xl p-0 overflow-hidden">
             <div className="p-8 space-y-6">
                <div className="space-y-1">
                   <h3 className="text-xl font-black text-white flex items-center gap-2">
                     <Zap className="size-5 text-amber-300" /> Express Actions
                   </h3>
                   <p className="text-indigo-100 text-xs font-medium">Core flight deck controls</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                   <Link href="/driver/manifest">
                      <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all group">
                         <div className="flex items-center gap-3">
                            <Navigation className="size-4 text-white" />
                            <span className="text-sm font-bold text-white">Full Manifest</span>
                         </div>
                         <Badge tone="certified" className="bg-white/20 text-[10px]">Active</Badge>
                      </button>
                   </Link>
                   <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all">
                      <div className="flex items-center gap-3">
                         <DollarSign className="size-4 text-white" />
                         <span className="text-sm font-bold text-white">Instant Cashout</span>
                      </div>
                      <ChevronRight className="size-4 text-white/50" />
                   </button>
                   <button className="w-full flex items-center p-4 rounded-2xl bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-500/30 transition-all font-black text-white text-sm uppercase tracking-widest">
                      <ShieldAlert className="size-4 mr-3" /> SOS Safety
                   </button>
                </div>
             </div>
          </Card>

          {/* Assistant / Recommendation */}
          <Card>
             <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
               <AlertCircle className="size-4 text-sky-400" /> Operational Insights
             </h3>
             <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10 space-y-2">
                   <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">Recommendation</p>
                   <p className="text-xs text-slate-300 leading-relaxed font-medium">
                     Move 4km East to Clayton South. High volume of NDIS bookings expected in 20 mins.
                   </p>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase px-1">AI Assistant</label>
                   <Input placeholder="Ask assistant..." className="h-10 text-xs" />
                </div>
             </div>
          </Card>

          {/* Manifest Preview */}
          <Card>
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-slate-100 flex items-center gap-2">
                 <CheckCircle2 className="size-4 text-emerald-400" /> Active Schedule
               </h3>
             </div>
             <div className="space-y-3">
               {manifest.length === 0 ? (
                 <p className="text-xs text-slate-500 italic p-4 text-center border border-dashed border-white/5 rounded-2xl">
                   Waiting for new bookings...
                 </p>
               ) : (
                 manifest.map((t) => (
                   <div key={t.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                     <p className="text-[10px] font-bold text-slate-300 truncate max-w-[150px]">{t.pickup} → {t.dropoff}</p>
                     <Badge tone="info" className="text-[9px] px-1.5">{t.state}</Badge>
                   </div>
                 ))
               )}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
