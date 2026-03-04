import { Zap, ShieldCheck, Database } from "lucide-react";

type Feature = { title: string; description: string };
type Props = { items: Feature[] };

const featureConfig = [
  {
    Icon: Zap,
    bg: "bg-brand-600",
    ring: "ring-brand-100",
    from: "from-brand-400",
    to: "to-brand-700",
    badge: "bg-brand-100 text-brand-700",
    badgeText: "Speed"
  },
  {
    Icon: ShieldCheck,
    bg: "bg-emerald-500",
    ring: "ring-emerald-100",
    from: "from-emerald-400",
    to: "to-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
    badgeText: "Accuracy"
  },
  {
    Icon: Database,
    bg: "bg-sky-500",
    ring: "ring-sky-100",
    from: "from-sky-400",
    to: "to-sky-600",
    badge: "bg-sky-100 text-sky-700",
    badgeText: "Coverage"
  },
];

export function FeatureGrid({ items }: Props) {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="section-label">Why PlateIntel</span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Built for decision-makers
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-slate-500">
            Whether you're buying, selling, or inspecting — get the full picture instantly.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid gap-5 md:grid-cols-3">
          {/* Large featured card */}
          {items[0] && (() => {
            const cfg = featureConfig[0];
            return (
              <div className="group card-glow relative col-span-1 overflow-hidden rounded-2xl border border-brand-100 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:col-span-2 animate-fade-in-up">
                {/* Gradient top bar */}
                <div className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${cfg.from} ${cfg.to}`} />

                {/* Icon + feature badge */}
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cfg.bg} text-white shadow-sm transition-transform duration-200 group-hover:scale-105`}>
                    <cfg.Icon className="h-6 w-6" />
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${cfg.badge}`}>
                    {cfg.badgeText}
                  </span>
                </div>

                <h3 className="mt-5 font-display text-xl font-bold text-slate-900">{items[0].title}</h3>
                <p className="mt-2 text-base leading-relaxed text-slate-500">{items[0].description}</p>

                {/* Decorative indicator bar */}
                <div className="mt-7 flex items-center gap-2">
                  <div className="h-1.5 w-24 rounded-full bg-brand-500 transition-all duration-500 group-hover:w-32" />
                  <div className="h-1.5 w-10 rounded-full bg-brand-200" />
                  <div className="h-1.5 w-5 rounded-full bg-brand-100" />
                </div>

                {/* BG decoration */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full bg-brand-50/80 transition-all duration-300 group-hover:-right-4 group-hover:-top-4 group-hover:opacity-60" aria-hidden="true" />
              </div>
            );
          })()}

          {/* Stacked right cards */}
          <div className="flex flex-col gap-5">
            {items.slice(1).map((item, index) => {
              const cfg = featureConfig[(index + 1) % featureConfig.length];
              return (
                <div
                  key={item.title}
                  className="group card-glow relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md animate-fade-in-up"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  {/* Hover-reveal top bar */}
                  <div className={`absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${cfg.from} ${cfg.to} opacity-0 transition-opacity duration-200 group-hover:opacity-100`} />

                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${cfg.bg} text-white shadow-sm transition-transform duration-200 group-hover:scale-110`}>
                      <cfg.Icon className="h-5 w-5" />
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}>
                      {cfg.badgeText}
                    </span>
                  </div>
                  <h3 className="mt-3.5 font-display text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
