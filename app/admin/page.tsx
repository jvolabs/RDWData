import Link from "next/link";
import { BarChart2, Zap, Users, Car, Settings, DollarSign, Lock } from "lucide-react";

const stats = [
  { Icon: BarChart2, label: "Total Lookups", value: "—", bg: "bg-brand-50", icon: "text-brand-600", border: "border-brand-100" },
  { Icon: Zap, label: "Cache Hit Rate", value: "—", bg: "bg-accent-50", icon: "text-accent-600", border: "border-accent-100" },
  { Icon: Users, label: "Active Users", value: "—", bg: "bg-sky-50", icon: "text-sky-600", border: "border-sky-100" },
  { Icon: Car, label: "Unique Plates", value: "—", bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-100" },
];

const sections = [
  {
    Icon: Settings,
    title: "Operations",
    desc: "Report queue, approvals, user management, and platform settings.",
    tags: ["Queue", "Users", "Settings", "Approvals"]
  },
  {
    Icon: DollarSign,
    title: "Commercial",
    desc: "Pricing controls, subscriptions, revenue metrics, API key management.",
    tags: ["Pricing", "Subscriptions", "Revenue", "API Keys"]
  }
];

export default function AdminPage() {
  return (
    <div>
      <div className="border-b border-slate-100 bg-white px-6 py-8">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Internal</p>
            <h1 className="mt-0.5 font-display text-2xl font-extrabold text-slate-900 md:text-3xl">
              Admin Dashboard
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-600">
            <Lock className="h-3 w-3" />
            MVP Locked
          </span>
        </div>
      </div>

      <div className="bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {stats.map(({ Icon, label, value, bg, icon, border }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <span className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border ${bg} ${border}`}>
                  <Icon className={`h-4.5 w-4.5 ${icon}`} />
                </span>
                <p className="font-display text-2xl font-extrabold text-slate-900">{value}</p>
                <p className="mt-1 text-xs font-medium text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {sections.map(({ Icon, title, desc, tags }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-500" />
                  </span>
                  <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
                </div>
                <p className="mt-2 text-sm text-slate-500">{desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center border-t border-slate-100 bg-white py-6">
        <Link href="/" className="text-sm text-slate-400 transition hover:text-slate-700">← Back to search</Link>
      </div>
    </div>
  );
}
