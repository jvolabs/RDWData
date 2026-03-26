export function ProgressBar({ label, percentage, estMin, estMax }: { label: string, percentage: number, estMin: number, estMax: number }) {
    let color = "bg-emerald-500";
    if (percentage > 60) color = "bg-red-500";
    else if (percentage > 30) color = "bg-amber-500";

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-800">{label}</span>
                <span className="font-bold text-slate-600 tabular-nums">{percentage}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                    className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="mt-1.5 text-right text-[11px] font-semibold text-slate-400">
                Geschat: € {estMin} - € {estMax}
            </p>
        </div>
    );
}
