import type { RdwRecord } from "@/lib/rdw/types";
import { AlertTriangle, CalendarClock, Hash, ShieldCheck } from "lucide-react";

type Props = { items: RdwRecord[] };

// The APK dataset (a34c-vvps) returns defect-level records.
// Group them by inspection date for a cleaner timeline view.
type InspectionGroup = {
  dateRaw: string;
  dateDisplay: string;
  defects: { code: string; count: number }[];
};

function formatDate(raw: string | null | undefined): string {
  if (!raw) return "—";
  const s = String(raw).replace(/\D/g, "");
  if (s.length === 8) return `${s.slice(6, 8)}-${s.slice(4, 6)}-${s.slice(0, 4)}`;
  return raw as string;
}

function groupByDate(items: RdwRecord[]): InspectionGroup[] {
  const map = new Map<string, InspectionGroup>();
  for (const item of items) {
    const dateRaw = String(item.meld_datum_door_keuringsinstantie ?? "");
    if (!map.has(dateRaw)) {
      map.set(dateRaw, {
        dateRaw,
        dateDisplay: formatDate(dateRaw),
        defects: []
      });
    }
    const code = String(item.gebrek_identificatie ?? "—");
    const count = Number(item.aantal_gebreken_geconstateerd ?? 0);
    map.get(dateRaw)!.defects.push({ code, count });
  }
  // Sort descending by date (newest first)
  return Array.from(map.values()).sort((a, b) => b.dateRaw.localeCompare(a.dateRaw));
}

export function InspectionTable({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <p className="text-sm text-slate-500">No APK defect records on file.</p>
      </div>
    );
  }

  const groups = groupByDate(items);

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const hasDefects = group.defects.some((d) => d.count > 0);
        return (
          <div
            key={group.dateRaw}
            className={`overflow-hidden rounded-xl border transition-all duration-150
              ${hasDefects
                ? "border-amber-100 bg-amber-50/60"
                : "border-emerald-100 bg-emerald-50/40"}`}
          >
            {/* Header row */}
            <div className={`flex items-center gap-3 px-4 py-2.5 border-b
              ${hasDefects ? "border-amber-100/80" : "border-emerald-100/80"}`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full
                ${hasDefects ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}
              >
                {hasDefects
                  ? <AlertTriangle className="h-3 w-3" />
                  : <ShieldCheck className="h-3 w-3" />}
              </span>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-sm font-semibold text-slate-800">{group.dateDisplay}</span>
              </div>
              <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold
                ${hasDefects ? "bg-amber-200 text-amber-800" : "bg-emerald-200 text-emerald-800"}`}
              >
                {group.defects.reduce((s, d) => s + d.count, 0)} defect(s)
              </span>
            </div>

            {/* Defect rows */}
            <div className="divide-y divide-slate-100/60 px-4">
              {group.defects.map((d, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100">
                    <Hash className="h-2.5 w-2.5 text-slate-400" />
                  </span>
                  <span className="text-xs text-slate-600">Defect code <strong className="font-mono text-slate-800">{d.code}</strong></span>
                  <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
                    ×{d.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
