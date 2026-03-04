"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { PlateBadge } from "@/components/ui/PlateBadge";
import { Spinner } from "@/components/ui/Spinner";
import { InspectionTable } from "@/components/vehicle/InspectionTable";
import { RecallList } from "@/components/vehicle/RecallList";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { useVehicleLookup } from "@/hooks/useVehicleLookup";
import { formatDisplayPlate } from "@/lib/rdw/normalize";
import {
  ArrowLeft, ClipboardList, AlertTriangle, RotateCcw,
  AlertCircle, CreditCard, RefreshCw, CheckCircle, Zap,
  Car, CalendarClock
} from "lucide-react";

type Props = { plate: string };

function Sk({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

function LoadingState() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 pb-16 pt-8">
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="h-1 w-full bg-gradient-to-r from-brand-400 via-brand-600 to-violet-500" />
        <div className="p-6">
          <Sk className="mb-3 h-8 w-48" />
          <Sk className="h-4 w-72" />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[400px_1fr]">
        <div className="space-y-2">{[...Array(14)].map((_, i) => <Sk key={i} className="h-11" />)}</div>
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Sk key={i} className="h-16 rounded-xl" />)}</div>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Spinner size="md" />
        <span className="text-sm text-slate-500">Analysing vehicle records…</span>
      </div>
    </main>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 pb-16 pt-12">
      <div className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-card">
        <div className="h-1 w-full bg-gradient-to-r from-red-400 to-rose-500" />
        <div className="p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-100">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold text-slate-900">Lookup Failed</h1>
          <p className="mt-2 text-sm text-slate-500">{message}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={onRetry} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-brand-sm transition-all hover:bg-brand-700 hover:-translate-y-px">
              <RotateCcw className="h-4 w-4" /> Try again
            </button>
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" /> New search
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export function VehicleResultScreen({ plate }: Props) {
  const { normalized, isValid, data, isLoading, isFetching, isError, refetch } =
    useVehicleLookup(plate);

  if (!isValid) {
    return (
      <main className="mx-auto w-full max-w-2xl px-6 pb-16 pt-12">
        <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-card">
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 ring-4 ring-amber-100">
              <CreditCard className="h-7 w-7 text-amber-600" />
            </div>
            <h1 className="mt-4 font-display text-xl font-bold text-slate-900">Invalid Plate Format</h1>
            <p className="mt-2 text-sm text-slate-500">
              We couldn't recognise <span className="font-mono font-bold">{plate}</span>. Check the format and try again.
            </p>
            <div className="mt-6">
              <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-brand-sm hover:bg-brand-700">
                <ArrowLeft className="h-4 w-4" /> Try another plate
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) return <LoadingState />;

  if (isError || !data) {
    return <ErrorState message="Couldn't retrieve vehicle information right now. Please try again in a moment." onRetry={refetch} />;
  }

  const inspectionCount = data.inspections.length;
  const recallCount = data.recalls.length;
  const displayPlate = formatDisplayPlate(normalized);
  const v = data.vehicle;
  const apkOk = v.apkExpiryDate && new Date(v.apkExpiryDate) > new Date();

  return (
    <main className="mx-auto w-full max-w-7xl px-6 pb-16 pt-8 animate-fade-in">

      {/* Top header bar */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="h-1 w-full bg-gradient-to-r from-brand-400 via-brand-600 to-violet-500" />
        <div className="flex flex-wrap items-start justify-between gap-5 px-6 py-5">
          <div className="flex flex-wrap items-center gap-4">
            <PlateBadge plate={displayPlate} size="lg" />
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">
                {v.brand} {v.tradeName}
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">
                {v.year ?? "—"} · {v.bodyType ?? "—"} · {v.color?.primary ?? "—"} ·{" "}
                {data.fromCache ? "Cached result" : "Live data"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={apkOk ? "success" : "error"}>
              {apkOk ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
              APK {apkOk ? `until ${v.apkExpiryDate}` : "Expired"}
            </Badge>
            <Badge variant={data.fromCache ? "success" : "info"} dot>
              {data.fromCache ? <><Zap className="h-3 w-3" /> Instant</> : <><RefreshCw className="h-3 w-3" /> Live</>}
            </Badge>
            <Badge variant="neutral">
              <CalendarClock className="h-3 w-3" />
              {inspectionCount} APK record{inspectionCount !== 1 ? "s" : ""}
            </Badge>
            <Badge variant={recallCount > 0 ? "warning" : "success"}>
              {recallCount > 0
                ? <><AlertTriangle className="h-3 w-3" /> {recallCount} recall(s)</>
                : <><CheckCircle className="h-3 w-3" /> No recalls</>}
            </Badge>
            {isFetching && <Badge variant="primary" dot>Updating…</Badge>}
            <Link href="/" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:-translate-y-px">
              <ArrowLeft className="h-3.5 w-3.5" /> New search
            </Link>
          </div>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid gap-5 lg:grid-cols-[400px_1fr]">

        {/* Left: full vehicle card with all sections */}
        <VehicleCard profile={data} />

        {/* Right: inspection + recalls panels */}
        <div className="flex flex-col gap-5">

          {/* Hybrid drivetrain callout if applicable */}
          {data.raw.fuel.length > 1 && (
            <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/60 px-5 py-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-sky-100 shadow-sm">
                <Zap className="h-4 w-4 text-sky-600" />
              </span>
              <div>
                <p className="text-sm font-semibold text-sky-800">Hybrid / Multi-fuel Vehicle</p>
                <p className="text-xs text-sky-600">
                  {data.raw.fuel.map((f) => String(f.brandstof_omschrijving ?? "")).filter(Boolean).join(" + ")}
                </p>
              </div>
            </div>
          )}

          {/* APK Inspections */}
          <Panel className="p-5">
            <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-slate-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 ring-1 ring-brand-100">
                <ClipboardList className="h-4 w-4 text-brand-600" />
              </span>
              APK Inspection Records
              <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                {inspectionCount} entr{inspectionCount !== 1 ? "ies" : "y"}
              </span>
            </h2>
            <InspectionTable items={data.inspections} />
          </Panel>

          {/* Vehicle class info */}
          {data.raw.body.length > 0 && (
            <Panel className="p-5">
              <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-slate-900">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 ring-1 ring-violet-100">
                  <Car className="h-4 w-4 text-violet-600" />
                </span>
                Body Classification
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {data.raw.body.map((b, i) => (
                  <div key={i} className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-xs text-slate-400">Type code</p>
                    <p className="font-mono text-sm font-bold text-slate-800">{String(b.carrosserietype ?? "—")}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{String(b.type_carrosserie_europese_omschrijving ?? "—")}</p>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Safety Recalls */}
          <Panel className="p-5">
            <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-slate-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-100">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </span>
              Safety Alerts
              <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                {recallCount} item{recallCount !== 1 ? "s" : ""}
              </span>
            </h2>
            <RecallList items={data.recalls} />
          </Panel>
        </div>
      </div>
    </main>
  );
}
