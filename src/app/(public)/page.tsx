"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Accessibility, 
  CalendarDays, 
  CarTaxiFront, 
  CircleCheckBig, 
  Clock3, 
  HandHeart, 
  Heart, 
  Hospital, 
  Languages, 
  Leaf, 
  PhoneCall, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Users,
  ArrowRight,
  Globe,
  MapPin,
  ChevronRight,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card, Badge, Input } from "@/components/ui/primitives";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const pillars = [
  {
    title: "NDIS Registered Provider",
    description: "Specialized transport for disability centres, aged care, and government health orgs. Proactive, educated, and dignity-focused care.",
    icon: Hospital,
    color: "sky"
  },
  {
    title: "Certified Duty of Care",
    description: "Drivers hold Police Checks, WWCC, and complete the elite Lumi Training Program with regular performance reviews.",
    icon: ShieldCheck,
    color: "indigo"
  },
  {
    title: "Premium Fleet Standards",
    description: "Modern, sustainable Lumi-branded vehicles with transparent pricing. No surge, no surprises, always on time.",
    icon: CarTaxiFront,
    color: "emerald"
  },
];

const stats = [
  { label: "Communities Served", value: "80+", icon: Users },
  { label: "Partner Facilities", value: "30+", icon: Hospital },
  { label: "On-time Dispatch", value: "98.2%", icon: Clock3 },
  { label: "Client Satisfaction", value: "4.9/5", icon: Star },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500/30">
      {/* Navigation Layer */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/20 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          <Logo href="/" variant="light" className="h-10 w-auto" />
          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
             <Link href="/about" className="hover:text-white transition-colors">Mission</Link>
             <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
             <Link href="/partners" className="hover:text-white transition-colors">Partners</Link>
             <Link href="/drive-with-us" className="hover:text-white transition-colors">Careers</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white">Sign In</Link>
            <Link href="/book-my-ride">
              <Button size="sm" className="hidden sm:inline-flex">Book Ride</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1920&q=80"
            alt="Premium Transport"
            fill
            className="object-cover opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sky-500/10 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 flex flex-col lg:flex-row items-center gap-16 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 space-y-10"
          >
            <Badge tone="info" className="bg-sky-500/10 border-sky-500/20 py-2 px-4 text-xs">
              <Zap className="size-3 mr-2 text-sky-400 fill-sky-400" /> NDIS Registered Provider
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-black leading-[1.05] tracking-tight">
              Accessible <br />
              <span className="gradient-text">Transport</span> <br />
              Reimagined.
            </h1>
            <p className="max-w-2xl text-lg md:text-xl text-slate-400 font-medium leading-relaxed">
              Serving the Australian disability and aged care sector with guaranteed ride windows, certified support-trained drivers, and zero surge pricing.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link href="/book-my-ride">
                <Button size="lg" className="h-16 px-10 text-lg shadow-2xl shadow-sky-500/20">
                  Book Your Journey <ArrowRight className="size-5 ml-2" />
                </Button>
              </Link>
              <Link href="/partners">
                <Button variant="outline" size="lg" className="h-16 px-10 text-lg border-white/10 hover:bg-white/5">
                  Partner with Us
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
               {stats.map(s => (
                 <div key={s.label}>
                    <p className="text-3xl font-black text-white">{s.value}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Featured Glass Widget */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-[460px]"
          >
            <Card className="p-8 backdrop-blur-3xl bg-slate-900/40 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
               <div className="flex items-center gap-4 mb-8">
                  <div className="size-12 rounded-2xl bg-sky-500/20 flex items-center justify-center">
                    <CalendarDays className="size-6 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Scheduled Care</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Priority Booking</p>
                  </div>
               </div>
               
               <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 size-2 rounded-full bg-sky-500" />
                    <Input placeholder="Pickup location..." className="pl-10 h-14 bg-slate-950/50" readOnly />
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 size-2 rounded-full bg-indigo-500" />
                    <Input placeholder="Destination..." className="pl-10 h-14 bg-slate-950/50" readOnly />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Ride Type</p>
                        <p className="text-sm font-bold text-white">Wheelchair Accessible</p>
                     </div>
                     <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Pricing</p>
                        <p className="text-sm font-bold text-white">Flat Daily Rate</p>
                     </div>
                  </div>

                  <Link href="/book-my-ride" className="block">
                    <Button variant="primary" className="w-full h-14">Get Instant Quote</Button>
                  </Link>
                  <p className="text-[10px] text-center text-slate-500 font-medium">
                    Trusted by 30+ Facilities in Victoria & NSW
                  </p>
               </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-y border-white/5 bg-slate-950/50">
        <div className="mx-auto max-w-7xl px-6 flex flex-wrap items-center justify-center gap-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
           {["Police Checked", "WWCC Certified", "NDIS Compliant", "Public Liability $20M", "Sustainability First"].map(t => (
             <span key={t} className="text-xs font-black uppercase tracking-[0.3em]">{t}</span>
           ))}
        </div>
      </section>

      {/* Service Pillars */}
      <section className="py-32 relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white">Reliability Built on <span className="gradient-text">Trust</span>.</h2>
            <p className="text-lg text-slate-400 font-medium">
              We specialize in complex transport needs that regular ride-shares cannot fulfill.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {pillars.map((p, idx) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full p-10 group bg-slate-900/20 hover:bg-slate-900/40 border-white/5 transition-all">
                  <div className={cn("size-16 rounded-3xl mb-8 flex items-center justify-center transition-transform group-hover:scale-110", `bg-${p.color}-500/10`)}>
                    <p.icon className={cn("size-8", `text-${p.color}-400`)} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 leading-tight">{p.title}</h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">{p.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Break - Immersive Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1469571486292-b53601020b59?auto=format&fit=crop&w=1400&q=80"
            alt="Human Care"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 grid md:grid-cols-2 items-center gap-16">
           <div className="space-y-8">
              <Badge tone="certified" className="h-10 px-5 text-[10px]">Community Legacy</Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                More than just a ride. <br />
                <span className="text-sky-400">A companion on the road.</span>
              </h2>
              <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-lg">
                Our drivers are trained not just to drive, but to assist. Whether it's helping with mobility aids, coordinating with care facility staff, or providing door-to-door assistance, we ensure every journey is safe and dignified.
              </p>
              <div className="flex gap-4">
                 <Button>View Accessibility Standards</Button>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Assisted Boarding", icon: Accessibility },
                { label: "Hospital Liaison", icon: Hospital },
                { label: "Family Live-Tracks", icon: Globe },
                { label: "NDIS Claiming", icon: FileText },
              ].map((item, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/5 space-y-4 hover:border-sky-500/30 transition-colors">
                   <item.icon className="size-6 text-sky-400" />
                   <p className="text-sm font-black text-white uppercase tracking-tight">{item.label}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Corporate / Partner CTA */}
      <section className="py-32">
        <div className="mx-auto max-w-7xl px-6">
           <Card className="relative overflow-hidden border-none bg-gradient-to-br from-indigo-600 to-indigo-950 p-12 md:p-20 shadow-2xl">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-sky-400/10 blur-[100px] rounded-full translate-x-1/2" />
              <div className="relative z-10 grid lg:grid-cols-2 items-center gap-16">
                 <div className="space-y-6">
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Scale your Care <br />Operations.</h2>
                    <p className="text-indigo-100 text-lg md:text-xl font-medium leading-relaxed opacity-90">
                      Join 30+ aged care and disability facilities using Lumi to automate transport manifest, track client movements, and simplify NDIS billing.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                       <Button className="bg-white text-indigo-900 hover:bg-indigo-50 h-14 px-8 text-base">Request Partner Demo</Button>
                       <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-14 px-8 text-base">Corporate Login</Button>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    {[
                      "Customized Partner CRM Access",
                      "Automated Xero Invoicing & Sync",
                      "Real-time Facility Monitoring",
                      "Simplified NDIS Travel Claims"
                    ].map(t => (
                      <div key={t} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm">
                         <div className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                         {t}
                      </div>
                    ))}
                 </div>
              </div>
           </Card>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="py-20 border-t border-white/5 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <Logo href="/" variant="light" className="h-10 w-auto" />
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed font-medium">
              Revolutionizing accessibility through intelligent logistics and compassionate care. NDIS Registered Provider #4050000000.
            </p>
            <div className="flex gap-4">
               {/* Social Icons Placeholder */}
               {[1,2,3,4].map(i => <div key={i} className="size-10 rounded-xl bg-slate-900 border border-white/5" />)}
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Services</h4>
            <ul className="space-y-4 text-xs font-bold text-slate-500 uppercase tracking-tight">
              <li><Link href="/book-my-ride" className="hover:text-sky-400 transition-colors">Individual Booking</Link></li>
              <li><Link href="/partners" className="hover:text-sky-400 transition-colors">Partner CRM</Link></li>
              <li><Link href="/accessibility" className="hover:text-sky-400 transition-colors">Accessibility</Link></li>
              <li><Link href="/drive-with-us" className="hover:text-sky-400 transition-colors">Career Pathways</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Company</h4>
            <ul className="space-y-4 text-xs font-bold text-slate-500 uppercase tracking-tight">
              <li><Link href="/about" className="hover:text-sky-400 transition-colors">About Us</Link></li>
              <li><Link href="/news" className="hover:text-sky-400 transition-colors">Impact Reports</Link></li>
              <li><Link href="/help" className="hover:text-sky-400 transition-colors">Support Center</Link></li>
              <li><Link href="/privacy" className="hover:text-sky-400 transition-colors">Legal & Privacy</Link></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Support</h4>
            <div className="space-y-4">
               <a href="tel:1300586474" className="block p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">24/7 Priority Line</p>
                  <p className="text-sm font-black text-white">1300 586 474</p>
               </a>
            </div>
          </div>
        </div>
        
        <div className="mx-auto max-w-7xl px-6 pt-20 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5 mt-20">
           <p className="text-[10px] font-medium text-slate-600 uppercase tracking-[0.2em]">
             © 2026 Lumi Rides Australia. Built for the community.
           </p>
           <div className="flex gap-8 text-[10px] font-black text-slate-600 uppercase tracking-wider">
              <span>ABN 12 345 678 901</span>
              <span>Melbourne, VIC</span>
           </div>
        </div>
      </footer>
    </div>
  );
}

const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
