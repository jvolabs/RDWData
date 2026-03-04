import { KeyRound, ScanLine, FileText } from "lucide-react";

type Step = { title: string; description: string };
type Props = { items: Step[] };

const stepConfig = [
  {
    Icon: KeyRound,
    num: "01",
    circleBg: "bg-brand-600",
    iconBg: "bg-brand-50",
    iconColor: "text-brand-600",
    line: "bg-brand-200",
    border: "border-brand-100",
    ring: "ring-brand-50",
    from: "from-brand-400",
    to: "to-brand-700",
  },
  {
    Icon: ScanLine,
    num: "02",
    circleBg: "bg-violet-600",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    line: "bg-violet-200",
    border: "border-violet-100",
    ring: "ring-violet-50",
    from: "from-violet-400",
    to: "to-violet-700",
  },
  {
    Icon: FileText,
    num: "03",
    circleBg: "bg-sky-600",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    line: "bg-sky-200",
    border: "border-sky-100",
    ring: "ring-sky-50",
    from: "from-sky-400",
    to: "to-sky-600",
  },
];

export function HowItWorks({ items }: Props) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-14 text-center">
          <span className="section-label">How it works</span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Your vehicle report in three steps
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-500">
            No account required. Just enter the plate and PlateIntel handles everything else.
          </p>
        </div>

        {/* Steps grid */}
        <div className="relative grid gap-6 md:grid-cols-3">
          {/* Gradient connector */}
          <div
            className="pointer-events-none absolute left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] top-10 hidden h-px md:block"
            style={{
              background: "linear-gradient(90deg, #6366f1, #7c3aed 50%, #0ea5e9)",
              opacity: 0.2
            }}
            aria-hidden="true"
          />

          {items.map((item, index) => {
            const cfg = stepConfig[index % stepConfig.length];
            return (
              <div
                key={item.title}
                className={`group card-glow animate-fade-in-up relative rounded-2xl border ${cfg.border} bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-md ring-4 ${cfg.ring} ring-opacity-30`}
                style={{ animationDelay: `${index * 120}ms` }}
              >
                {/* Hover gradient bar */}
                <div className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${cfg.from} ${cfg.to} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                {/* Number + icon badge */}
                <div className="relative inline-flex">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full font-display text-lg font-black text-white shadow-sm ${cfg.circleBg} transition-transform duration-200 group-hover:scale-105`}>
                    {cfg.num}
                  </div>
                  <div className={`absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full ${cfg.iconBg} shadow-sm ring-2 ring-white`}>
                    <cfg.Icon className={`h-3.5 w-3.5 ${cfg.iconColor}`} />
                  </div>
                </div>

                <div className={`mt-4 h-1 w-12 rounded-full ${cfg.line} transition-all duration-300 group-hover:w-16`} />
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
