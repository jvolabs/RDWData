import { Hash, Zap, ShieldCheck } from "lucide-react";

type Stat = { label: string; value: string };
type Props = { items: Stat[] };

const statConfig = [
  { Icon: Hash, color: "text-brand-600", bg: "bg-brand-50", border: "border-brand-100", desc: "and growing" },
  { Icon: Zap, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100", desc: "average" },
  { Icon: ShieldCheck, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-100", desc: "formats" },
];

export function StatStrip({ items }: Props) {
  return (
    <section className="border-y border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">
          {items.map((item, index) => {
            const { Icon, color, bg, border, desc } = statConfig[index % statConfig.length];
            return (
              <div
                key={item.label}
                className="group flex items-center gap-5 px-8 py-9 first:pl-0 last:pr-0 animate-fade-in-up transition-all duration-200 hover:bg-slate-50/60"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${bg} ${border} transition-transform duration-200 group-hover:scale-110`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </span>
                <div>
                  <p className={`font-display text-3xl font-extrabold tabular-nums ${color}`}>{item.value}</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
