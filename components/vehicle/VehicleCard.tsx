import type { VehicleProfile } from "@/lib/rdw/types";
import {
  Tag, Car, Calendar, Fuel, ShieldCheck, AlertTriangle,
  CheckCircle, Gauge, Settings2, Weight, Users, Globe,
  MapPin, Zap, Thermometer, BadgeCheck
} from "lucide-react";

type Props = { profile: VehicleProfile };

function Field({
  label, value, Icon, accent = false
}: {
  label: string; value: string | null | undefined; Icon: React.ElementType; accent?: boolean;
}) {
  const display = (value === null || value === undefined || value === "") ? "—" : value;
  return (
    <div className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-150
      ${accent ? "bg-brand-50 ring-1 ring-brand-100" : "bg-slate-50 hover:bg-slate-100"}`}
    >
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110
        ${accent ? "bg-brand-100" : "bg-white border border-slate-200"}`}
      >
        <Icon className={`h-3.5 w-3.5 ${accent ? "text-brand-600" : "text-slate-500"}`} />
      </span>
      <span className="min-w-0 flex-1 text-xs text-slate-500">{label}</span>
      <span className={`text-right text-sm font-semibold ${accent ? "text-brand-700" : "text-slate-900"}`}>
        {display}
      </span>
    </div>
  );
}

function SectionHeader({ title, Icon, color = "brand" }: { title: string; Icon: React.ElementType; color?: string }) {
  const colorMap: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600 ring-brand-100",
    green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    sky: "bg-sky-50 text-sky-600 ring-sky-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
  };
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className={`flex h-7 w-7 items-center justify-center rounded-lg ring-1 ${colorMap[color] ?? colorMap.brand}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
    </div>
  );
}

function fmt(v: number | null | undefined, unit = ""): string | null {
  if (v == null) return null;
  return `${v.toLocaleString("nl-NL")}${unit ? ` ${unit}` : ""}`;
}

export function VehicleCard({ profile }: Props) {
  const v = profile.vehicle;
  const apkOk = v.apkExpiryDate && new Date(v.apkExpiryDate) > new Date();

  return (
    <div className="card-glow overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      {/* Gradient top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-400 via-brand-600 to-violet-500" />

      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            {v.brand ?? "—"} {v.tradeName ?? ""}
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            {v.year ?? "—"} · {v.bodyType ?? "—"} · {v.color?.primary ?? "—"}
          </p>
        </div>
        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold
          ${apkOk ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}
        >
          {apkOk
            ? <><ShieldCheck className="h-3 w-3" /> Road Legal</>
            : <><AlertTriangle className="h-3 w-3" /> APK Expired</>}
        </span>
      </div>

      <div className="space-y-5 p-4">
        {/* Identity */}
        <div>
          <SectionHeader title="Identity" Icon={Car} color="brand" />
          <div className="space-y-1.5">
            <Field Icon={Tag} label="Make" value={v.brand} />
            <Field Icon={Car} label="Model" value={v.tradeName} />
            <Field Icon={Calendar} label="Year" value={fmt(v.year)} />
            <Field Icon={Gauge} label="Body type" value={v.bodyType} />
            <Field Icon={Users} label="Seats" value={fmt(v.seats)} />
            <Field Icon={Car} label="Doors" value={fmt(v.doors)} />
          </div>
        </div>

        {/* Powertrain */}
        <div>
          <SectionHeader title="Powertrain" Icon={Fuel} color="sky" />
          <div className="space-y-1.5">
            <Field Icon={Fuel} label="Fuel type" value={v.fuelType} />
            <Field Icon={Settings2} label="Displacement" value={fmt(v.engine?.displacement, "cc")} />
            <Field Icon={Settings2} label="Cylinders" value={fmt(v.engine?.cylinders)} />
            <Field Icon={Zap} label="Max power" value={fmt(v.engine?.powerKw, "kW")} />
            <Field Icon={Thermometer} label="CO₂ emissions" value={fmt(v.co2, "g/km")} />
            <Field Icon={Gauge} label="Consumption" value={v.consumptionCombined != null ? `${v.consumptionCombined} L/100km` : null} />
          </div>
        </div>

        {/* Weight */}
        <div>
          <SectionHeader title="Weight" Icon={Weight} color="violet" />
          <div className="space-y-1.5">
            <Field Icon={Weight} label="Kerb weight" value={fmt(v.weight?.empty, "kg")} />
            <Field Icon={Weight} label="Max GVW" value={fmt(v.weight?.max, "kg")} />
            <Field Icon={Weight} label="Payload" value={fmt(v.weight?.payload, "kg")} />
          </div>
        </div>

        {/* Registration */}
        <div>
          <SectionHeader title="Registration" Icon={Globe} color="green" />
          <div className="space-y-1.5">
            <Field Icon={MapPin} label="First registered (NL)" value={v.firstRegistrationNL} />
            <Field Icon={Globe} label="First registered (world)" value={v.firstRegistrationWorld} />
            <Field Icon={Calendar} label="APK valid until" value={v.apkExpiryDate} accent />
            <Field Icon={BadgeCheck} label="Transfer possible" value={v.transferPossible ? "Yes" : "No"} />
          </div>
        </div>

        {/* Status flags */}
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          {[
            { label: "Road-legal", ok: apkOk },
            { label: "Transfer allowed", ok: v.transferPossible },
            { label: "No export flag", ok: !v.exportIndicator },
            { label: "No WOK flag", ok: !v.wok },
            { label: "No recalls", ok: v.recallsCount === 0 },
          ].map(({ label, ok }) => (
            <span key={label} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold
              ${ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
            >
              {ok ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
