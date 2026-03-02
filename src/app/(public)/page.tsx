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
} from "lucide-react";
import { Button, Card } from "@/components/ui/primitives";
import { Logo } from "@/components/ui/logo";

const pillars = [
  {
    title: "NDIS Provider",
    description:
      "As a registered NDIS provider for disability service centres, aged care facilities and government health organisations, our team is educated and proactive in providing accessible services.",
    icon: Hospital,
  },
  {
    title: "Certified Drivers",
    description:
      "Our drivers are extensively screened including Police Checks, hold Working With Children cards and complete the Lumi Training Program with continued learning and regular reviews.",
    icon: ShieldCheck,
  },
  {
    title: "Exceptional Service",
    description:
      "Enjoy consistent service with transparent, set pricing in clean, safe and sustainable Lumi-branded vehicles that are on time, every time.",
    icon: CarTaxiFront,
  },
];

const serviceHighlights = [
  "No waiting and no surge pricing",
  "Guaranteed pre-booked ride windows",
  "Multilingual support options",
  "Companion, mobility, and assistance-ready transport",
  "Duty-of-care-first operating standards",
  "Community-focused local drivers",
];

const stats = [
  { label: "Communities Served", value: "80+", icon: Users },
  { label: "Partner Facilities", value: "30+", icon: Hospital },
  { label: "On-time Dispatch Rate", value: "98.2%", icon: Clock3 },
  { label: "Customer Satisfaction", value: "4.9/5", icon: Star },
];

const testimonials = [
  {
    quote: "Lumi has transformed how we coordinate transport for our clients. Reliable, professional, and always on time.",
    author: "Sarah M.",
    role: "Care Coordinator",
  },
  {
    quote: "As an NDIS participant, having a guaranteed ride with no surprises gives me peace of mind. Lumi delivers.",
    author: "James T.",
    role: "NDIS Participant",
  },
  {
    quote: "Driving for Lumi means meaningful work in my community. The training and support are excellent.",
    author: "Maria L.",
    role: "Lumi Driver",
  },
];

const trustBadges = [
  "NDIS Registered",
  "Police Checked Drivers",
  "WWCC Certified",
  "Duty of Care Compliant",
];

const steps = [
  { title: "Pre-book", desc: "Online or by phone to lock in your ride window", icon: Clock3 },
  { title: "We assign", desc: "Suitable drivers based on support needs", icon: Users },
  { title: "You're notified", desc: "Clear updates before pickup", icon: HandHeart },
  { title: "Ride complete", desc: "Transparent billing and records", icon: CircleCheckBig },
];

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden bg-slate-50 text-slate-900">
      {/* Hero - Full bleed */}
      <section className="relative min-h-[90vh] overflow-hidden">
        <div className="absolute inset-0 bg-[var(--lumi-gradient)]" />
        <Image
          src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1920&q=80"
          alt="Accessible transport"
          fill
          className="object-cover opacity-25"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent" />

        <div className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col justify-center gap-12 px-4 py-24 lg:flex-row lg:items-center lg:gap-20">
          <div className="flex-1 space-y-8">
            <div className="animate-fade-in opacity-0">
              <Logo href="/" variant="light" className="h-16 w-auto opacity-95" />
            </div>
            <h1 className="animate-fade-in-up text-4xl font-bold leading-[1.1] tracking-tight text-white opacity-0 md:text-5xl lg:text-6xl xl:text-7xl">
              Our mission is to be the most accessible and most sustainable ride service.
            </h1>
            <p className="animate-fade-in-up max-w-2xl text-lg text-slate-300 opacity-0 animate-delay-1">
              We deliver exceptional and accessible ride services within your community. Our pre-booked
              service means no waiting, no surge pricing and a guaranteed ride every time.
            </p>
            <div className="flex flex-wrap gap-4 opacity-0 animate-fade-in-up animate-delay-2">
              <Link href="/book-my-ride">
                <Button className="h-14 rounded-2xl px-10 text-base font-semibold shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl">
                  Book My Ride
                </Button>
              </Link>
              <Link href="/accessibility">
                <Button variant="outline" className="h-14 rounded-2xl border-white/40 bg-white/5 px-10 text-base font-semibold text-white hover:bg-white/15">
                  Find Out Why
                </Button>
              </Link>
            </div>
            <div className="grid gap-3 pt-4 text-sm text-slate-300 opacity-0 animate-fade-in-up animate-delay-3 sm:grid-cols-2">
              {serviceHighlights.map((line) => (
                <p key={line} className="flex items-center gap-2">
                  <CircleCheckBig className="size-5 shrink-0 text-cyan-400" />
                  {line}
                </p>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 lg:w-[440px]">
            <div className="glass-card animate-fade-in-up rounded-3xl p-6 opacity-0 animate-delay-1 lg:p-8">
              <h2 className="text-2xl font-bold text-white">Plan ahead with confidence</h2>
              <p className="mt-3 text-sm text-slate-200">
                Built for riders, families, carers, and organisations who need dependable scheduled
                transport and clear communication.
              </p>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/20 bg-white/5 p-4 transition-colors hover:bg-white/10">
                  <p className="font-semibold text-white">Pre-Book Online</p>
                  <p className="mt-1 text-xs text-slate-300">6am - 11pm | 7 days a week | 24 hours notice required</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/5 p-4 transition-colors hover:bg-white/10">
                  <p className="font-semibold text-white">Call to pre-book</p>
                  <p className="mt-1 text-xs text-slate-300">Prefer a chat? Multilingual options available</p>
                  <a href="tel:1300586474" className="mt-2 inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
                    <PhoneCall className="size-4" />
                    1300 586 474
                  </a>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/5 p-4 transition-colors hover:bg-white/10">
                  <p className="font-semibold text-white">Duty of Care Promise</p>
                  <p className="mt-1 text-xs text-slate-300">Accessible, safe, and supportive from pickup to drop-off</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-slate-200 bg-white py-12">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-4">
          {trustBadges.map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="size-5 text-emerald-500" />
              <span className="font-medium">{badge}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="group text-center">
                <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-indigo-50 transition-colors group-hover:bg-indigo-100">
                  <Icon className="size-7 text-indigo-600" />
                </div>
                <p className="text-3xl font-bold text-[var(--color-primary)] md:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-600">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ride with Lumi */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-100">
              <Sparkles className="size-6 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-primary)] md:text-4xl">
              Ride with Lumi
            </h2>
          </div>
          <p className="max-w-3xl text-lg text-slate-600">
            Lumi delivers an exceptional and accessible ride service with a focus on duty of care for peace of mind.
            From healthcare visits to community outings, we focus on respectful, reliable support for every ride.
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {pillars.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="group hover-lift border-slate-100 bg-white p-8 shadow-sm">
                  <div className="rounded-2xl bg-indigo-50 p-4 w-fit transition-colors group-hover:bg-indigo-100">
                    <Icon className="size-10 text-indigo-600" />
                  </div>
                  <p className="mt-5 text-xl font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works - Image + Steps */}
      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-7xl gap-16 px-4 lg:grid-cols-2">
          <div className="relative min-h-[400px] overflow-hidden rounded-3xl shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1469571486292-b53601020b59?auto=format&fit=crop&w=1400&q=80"
              alt="Driver helping passenger"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="img-overlay absolute inset-0" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <p className="text-lg font-semibold">Professional, caring drivers</p>
              <p className="text-sm text-slate-200">Trained for accessibility and support</p>
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-8">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-primary)] md:text-4xl">
              How Lumi Works
            </h2>
            <div className="space-y-6">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                      <Icon className="size-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{step.title}</p>
                      <p className="mt-1 text-slate-600">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/book-my-ride">
                <Button className="rounded-xl">Pre-Book Online</Button>
              </Link>
              <a href="tel:1300586474">
                <Button variant="outline" className="rounded-xl">
                  <PhoneCall className="mr-2 size-4" />
                  1300 586 474
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility highlight */}
      <section className="relative overflow-hidden bg-[var(--lumi-gradient)] py-24 text-white">
        <Image
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1920&q=80"
          alt="Healthcare access"
          fill
          className="object-cover opacity-20"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-slate-900/70" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white/10">
                <Accessibility className="size-8 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Built for accessibility
              </h2>
              <p className="text-lg text-slate-200">
                Wheelchair-accessible vehicles, trained drivers, and support for NDIS participants,
                seniors, and anyone who needs a little extra care. We make every ride comfortable and dignified.
              </p>
              <Link href="/accessibility">
                <Button variant="outline" className="rounded-xl border-white/40 bg-white/10 text-white hover:bg-white/20">
                  Learn about accessibility
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["Wheelchair accessible", "NDIS compliant", "Companion support", "Mobility aids"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <CircleCheckBig className="size-6 text-cyan-400" />
                  <p className="mt-2 font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Drive with Lumi */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 py-24 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Drive with Lumi</h2>
              <p className="text-lg text-indigo-100">
                Lumi drivers enjoy secure, consistent work within their local community. Enjoy full employee
                benefits while staying close to home. Provide safe and accessible transport to the members of
                your community that need it the most.
              </p>
              <Link href="/drive-with-us">
                <Button className="rounded-xl bg-white text-indigo-600 hover:bg-slate-100">
                  Find Out More
                </Button>
              </Link>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm">
              <h3 className="text-xl font-semibold">Why drive with Lumi</h3>
              <ul className="mt-6 space-y-4">
                {["Secure, local, consistent work", "Full employee benefits", "Lumi Training Program", "Community impact", "Structured support"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CircleCheckBig className="size-5 text-cyan-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability */}
      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-7xl gap-16 px-4 lg:grid-cols-2 lg:items-center">
          <div className="relative min-h-[350px] overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1400&q=80"
              alt="Sustainable transport"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="space-y-6">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100">
              <Leaf className="size-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-primary)] md:text-4xl">
              Sustainable & responsible
            </h2>
            <p className="text-lg text-slate-600">
              We're committed to reducing our environmental footprint. Our fleet includes
              fuel-efficient and sustainable vehicles, and we're always exploring ways to
              serve our community more responsibly.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 flex items-center gap-3">
            <Heart className="size-8 text-rose-500" />
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-primary)] md:text-4xl">
              What our community says
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.author} className="hover-lift border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-slate-600">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 font-semibold text-slate-900">{t.author}</p>
                <p className="text-sm text-slate-500">{t.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stakeholders */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-primary)] md:text-4xl">
            Designed for Every Stakeholder
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card className="hover-lift border-slate-100 bg-white p-8">
              <Users className="size-10 text-indigo-600" />
              <p className="mt-4 text-lg font-semibold text-[var(--color-primary)]">Participants & Families</p>
              <p className="mt-2 text-slate-600">
                Accessible booking, predictable service windows, and support-aware trip handling.
              </p>
            </Card>
            <Card className="hover-lift border-slate-100 bg-white p-8">
              <Hospital className="size-10 text-indigo-600" />
              <p className="mt-4 text-lg font-semibold text-[var(--color-primary)]">Care Organisations</p>
              <p className="mt-2 text-slate-600">
                Partner dashboards, bulk bookings, and confidence in compliant transport delivery.
              </p>
            </Card>
            <Card className="hover-lift border-slate-100 bg-white p-8">
              <CarTaxiFront className="size-10 text-indigo-600" />
              <p className="mt-4 text-lg font-semibold text-[var(--color-primary)]">Drivers</p>
              <p className="mt-2 text-slate-600">
                Secure, local, consistent work with structured standards and support.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-primary)] md:text-4xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card className="border-slate-100 bg-white p-6">
              <p className="font-semibold text-slate-900">When can I pre-book?</p>
              <p className="mt-2 text-slate-600">
                Online pre-booking is available 6am-11pm, 7 days a week. We recommend 24 hours notice.
              </p>
            </Card>
            <Card className="border-slate-100 bg-white p-6">
              <p className="font-semibold text-slate-900">Do you provide multilingual support?</p>
              <p className="mt-2 text-slate-600">
                Yes, multilingual options are available when booking by phone.
              </p>
            </Card>
            <Card className="border-slate-100 bg-white p-6">
              <p className="font-semibold text-slate-900">Are your drivers screened?</p>
              <p className="mt-2 text-slate-600">
                Yes. Drivers complete police checks and Lumi training with ongoing reviews.
              </p>
            </Card>
            <Card className="border-slate-100 bg-white p-6">
              <p className="font-semibold text-slate-900">Can organisations bulk book rides?</p>
              <p className="mt-2 text-slate-600">
                Yes. Partner facilities can upload manifests and monitor client ride activity.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[var(--lumi-gradient)] py-24">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=1920&q=80"
            alt=""
            fill
            className="object-cover opacity-15"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-slate-900/80" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h3 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Ready to ride with confidence?
          </h3>
          <p className="mt-6 text-lg text-slate-200">
            Book now, partner with us, or join our driver community and help deliver essential
            accessible transport across local neighbourhoods.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/book-my-ride">
              <Button className="h-14 rounded-2xl px-10 text-base font-semibold shadow-lg">
                Book My Ride
              </Button>
            </Link>
            <Link href="/drive-with-us">
              <Button variant="outline" className="h-14 rounded-2xl border-white/40 bg-white/5 px-10 text-base font-semibold text-white hover:bg-white/15">
                Drive With Lumi
              </Button>
            </Link>
            <Link href="/partners">
              <Button variant="outline" className="h-14 rounded-2xl border-white/40 bg-white/5 px-10 text-base font-semibold text-white hover:bg-white/15">
                Partner With Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact bar */}
      <section className="border-t border-slate-200 bg-slate-100 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-4 text-sm text-slate-600 md:justify-between">
          <p className="flex items-center gap-2">
            <Languages className="size-5 text-indigo-600" />
            Multilingual booking support available
          </p>
          <a href="tel:1300586474" className="flex items-center gap-2 font-semibold text-indigo-600 hover:underline">
            <PhoneCall className="size-5" />
            Call us: 1300 586 474
          </a>
          <p className="flex items-center gap-2">
            <CalendarDays className="size-5 text-indigo-600" />
            6am - 11pm | 7 days a week
          </p>
        </div>
      </section>
    </div>
  );
}
