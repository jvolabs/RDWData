import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const tiers = [
  {
    id: "free",
    name: "Free",
    price: "€0",
    period: "forever",
    desc: "Everything you need for quick plate checks. No card, no signup.",
    dark: false,
    cta: "bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100",
    ctaLabel: "Start for free",
    badge: null,
    features: [
      "Unlimited plate lookups",
      "Full vehicle profile",
      "Road-legal status & expiry",
      "Safety alert overview",
      "Smart result caching"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: "€9",
    period: "/ month",
    desc: "Deeper insights for serious buyers, fleet managers, and enthusiasts.",
    dark: true,
    cta: "bg-white text-brand-700 hover:bg-brand-50",
    ctaLabel: "Get Premium",
    badge: "Most Popular",
    features: [
      "Everything in Free",
      "Full ownership timeline",
      "Estimated market value",
      "AI-generated vehicle summary",
      "PDF report export"
    ]
  },
  {
    id: "b2b",
    name: "API Access",
    price: "Custom",
    period: "volume pricing",
    desc: "Integrate PlateIntel directly into your platform or workflow.",
    dark: false,
    cta: "bg-slate-900 text-white hover:bg-slate-700",
    ctaLabel: "Talk to us",
    badge: null,
    features: [
      "API key & token auth",
      "Custom rate limits",
      "Batch lookup endpoint",
      "Priority SLA",
      "Usage analytics"
    ]
  }
];

export default function PricingPage() {
  return (
    <div>
      {/* Hero */}
      <div className="border-b border-slate-100 bg-white py-14 text-center">
        <span className="section-label">Pricing</span>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
          Simple, honest pricing
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-500">
          Start free. Upgrade when you need more.
        </p>
      </div>

      {/* Tiers */}
      <div className="bg-slate-50 py-14">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-5 md:grid-cols-3">
            {tiers.map((tier) => (
              <article
                key={tier.id}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${tier.dark ? "border-brand-700 bg-brand-600" : "border-slate-200 bg-white"}`}
              >
                {/* Top accent bar */}
                {!tier.dark && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-300 to-brand-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-t-2xl" />
                )}
                {tier.dark && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-300 via-violet-400 to-sky-400 rounded-t-2xl" />
                )}

                {tier.badge && (
                  <span className="absolute right-5 top-5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
                    {tier.badge}
                  </span>
                )}

                <h3 className={`font-display text-lg font-bold ${tier.dark ? "text-white" : "text-slate-900"}`}>{tier.name}</h3>
                <p className={`mt-1 text-sm leading-relaxed ${tier.dark ? "text-brand-200" : "text-slate-500"}`}>{tier.desc}</p>

                <div className="mt-5 flex items-end gap-1">
                  <span className={`font-display text-4xl font-extrabold ${tier.dark ? "text-white" : "text-slate-900"}`}>{tier.price}</span>
                  <span className={`mb-1 text-sm ${tier.dark ? "text-brand-200" : "text-slate-400"}`}>{tier.period}</span>
                </div>

                <hr className={`my-5 h-px border-0 ${tier.dark ? "bg-white/10" : "bg-slate-100"}`} />

                <ul className="flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${tier.dark ? "text-brand-200" : "text-accent-500"}`} strokeWidth={2.5} />
                      <span className={tier.dark ? "text-brand-100" : "text-slate-600"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button id={tier.id} type="button" className={`group/btn mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition-all border-0 ${tier.cta}`}>
                  {tier.ctaLabel}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover/btn:translate-x-0.5" />
                </button>
              </article>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            All plans include full vehicle profiles and safety alert checks.
          </p>
        </div>
      </div>

      <div className="flex justify-center border-t border-slate-100 bg-white py-6">
        <Link href="/" className="text-sm text-slate-400 transition hover:text-slate-700">← Back to search</Link>
      </div>
    </div>
  );
}
