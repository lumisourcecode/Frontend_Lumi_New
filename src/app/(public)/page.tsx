import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  CarTaxiFront,
  CircleCheckBig,
  Clock3,
  HandHeart,
  Hospital,
  Languages,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button, Card } from "@/components/ui/primitives";

const pillars = [
  {
    title: "NDIS Provider",
    description:
      "Registered support for disability service centres, aged care facilities, and government health organizations.",
    icon: Hospital,
  },
  {
    title: "Certified Drivers",
    description:
      "Police checks, Working With Children card, Lumi training program, and continuous quality reviews.",
    icon: ShieldCheck,
  },
  {
    title: "Exceptional Service",
    description:
      "Pre-booked certainty, transparent set pricing, clean vehicles, and reliable on-time operations.",
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
  { label: "Communities Served", value: "80+" },
  { label: "Partner Facilities", value: "30+" },
  { label: "On-time Dispatch Rate", value: "98.2%" },
  { label: "Customer Satisfaction", value: "4.9/5" },
];

export default function LandingPage() {
  return (
    <div className="bg-[var(--color-primary)] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] via-[#221879] to-[#2b1f8d]" />
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=1800&q=80"
            alt="Accessible transport community support"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Lumi Ride</p>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Our mission is to be the most accessible and most sustainable ride service.
            </h1>
            <p className="max-w-2xl text-base text-indigo-100 md:text-lg">
              We deliver exceptional and accessible ride services within your community. Our
              pre-booked model means no waiting, no surge pricing, and a guaranteed ride every time.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/book-my-ride">
                <Button>Book My Ride</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline">Find Out Why</Button>
              </Link>
            </div>
            <div className="grid gap-2 pt-3 text-sm text-indigo-100 md:grid-cols-2">
              {serviceHighlights.map((line) => (
                <p key={line} className="flex items-center gap-2">
                  <CircleCheckBig className="size-4 text-cyan-300" />
                  {line}
                </p>
              ))}
            </div>
          </div>

          <Card className="border-white/20 bg-white/10 text-white backdrop-blur-sm">
            <h2 className="text-2xl font-bold">Plan ahead with confidence</h2>
            <p className="mt-2 text-sm text-indigo-100">
              Built for riders, families, carers, and organizations who need dependable scheduled
              transport and clear communication.
            </p>
            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <p className="font-semibold">Pre-Book Online</p>
                <p className="text-xs text-indigo-100">6am - 11pm | 7 days a week | 24 hours notice required</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <p className="font-semibold">Call to pre-book</p>
                <p className="text-xs text-indigo-100">Prefer a chat? Multilingual options available</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <p className="font-semibold">Duty of Care Promise</p>
                <p className="text-xs text-indigo-100">Accessible, safe, and supportive from pickup to drop-off</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="bg-white py-12 text-slate-900">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-slate-100 bg-slate-50 text-center">
              <p className="text-3xl font-bold text-[var(--color-primary)]">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-600">{stat.label}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-[#f5f2ff] py-14 text-slate-900">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="size-5 text-[var(--color-primary)]" />
            <h2 className="text-3xl font-bold text-[var(--color-primary)]">Ride with Lumi</h2>
          </div>
          <p className="max-w-3xl text-sm text-slate-700">
            Lumi is designed for accessibility and consistency. From healthcare visits to community
            outings, we focus on respectful, reliable support for every ride.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {pillars.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="border-slate-100 bg-white">
                  <Icon className="text-[var(--color-primary)]" />
                  <p className="mt-2 text-base font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{item.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 text-slate-900">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-2">
          <div className="relative min-h-96 overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1469571486292-b53601020b59?auto=format&fit=crop&w=1400&q=80"
              alt="Driver helping passenger safely"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-[var(--color-primary)]">How Lumi Works</h2>
            <div className="space-y-3 text-sm text-slate-700">
              <p className="flex items-start gap-2">
                <Clock3 className="mt-0.5 size-4 text-[var(--color-primary)]" />
                Pre-book online or by phone to lock in your ride window.
              </p>
              <p className="flex items-start gap-2">
                <Users className="mt-0.5 size-4 text-[var(--color-primary)]" />
                Dispatch assigns suitable drivers based on support needs and service area.
              </p>
              <p className="flex items-start gap-2">
                <HandHeart className="mt-0.5 size-4 text-[var(--color-primary)]" />
                Receive clear notifications and ride updates before pickup.
              </p>
              <p className="flex items-start gap-2">
                <CircleCheckBig className="mt-0.5 size-4 text-[var(--color-primary)]" />
                Complete trip with transparent billing and service records.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/book-my-ride">
                <Button>Pre-Book Online</Button>
              </Link>
              <a href="tel:1300586474">
                <Button variant="outline">
                  <PhoneCall className="mr-2 size-4" />
                  1300 586 474
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f2ff] py-14 text-slate-900">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-[var(--color-primary)]">Designed for Every Stakeholder</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card className="bg-white">
              <p className="text-base font-semibold text-[var(--color-primary)]">Participants & Families</p>
              <p className="mt-2 text-xs text-slate-600">
                Accessible booking, predictable service windows, and support-aware trip handling.
              </p>
            </Card>
            <Card className="bg-white">
              <p className="text-base font-semibold text-[var(--color-primary)]">Care Organizations</p>
              <p className="mt-2 text-xs text-slate-600">
                Partner dashboards, bulk bookings, and confidence in compliant transport delivery.
              </p>
            </Card>
            <Card className="bg-white">
              <p className="text-base font-semibold text-[var(--color-primary)]">Drivers</p>
              <p className="mt-2 text-xs text-slate-600">
                Secure, local, consistent work with structured standards and support.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 text-slate-900">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-[var(--color-primary)]">Frequently Asked Questions</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card>
              <p className="font-semibold">When can I pre-book?</p>
              <p className="mt-1 text-xs text-slate-600">
                Online pre-booking is available 6am-11pm, 7 days a week. We recommend 24 hours notice.
              </p>
            </Card>
            <Card>
              <p className="font-semibold">Do you provide multilingual support?</p>
              <p className="mt-1 text-xs text-slate-600">
                Yes, multilingual options are available when booking by phone.
              </p>
            </Card>
            <Card>
              <p className="font-semibold">Are your drivers screened?</p>
              <p className="mt-1 text-xs text-slate-600">
                Yes. Drivers complete police checks and Lumi training with ongoing reviews.
              </p>
            </Card>
            <Card>
              <p className="font-semibold">Can organizations bulk book rides?</p>
              <p className="mt-1 text-xs text-slate-600">
                Yes. Partner facilities can upload manifests and monitor client ride activity.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-primary)] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <Card className="border-white/20 bg-white/10 text-white backdrop-blur-sm">
            <div className="grid gap-6 md:grid-cols-3 md:items-center">
              <div className="md:col-span-2">
                <h3 className="text-3xl font-bold">Ready to ride with confidence?</h3>
                <p className="mt-2 text-sm text-indigo-100">
                  Book now, partner with us, or join our driver community and help deliver essential
                  accessible transport across local neighborhoods.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/book-my-ride">
                  <Button className="w-full">Book My Ride</Button>
                </Link>
                <Link href="/drive-with-us">
                  <Button variant="outline" className="w-full">
                    Drive With Lumi
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="bg-[var(--color-primary)] py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 text-sm">
          <p className="flex items-center gap-2">
            <Languages className="size-4 text-cyan-300" />
            Multilingual booking support available
          </p>
          <p className="flex items-center gap-2">
            <PhoneCall className="size-4 text-cyan-300" />
            Call us: 1300 586 474
          </p>
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4 text-cyan-300" />
            6am - 11pm | 7 days a week
          </p>
        </div>
      </section>
    </div>
  );
}
