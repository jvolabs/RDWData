"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { PlateBadge } from "@/components/ui/PlateBadge";
import { MapPanel } from "@/components/vehicle/MapPanel";
import { InspectionTimeline } from "@/components/vehicle/InspectionTable";
import { RecallList } from "@/components/vehicle/RecallList";
import { useVehicleLookup } from "@/hooks/useVehicleLookup";
import { formatDisplayPlate } from "@/lib/rdw/normalize";
import type { VehicleProfile } from "@/lib/rdw/types";
import {
  ArrowLeft, RotateCcw, AlertCircle, CreditCard, RefreshCw,
  CheckCircle2, XCircle, Zap, Car, Gauge, Settings2, Weight,
  Globe, Calendar, Fuel, Thermometer, Banknote, ClipboardList,
  AlertTriangle, MapPin, Layers, Clock, Hash, ChevronRight,
  Shield, TrendingUp, Activity
} from "lucide-react";

type Props = { plate: string };
type Tab = "overview" | "history" | "safety" | "map";

// ─── Dutch colour → hex ─────────────────────────────────────────────────
const DUTCH_HEX: Record<string, string> = {
  BLAUW: "#3b82f6", GRIJS: "#94a3b8", ZWART: "#1e293b", WIT: "#e2e8f0",
  ROOD: "#ef4444", GROEN: "#22c55e", GEEL: "#eab308", ORANJE: "#f97316",
  ZILVER: "#cbd5e1", BEIGE: "#d4c5a9", BRUIN: "#92400e", PAARS: "#a855f7",
};
const colourHex = (n: string | null) => DUTCH_HEX[n?.toUpperCase() ?? ""] ?? "#94a3b8";

// ─── Skeleton ───────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`skeleton ${className}`} />
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Skeleton className="mb-5 h-[200px]" />
        <div className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    </div>
  );
}

// ─── Status badge (trust strip) ─────────────────────────────────────────
function StatusBadge({ ok, label, icon: Icon }: { ok: boolean; label: string; icon: React.ElementType }) {
  return (
    <div className={`
      flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-center
      transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-default
      ${ok
        ? "border-emerald-100 bg-emerald-50 hover:border-emerald-200"
        : "border-red-100 bg-red-50 hover:border-red-200"
      }
    `}>
      <div className={`flex h-8 w-8 items-center justify-center rounded-full
        ${ok ? "bg-emerald-100" : "bg-red-100"}`}
      >
        {ok
          ? <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />
          : <XCircle className="h-4 w-4 text-red-500" strokeWidth={2.5} />}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-wide leading-tight
        ${ok ? "text-emerald-800" : "text-red-700"}`}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Spec row (for sidebar) ─────────────────────────────────────────────
function SpecRow({ label, value, accent = false }: {
  label: string; value: string | null | undefined; accent?: boolean
}) {
  return (
    <div className={`flex items-center justify-between rounded-xl px-4 py-3
      ${accent
        ? "bg-brand-50 ring-1 ring-brand-100"
        : "bg-slate-50 hover:bg-slate-100/70 transition-colors"}`}
    >
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className={`text-sm font-bold tabular-nums
        ${accent ? "text-brand-700" : "text-slate-800"}`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

// ─── Category header ────────────────────────────────────────────────────
function CatHeader({ label }: { label: string }) {
  return (
    <p className="mb-2 mt-5 first:mt-0 text-[10px] font-black uppercase tracking-widest text-slate-400">
      {label}
    </p>
  );
}

// ─── Overview spec grid ──────────────────────────────────────────────────
function SpecGrid({ items }: { items: { label: string; value: string | null | undefined; Icon: React.ElementType; highlight?: boolean }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {items.map(({ label, value, Icon, highlight }) => (
        <div
          key={label}
          className={`
            group flex flex-col gap-2 rounded-2xl border p-4
            transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
            ${highlight
              ? "border-brand-100 bg-gradient-to-b from-brand-50 to-white"
              : "border-slate-100 bg-white hover:border-slate-200"
            }
          `}
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl
            ${highlight ? "bg-brand-100" : "bg-slate-100 group-hover:bg-slate-200 transition-colors"}`}
          >
            <Icon className={`h-4 w-4 ${highlight ? "text-brand-600" : "text-slate-500"}`} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className={`mt-0.5 text-sm font-black leading-snug ${highlight ? "text-brand-700" : "text-slate-900"}`}>
              {value ?? "—"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section heading ─────────────────────────────────────────────────────
function SectionTitle({ title, count }: { title: string; count?: number }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">{title}</h3>
      {count !== undefined && (
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
          {count}
        </span>
      )}
      <span className="h-px flex-1 bg-slate-100" />
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────
function OverviewTab({ v }: { v: VehicleProfile["vehicle"] }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <SectionTitle title="Powertrain" />
        <SpecGrid items={[
          { label: "Fuel", value: v.fuelType, Icon: Fuel, },
          { label: "Displacement", value: v.engine?.displacement ? `${v.engine.displacement} cc` : null, Icon: Settings2, },
          { label: "Cylinders", value: v.engine?.cylinders?.toString(), Icon: Hash, },
          { label: "Max power", value: v.engine?.powerKw ? `${v.engine.powerKw} kW` : null, Icon: Zap, highlight: true },
          { label: "CO₂", value: v.co2 ? `${v.co2} g/km` : null, Icon: Thermometer, },
          { label: "Consumption", value: v.consumptionCombined ? `${v.consumptionCombined} L/100` : null, Icon: Gauge, },
          { label: "Energy label", value: v.energyLabel, Icon: Activity, highlight: true },
          { label: "Euro class", value: v.emissionStandard, Icon: Thermometer, },
        ]} />
      </div>
      <div>
        <SectionTitle title="Body & dimensions" />
        <SpecGrid items={[
          { label: "Body type", value: v.bodyType, Icon: Car, },
          { label: "Doors", value: v.doors?.toString(), Icon: Car, },
          { label: "Seats", value: v.seats?.toString(), Icon: Car, },
          { label: "Kerb weight", value: v.weight?.empty ? `${v.weight.empty.toLocaleString("nl-NL")} kg` : null, Icon: Weight, },
          { label: "Max GVW", value: v.weight?.max ? `${v.weight.max.toLocaleString("nl-NL")} kg` : null, Icon: Weight, },
          { label: "Payload", value: v.weight?.payload ? `${v.weight.payload.toLocaleString("nl-NL")} kg` : null, Icon: Weight, },
        ]} />
      </div>
      <div>
        <SectionTitle title="Value" />
        <SpecGrid items={[
          { label: "Original price", value: v.cataloguePrice ? `€ ${v.cataloguePrice.toLocaleString("nl-NL")}` : null, Icon: Banknote, highlight: true },
          { label: "Odometer year", value: v.napLastYear?.toString(), Icon: Clock, },
        ]} />
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────
function Sidebar({ v, raw }: { v: VehicleProfile["vehicle"]; raw: VehicleProfile["raw"] }) {
  const colour = v.color?.primary ?? null;
  const colName = colour ? colour.charAt(0) + colour.slice(1).toLowerCase() : null;

  return (
    <div className="space-y-4">

      {/* Identity card */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="h-1 bg-gradient-to-r from-brand-500 via-violet-500 to-sky-500" />
        <div className="p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle</p>
          <h2 className="mt-1 font-display text-3xl font-black leading-none tracking-tight text-slate-900">
            {v.brand ?? "—"}
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-500 tracking-wide">{v.tradeName}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {v.year && (
              <span className="rounded-xl bg-slate-900 px-3 py-1 text-xs font-black text-white">
                {v.year}
              </span>
            )}
            {colName && (
              <span className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                <span className="h-3 w-3 rounded-full shadow-inner border border-slate-300/50" style={{ background: colourHex(colour) }} />
                {colName}
              </span>
            )}
            {v.bodyType && (
              <span className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {v.bodyType}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick specs */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="divide-y divide-slate-50 px-4 py-3">
          <CatHeader label="Engine" />
          <SpecRow label="Fuel type" value={v.fuelType} />
          <SpecRow label="Displacement" value={v.engine?.displacement ? `${v.engine.displacement} cc` : null} />
          <SpecRow label="Power" value={v.engine?.powerKw ? `${v.engine.powerKw} kW` : null} />
          <CatHeader label="Registration" />
          <SpecRow label="First (NL)" value={v.firstRegistrationNL} />
          <SpecRow label="First (World)" value={v.firstRegistrationWorld} />
          <SpecRow label="APK until" value={v.apkExpiryDate} accent />
          <SpecRow label="Owners" value={v.owners?.count !== null && v.owners?.count !== undefined ? String(v.owners.count) : null} />
          <CatHeader label="Financial" />
          <SpecRow label="List price" value={v.cataloguePrice ? `€ ${v.cataloguePrice.toLocaleString("nl-NL")}` : null} />
        </div>
      </div>

      {/* Hybrid badge */}
      {raw.fuel.length > 1 && (
        <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-100">
            <Zap className="h-4 w-4 text-sky-600" />
          </div>
          <div>
            <p className="text-xs font-black text-sky-900">Hybrid Vehicle</p>
            <p className="text-[11px] text-sky-700">
              {raw.fuel.map((f) => String(f.brandstof_omschrijving ?? "")).filter(Boolean).join(" + ")}
            </p>
          </div>
        </div>
      )}

      {/* EU Body class */}
      {raw.body.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">EU Body Classification</p>
          </div>
          <div className="divide-y divide-slate-50">
            {raw.body.slice(0, 3).map((b, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="rounded-lg bg-brand-50 px-2 py-0.5 font-mono text-xs font-black text-brand-700">
                  {String(b.carrosserietype ?? "—")}
                </span>
                <span className="truncate text-xs text-slate-500">
                  {String(b.type_carrosserie_europese_omschrijving ?? "—")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────
export function VehicleResultScreen({ plate }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const { normalized, isValid, data, isLoading, isFetching, isError, refetch } = useVehicleLookup(plate);

  // Scroll active tab into view on mobile
  useEffect(() => {
    const el = tabScrollRef.current?.querySelector("[data-active]");
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [activeTab]);

  // ── Invalid plate ────────────────────────────────────────────────────
  if (!isValid) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm rounded-3xl border border-amber-100 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
          <CreditCard className="h-6 w-6 text-amber-500" />
        </div>
        <h1 className="mt-5 font-display text-xl font-black text-slate-900">Invalid plate</h1>
        <p className="mt-2 text-sm text-slate-500">We couldn't recognise <strong>{plate}</strong>.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Go back
        </Link>
      </div>
    </div>
  );

  if (isLoading) return <LoadingScreen />;

  if (isError || !data) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <h1 className="mt-5 font-display text-xl font-black text-slate-900">Lookup Failed</h1>
        <p className="mt-2 text-sm text-slate-500">Couldn't retrieve vehicle data.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={refetch} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
            <RotateCcw className="h-4 w-4" /> Retry
          </button>
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  );

  const v = data.vehicle;

  if (!v) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm rounded-3xl border border-amber-100 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
          <RefreshCw className="h-6 w-6 text-amber-500" />
        </div>
        <h1 className="mt-5 font-display text-xl font-black text-slate-900">Refreshing</h1>
        <p className="mt-2 text-sm text-slate-500">Cached entry is outdated. Fetching fresh data…</p>
        <button onClick={refetch} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors">
          <RefreshCw className="h-4 w-4" /> Refresh now
        </button>
      </div>
    </div>
  );

  const apkOk = !!v.apkExpiryDate && new Date(v.apkExpiryDate) > new Date();
  const napOk = !!v.napVerdict && !v.napVerdict.toLowerCase().includes("onlogisch");
  const colour = v.color?.primary ?? null;

  const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", Icon: Layers },
    { id: "history", label: "Inspections", Icon: ClipboardList },
    { id: "safety", label: "Safety", Icon: Shield },
    { id: "map", label: "Find Garage", Icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8 space-y-4">

        {/* ─── TOP NAV BAR ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:shadow"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">New search</span>
          </Link>

          <div className="flex items-center gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-sm">
            <span className="font-mono text-xs font-bold text-slate-400">NL</span>
            <span className="font-display text-sm font-black text-slate-800 tracking-wider">
              {formatDisplayPlate(normalized)}
            </span>
          </div>

          {isFetching && (
            <span className="flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Updating…
            </span>
          )}

          <div className="ml-auto">
            <span className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold
              ${data.fromCache
                ? "border-slate-200 bg-white text-slate-500"
                : "border-brand-100 bg-brand-50 text-brand-700"}`}
            >
              <Zap className="h-3.5 w-3.5" />
              {data.fromCache ? "Cached" : "Live data"}
            </span>
          </div>
        </div>

        {/* ─── HERO CARD ───────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-md">
          {/* rainbow stripe */}
          <div className="h-1 bg-gradient-to-r from-brand-500 via-violet-500 to-sky-400" />

          {/* Background glow layers */}
          <div className="pointer-events-none absolute inset-0 
            [background:radial-gradient(ellipse_80%_60%_at_70%_0%,rgba(99,102,241,0.06),transparent_60%),
            radial-gradient(ellipse_40%_40%_at_0%_100%,rgba(14,165,233,0.04),transparent_55%)]"
          />

          <div className="relative flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:px-7 sm:py-7">
            {/* Left: Plate + name */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <PlateBadge plate={formatDisplayPlate(normalized)} size="lg" />
              <div>
                <h1 className="font-display text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  {v.brand}{" "}
                  <span className="bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent">
                    {v.tradeName}
                  </span>
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {v.year && <span className="rounded-lg bg-slate-900 px-2.5 py-0.5 text-xs font-black text-white">{v.year}</span>}
                  {colour && (
                    <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      <span className="h-2.5 w-2.5 rounded-full border border-slate-300/50" style={{ background: colourHex(colour) }} />
                      {colour.charAt(0) + colour.slice(1).toLowerCase()}
                    </span>
                  )}
                  {v.bodyType && <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{v.bodyType}</span>}
                </div>
              </div>
            </div>

            {/* Right: Key status pills */}
            <div className="flex flex-wrap gap-2 sm:ml-auto sm:flex-nowrap sm:items-start">
              {/* APK block */}
              <div className={`flex min-w-[90px] flex-col items-center rounded-2xl border px-4 py-3 text-center
                ${apkOk ? "border-emerald-100 bg-emerald-50" : "border-red-100 bg-red-50"}`}
              >
                <span className={`text-[10px] font-black uppercase tracking-widest ${apkOk ? "text-emerald-500" : "text-red-400"}`}>APK</span>
                <span className={`mt-0.5 text-sm font-black ${apkOk ? "text-emerald-800" : "text-red-700"}`}>{v.apkExpiryDate ?? "—"}</span>
              </div>

              {/* NAP block */}
              {v.napVerdict && (
                <div className={`flex min-w-[90px] flex-col items-center rounded-2xl border px-4 py-3 text-center
                  ${napOk ? "border-emerald-100 bg-emerald-50" : "border-amber-100 bg-amber-50"}`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-widest ${napOk ? "text-emerald-500" : "text-amber-500"}`}>NAP</span>
                  <span className={`mt-0.5 text-sm font-black ${napOk ? "text-emerald-800" : "text-amber-800"}`}>{v.napVerdict}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── TRUST STRIP ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          <StatusBadge ok={apkOk} label="Road Legal" icon={Shield} />
          <StatusBadge ok={napOk} label="NAP OK" icon={TrendingUp} />
          <StatusBadge ok={v.insured} label="Insured" icon={Shield} />
          <StatusBadge ok={!v.hasOpenRecall} label="No Recall" icon={AlertTriangle} />
          <StatusBadge ok={v.transferPossible} label="Transfer OK" icon={CheckCircle2} />
          <StatusBadge ok={!v.wok} label="No WOK" icon={Shield} />
        </div>

        {/* ─── MAIN 2-COL ───────────────────────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">

          {/* ── Sidebar (hidden on mobile, shown below tabs) ─────────────── */}
          <div className="hidden lg:block">
            <Sidebar v={v} raw={data.raw} />
          </div>

          {/* ── Tab panel ─────────────────────────────────────────────────── */}
          <div className="space-y-3">

            {/* Tab scroll row */}
            <div
              ref={tabScrollRef}
              className="flex gap-1.5 overflow-x-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {tabs.map(({ id, label, Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    data-active={active || undefined}
                    onClick={() => setActiveTab(id)}
                    className={`
                      flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold
                      transition-all duration-200
                      ${active
                        ? "bg-brand-600 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Tab content card */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              {/* Thin accent line */}
              <div className="h-0.5 bg-gradient-to-r from-brand-400/70 via-violet-400/50 to-transparent" />

              <div className={`${activeTab === "map" ? "p-0" : "p-5 sm:p-6"}`}>
                {activeTab === "overview" && <OverviewTab v={v} />}
                {activeTab === "history" && (
                  <div className="animate-fade-in">
                    <SectionTitle title="APK Inspection Records" count={data.inspections.length} />
                    <InspectionTimeline items={data.inspections} />
                  </div>
                )}
                {activeTab === "safety" && (
                  <div className="animate-fade-in">
                    <SectionTitle title="Safety Recalls" count={data.recalls.length} />
                    <RecallList items={data.recalls} />
                  </div>
                )}
                {activeTab === "map" && <MapPanel />}
              </div>
            </div>
          </div>
        </div>

        {/* ─── MOBILE Sidebar (below tabs on mobile) ──────────────────────── */}
        <div className="lg:hidden">
          <Sidebar v={v} raw={data.raw} />
        </div>

      </div>
    </div>
  );
}
