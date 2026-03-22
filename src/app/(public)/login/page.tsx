"use client";

import Link from "next/link";
import { Car, ShieldCheck, User, Users, ChevronRight, Globe, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card, Badge } from "@/components/ui/primitives";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const portals = [
  {
    role: "Rider",
    description: "Book accessibility-focused rides, manage NDIS funding, and track your history.",
    icon: User,
    href: "/rider/login",
    color: "sky",
    gradient: "from-sky-500 to-sky-700"
  },
  {
    role: "Driver",
    description: "Accept manifests, track earnings, manage documents, and go online.",
    icon: Car,
    href: "/driver/login",
    color: "indigo",
    gradient: "from-indigo-500 to-indigo-700"
  },
  {
    role: "Partner",
    description: "Manage facility clients, roster care staff, and handle bulk billing.",
    icon: Users,
    href: "/partner/login",
    color: "emerald",
    gradient: "from-emerald-500 to-emerald-700"
  },
  {
    role: "Admin",
    description: "Global system administration, user management, and dispatch oversight.",
    icon: ShieldCheck,
    href: "/admin/login",
    color: "slate",
    gradient: "from-slate-700 to-slate-900",
    outline: true
  }
];

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 py-12 md:py-20 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-16 text-center space-y-4"
        >
          <Logo href="/" variant="light" className="h-16 w-auto mx-auto mb-6 transition-transform hover:scale-105" />
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Welcome to <span className="gradient-text">Lumi Ride Portal</span>
          </h1>
          <p className="max-w-xl mx-auto text-slate-400 text-sm md:text-base font-medium leading-relaxed italic">
            "Seamless accessibility, professional care, and intelligent logistics for Australia."
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full">
          {portals.map((portal, idx) => (
            <motion.div
              key={portal.role}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="flex"
            >
              <Card className="flex flex-col group h-full relative overflow-hidden border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all">
                <div className={cn("absolute -top-10 -right-10 size-32 opacity-5 rounded-full blur-2xl transition-all group-hover:opacity-20 bg-gradient-to-br", portal.gradient)} />
                
                <div className="relative z-10">
                   <div className={cn("p-4 rounded-2xl w-fit mb-6 bg-slate-950/50 border border-white/5 shadow-xl group-hover:scale-110 transition-transform")}>
                      <portal.icon className={cn("size-8", `text-${portal.color}-400`)} />
                   </div>
                   
                   <h2 className="text-2xl font-black text-white mb-2">{portal.role}</h2>
                   <p className="text-sm font-medium text-slate-400 leading-relaxed mb-8 min-h-[60px]">
                      {portal.description}
                   </p>
                </div>

                <div className="mt-auto relative z-10 w-full">
                  <Link href={portal.href}>
                    <Button 
                      variant={portal.outline ? "outline" : "primary"} 
                      className={cn("w-full group/btn relative overflow-hidden", portal.outline && "border-white/10 hover:border-white/30")}
                    >
                      <span>Enter Portal</span>
                      <ChevronRight className="size-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.6 }}
           className="mt-20 w-full max-w-4xl"
        >
          <Card className="bg-slate-900/20 border-white/5 backdrop-blur-xl p-8">
            <div className="flex items-center gap-2 mb-6 text-sky-400">
               <Info className="size-5" />
               <h3 className="font-black text-sm uppercase tracking-widest">Portal Navigation Guide</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
               <div className="space-y-2">
                 <p className="text-xs font-bold text-slate-100 flex items-center gap-2">
                   <Globe className="size-3 text-sky-400" /> Omni-Login
                 </p>
                 <p className="text-[11px] text-slate-500 leading-relaxed">
                   One email identity across all portals. Register separately for each role you require.
                 </p>
               </div>
               <div className="space-y-2">
                 <p className="text-xs font-bold text-slate-100 flex items-center gap-2">
                   <ShieldCheck className="size-3 text-indigo-400" /> Security First
                 </p>
                 <p className="text-[11px] text-slate-500 leading-relaxed">
                   Portals are strictly role-scoped. Your data stays localized within the relevant context.
                 </p>
               </div>
               <div className="space-y-2">
                 <p className="text-xs font-bold text-slate-100 flex items-center gap-2">
                   <Users className="size-3 text-emerald-400" /> Multi-Role Support
                 </p>
                 <p className="text-[11px] text-slate-500 leading-relaxed">
                   Need to be a partner and a driver? Simply complete the onboarding for both portals.
                 </p>
               </div>
            </div>
          </Card>
        </motion.div>

        <footer className="mt-20 py-8 border-t border-white/5 w-full flex flex-col md:flex-row items-center justify-between gap-6 px-4">
           <div className="flex gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/partners" className="hover:text-white transition-colors">Corporate</Link>
              <Link href="/help" className="hover:text-white transition-colors">Help Center</Link>
           </div>
           <p className="text-[11px] font-medium text-slate-600">
             © 2026 Lumi Rides Australia. All Rights Reserved.
           </p>
        </footer>
      </div>
    </div>
  );
}
