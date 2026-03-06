export function GaugeChart({ score, max = 10, label, desc, invertColors = false }: { score: number, max?: number, label: string, desc?: string, invertColors?: boolean }) {
    const percentage = Math.max(0, Math.min(100, (score / max) * 100));

    // Colors based on Good/Bad logic
    let color = "stroke-emerald-500 text-emerald-500";
    let labelColor = "text-emerald-600";
    let statusText = "GOED";

    if (invertColors) {
        if (percentage > 70) { color = "stroke-red-500 text-red-500"; labelColor = "text-red-700"; statusText = "VERHOOGD"; }
        else if (percentage > 40) { color = "stroke-amber-500 text-amber-500"; labelColor = "text-amber-700"; statusText = "GEMIDDELD"; }
        else { color = "stroke-emerald-500 text-emerald-500"; labelColor = "text-emerald-700"; statusText = "LAAG"; }
    } else {
        if (percentage < 40) { color = "stroke-red-500 text-red-500"; labelColor = "text-red-700"; statusText = "SLECHT"; }
        else if (percentage < 70) { color = "stroke-amber-500 text-amber-500"; labelColor = "text-amber-700"; statusText = "REDELIJK"; }
        else { color = "stroke-emerald-500 text-emerald-500"; labelColor = "text-emerald-700"; statusText = "GOED"; }
    }

    const radius = 40;
    const circumference = Math.PI * radius; // Half-circle
    const fillPercentage = (percentage / 100) * circumference;
    const strokeDashoffset = circumference - fillPercentage;

    return (
        <div className="flex flex-col items-center">
            <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>

            {/* Container must be exactly half height to clip the bottom of the circle */}
            <div className="relative flex h-[50px] w-[100px] items-end justify-center overflow-hidden">
                <svg className="absolute top-0 h-[100px] w-[100px]" viewBox="0 0 100 100" style={{ transform: 'rotate(-180deg)' }}>
                    {/* Background Arc */}
                    <circle
                        className="stroke-slate-200"
                        strokeWidth="10"
                        fill="transparent"
                        r={radius}
                        cx="50"
                        cy="50"
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                    />
                    {/* Foreground Arc */}
                    <circle
                        className={`${color} transition-all duration-1000 ease-out`}
                        strokeWidth="10"
                        fill="transparent"
                        r={radius}
                        cx="50"
                        cy="50"
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute bottom-0 text-center">
                    <span className={`font-display text-3xl font-black ${labelColor} leading-none tracking-tighter`}>
                        {score % 1 === 0 ? score : score.toFixed(1)}
                    </span>
                </div>
            </div>

            <p className={`mt-3 text-[11px] font-black uppercase tracking-wide ${labelColor}`}>{statusText}</p>
            {desc && <p className="mt-1 text-[10px] font-medium text-slate-500">{desc}</p>}
        </div>
    );
}
