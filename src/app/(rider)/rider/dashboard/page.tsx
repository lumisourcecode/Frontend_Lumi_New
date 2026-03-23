"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { 
  Accessibility, 
  CarFront, 
  Dog, 
  LocateFixed, 
  MapPin, 
  Route, 
  Calendar, 
  Clock, 
  Navigation,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  History,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { applyMptpFareRules } from "@/lib/mptp";
import { PlacesAutocomplete } from "@/components/map/places-autocomplete";
import { RoutePreview } from "@/components/map/route-preview";
import { Badge, Button, Card, Input, Progress, Select } from "@/components/ui/primitives";
import { apiJson, getAuthSession } from "@/lib/api-client";
import { cn } from "@/lib/utils";

function RiderDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rebookPickup = searchParams.get("rebook");
  const rebookDropoff = searchParams.get("dropoff");
  
  const [step, setStep] = useState(1);
  const [baseFare, setBaseFare] = useState(75);
  const [recentBookings, setRecentBookings] = useState<Array<{ id: string; pickup: string; dropoff: string; status: string; scheduledAt: string }>>([]);
  const [mptpEligible, setMptpEligible] = useState(true);
  const [pickup, setPickup] = useState(rebookPickup ?? "");
  const [dropoff, setDropoff] = useState(rebookDropoff ?? "");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [mobilityNeeds, setMobilityNeeds] = useState("Wheelchair-accessible");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationMsg, setLocationMsg] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    apiJson<{ items: any[] }>("/rider/bookings", undefined, session.accessToken)
      .then((r) => setRecentBookings(r.items.slice(0, 5)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (rebookPickup) setPickup(rebookPickup);
    if (rebookDropoff) setDropoff(rebookDropoff);
  }, [rebookPickup, rebookDropoff]);

  const pricing = useMemo(
    () => applyMptpFareRules({ baseFare, cardEligible: mptpEligible }),
    [baseFare, mptpEligible],
  );

  async function useMyLocationAsPickup() {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationMsg("Location is not available.");
      return;
    }
    setLocating(true);
    setLocationMsg("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setPickupCoords({ lat, lng });
        setPickup("Current location");
        setLocating(false);
        try {
          if (typeof google !== "undefined" && google?.maps?.Geocoder) {
            new google.maps.Geocoder().geocode({ location: { lat, lng } }, (results, status) => {
              if (status === "OK" && results?.[0]?.formatted_address) {
                setPickup(results[0].formatted_address);
              }
            });
          }
        } catch {}
      },
      (err) => {
        setLocating(false);
        setLocationMsg(err?.message || "Location access denied.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  function applyRecentBooking(b: { pickup: string; dropoff: string }) {
    setPickup(b.pickup);
    setDropoff(b.dropoff);
    setPickupCoords(null);
    setDropoffCoords(null);
    setStep(1);
  }

  async function createBooking() {
    const session = getAuthSession();
    if (!session?.accessToken) {
      setMsg("Please login first.");
      return;
    }
    if (!pickup || !dropoff || !scheduledAt) {
      setMsg("Please fill in all details.");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const dt = new Date(scheduledAt);
      const res = await apiJson<{ booking: { id: string } }>(
        "/rider/bookings",
        {
          method: "POST",
          body: JSON.stringify({
            pickup,
            dropoff,
            pickupLat: pickupCoords?.lat,
            pickupLng: pickupCoords?.lng,
            dropoffLat: dropoffCoords?.lat,
            dropoffLng: dropoffCoords?.lng,
            scheduledAt: dt.toISOString(),
            mobilityNeeds,
          }),
        },
        session.accessToken,
      );
      setMsg(`Booking confirmed! ID: ${res.booking.id}`);
      setStep(1);
      setPickup("");
      setDropoff("");
      setScheduledAt("");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to create booking.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header / Stats Overlay */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <Route className="size-12" />
           </div>
           <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-1">Active Status</p>
           <h3 className="text-2xl font-bold">Ready to Ride</h3>
           <p className="text-xs text-slate-400 mt-2">Book a ride in seconds across Australia.</p>
        </Card>

        <Card className="relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <History className="size-12" />
           </div>
           <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Your Activity</p>
           <h3 className="text-2xl font-bold">{recentBookings.length} Trips</h3>
           <Progress className="mt-4" value={recentBookings.length * 20} />
        </Card>

        <Card className="relative overflow-hidden lg:col-span-2 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border-sky-500/20">
           <div className="flex items-center justify-between">
             <div className="space-y-1">
               <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Subsidy Program</p>
               <h3 className="text-xl font-bold">NDIS / Aged Care Support</h3>
               <p className="text-xs text-slate-300">Automated MPTP and support fund tracking active.</p>
             </div>
             <div className="hidden sm:block h-12 w-12 rounded-2xl bg-sky-500/20 flex items-center justify-center">
               <Accessibility className="size-6 text-sky-400" />
             </div>
           </div>
        </Card>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Booking Wizard */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7"
        >
          <Card className="p-0 overflow-hidden">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
              <div>
                <h2 className="text-xl font-bold gradient-text">New Booking</h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="flex gap-1">
                     {[1,2,3].map(i => (
                       <div key={i} className={cn("h-1 w-4 rounded-full transition-all", step === i ? "bg-sky-500 w-8" : "bg-slate-700")} />
                     ))}
                   </div>
                   <span className="text-[10px] font-bold text-slate-500 uppercase">Step {step}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={useMyLocationAsPickup} disabled={locating}>
                  <LocateFixed className={cn("size-3 mr-2", locating && "animate-spin")} />
                  {locating ? "Locating..." : "My Location"}
                </Button>
              </div>
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                          <MapPin className="size-3 text-sky-400" /> Pickup Location
                        </label>
                        <PlacesAutocomplete
                          value={pickup}
                          onChange={(v, place) => {
                            setPickup(v);
                            setPickupCoords(place?.lat != null ? { lat: place.lat, lng: place.lng! } : null);
                          }}
                          placeholder="Where are you?"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                          <Navigation className="size-3 text-indigo-400" /> Destination
                        </label>
                        <PlacesAutocomplete
                          value={dropoff}
                          onChange={(v, place) => {
                            setDropoff(v);
                            setDropoffCoords(place?.lat != null ? { lat: place.lat, lng: place.lng! } : null);
                          }}
                          placeholder="Where to?"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <Calendar className="size-3 text-emerald-400" /> Scheduled Time
                      </label>
                      <Input 
                        type="datetime-local" 
                        value={scheduledAt} 
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="font-medium"
                      />
                    </div>
                    
                    <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-1 overflow-hidden h-[300px]">
                      <RoutePreview origin={pickupCoords} destination={dropoffCoords} />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Specific Needs</label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: "Wheelchair-accessible", label: "Wheelchair", icon: Accessibility, color: "sky" },
                          { id: "Service Animal", label: "Service Animal", icon: Dog, color: "indigo" },
                          { id: "Door-to-Door Assistance", label: "Assistance", icon: CheckCircle2, color: "emerald" },
                          { id: "Standard", label: "Standard", icon: CarFront, color: "slate" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setMobilityNeeds(item.id)}
                            className={cn(
                              "flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-300",
                              mobilityNeeds === item.id 
                                ? "bg-sky-500/10 border-sky-500/50 ring-2 ring-sky-500/20" 
                                : "bg-slate-900/50 border-white/5 hover:border-white/10"
                            )}
                          >
                            <item.icon className={cn("size-6", mobilityNeeds === item.id ? "text-sky-400" : "text-slate-500")} />
                            <span className={cn("text-xs font-bold uppercase tracking-wider", mobilityNeeds === item.id ? "text-sky-400" : "text-slate-400")}>
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="p-6 rounded-3xl bg-slate-950 border border-white/5 space-y-4">
                       <div className="flex items-center justify-between pb-4 border-b border-white/5">
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">Estimated Fare</p>
                            <h4 className="text-2xl font-bold text-white">${baseFare}</h4>
                          </div>
                          <Badge tone="info">NDIS Ready</Badge>
                       </div>
                       
                       <div className="space-y-3">
                         <div className="flex items-center justify-between text-sm">
                           <span className="text-slate-400">Government Subsidy</span>
                           <span className="text-emerald-400 font-bold">-${pricing.subsidy}</span>
                         </div>
                         <div className="flex items-center justify-between text-base">
                           <span className="text-slate-100 font-medium">Your Payment</span>
                           <span className="text-sky-400 font-black text-xl">${pricing.riderPayable}</span>
                         </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10">
                       <Info className="size-4 text-sky-400 shrink-0" />
                       <p className="text-xs text-slate-400 leading-relaxed">
                         Final fare may vary based on tolls and actual travel time as per NDIS Pricing Arrangements (2025-26).
                       </p>
                    </div>

                    <label className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={mptpEligible}
                        onChange={(e) => setMptpEligible(e.target.checked)}
                        className="size-5 rounded-lg border-white/10 bg-slate-900 text-sky-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-100">Apply Multi-Purpose Taxi Program (MPTP)</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Eligibility required</p>
                      </div>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 pt-8 border-t border-white/5 flex grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(s => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="w-full"
                >
                  Previous
                </Button>
                {step < 3 ? (
                  <Button onClick={() => setStep(s => s + 1)} className="w-full">
                    Continue <ChevronRight className="size-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={createBooking} disabled={loading} className="w-full">
                    {loading ? "Confirming..." : "Book Now"}
                  </Button>
                )}
              </div>
              
              {msg && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center font-semibold"
                >
                  {msg}
                </motion.p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Sidebar Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Activity */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                  <Clock className="size-4 text-sky-400" /> Recent Trips
                </h3>
                <Link href="/rider/history" className="text-[10px] font-bold text-slate-500 uppercase hover:text-sky-400 transition-colors">
                  Full History
                </Link>
              </div>

              <div className="space-y-3">
                {recentBookings.length === 0 ? (
                  <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-sm text-slate-500">No trip history found.</p>
                  </div>
                ) : (
                  recentBookings.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => applyRecentBooking(b)}
                      className="group w-full p-4 rounded-2xl bg-slate-900/40 border border-white/5 text-left transition-all hover:bg-white/5 hover:border-white/10"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-1">
                          <p className="text-xs font-bold text-slate-100 truncate group-hover:text-sky-400 transition-colors">{b.pickup}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                            <ChevronRight className="size-3" /> {b.dropoff}
                          </div>
                        </div>
                        <Badge tone={b.status === "cancelled" ? "danger" : b.status.toLowerCase().includes("completed") ? "certified" : "info"}>
                          {b.status}
                        </Badge>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3 }}
          >
            <Card>
              <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                <TrendingUp className="size-4 text-indigo-400" /> Quick Rebook
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: "Monash Medical Centre", id: "monash" },
                  { label: "Royal Melbourne Hospital", id: "rmh" },
                  { label: "Dialysis Clinic", id: "dialysis" },
                ].map((site) => (
                  <Button 
                    key={site.id}
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setDropoff(site.label); setStep(1); }}
                    className="justify-start group"
                  >
                    <MapPin className="mr-3 size-4 text-slate-500 group-hover:text-indigo-400" />
                    <span className="truncate">{site.label}</span>
                  </Button>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function RiderDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
      </div>
    }>
      <RiderDashboardContent />
    </Suspense>
  );
}
