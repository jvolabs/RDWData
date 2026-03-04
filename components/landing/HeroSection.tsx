import { SearchBar } from "@/components/search/SearchBar";
import { PlateBadge } from "@/components/ui/PlateBadge";
import { Car, ClipboardList, Search, AlertTriangle, Zap, CheckCircle, ShieldCheck } from "lucide-react";

type Props = { title: string; subtitle: string };

const quickFacts = [
  { label: "Brand, Model & Year", Icon: Car },
  { label: "APK Status & Road Check", Icon: ShieldCheck },
  { label: "Full Inspection Timeline", Icon: ClipboardList },
  { label: "Safety Recall Alerts", Icon: AlertTriangle },
  { label: "Sub-second Results", Icon: Zap },
];

const trust = [
  { Icon: CheckCircle, text: "Verified vehicle data" },
  { Icon: Zap, text: "Results in < 0.4 s" },
  { Icon: Search, text: "No login required" },
];

export function HeroSection({ title, subtitle }: Props) {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Ambient gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 65% -5%, rgba(99,102,241,0.07) 0%, transparent 58%), radial-gradient(ellipse 45% 55% at -5% 75%, rgba(14,165,233,0.04) 0%, transparent 55%)"
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-14 px-6 py-16 lg:grid-cols-[1fr_460px] lg:items-center lg:py-24">

        {/* LEFT copy + search */}
        <div>
          {/* Category pill */}
          <div className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Dutch Vehicle Intelligence
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-100 mt-5 font-display text-5xl font-extrabold leading-[1.06] tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
            Know your car
            <br className="hidden sm:block" />
            <span className="text-gradient">in seconds.</span>
          </h1>

          <p className="animate-fade-in-up delay-200 mt-5 max-w-lg text-lg leading-relaxed text-slate-500">
            {subtitle}
          </p>

          {/* Search bar */}
          <div className="animate-fade-in-up delay-300">
            <SearchBar />
          </div>

          {/* Trust bar */}
          <div className="animate-fade-in-up delay-500 mt-6 flex flex-wrap items-center gap-5 border-t border-slate-100 pt-5">
            {trust.map(({ Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Icon className="h-3.5 w-3.5 text-brand-500" />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT — floating vehicle report preview */}
        <aside className="animate-scale-in delay-200">
          {/* Main preview card */}
          <div className="card-glow overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Card top bar */}
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Sample Report
                </p>
                <p className="mt-0.5 font-display text-base font-bold text-slate-900">
                  Vehicle Intelligence
                </p>
              </div>
              <PlateBadge plate="AB-123-CD" size="md" />
            </div>

            {/* Quick facts list */}
            <ul className="divide-y divide-slate-50 px-1 py-1">
              {quickFacts.map(({ label, Icon }, i) => (
                <li
                  key={label}
                  className="animate-fade-in-up flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors rounded-xl"
                  style={{ animationDelay: `${300 + i * 80}ms` }}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-accent-400" />
                </li>
              ))}
            </ul>

            {/* Status row */}
            <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
              <span className="flex h-1.5 w-1.5 rounded-full bg-accent-500" />
              <span className="text-xs font-medium text-slate-500">All systems live</span>
              <span className="ml-auto text-xs font-semibold text-accent-600">Instant access</span>
            </div>
          </div>

          {/* Sub card — accuracy badge */}
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 ring-2 ring-brand-100">
              <ShieldCheck className="h-4.5 w-4.5 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Always accurate</p>
              <p className="text-xs text-slate-400">Regularly synced with national vehicle records</p>
            </div>
            <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-accent-500" />
          </div>
        </aside>
      </div>
    </section>
  );
}
