import { cn } from "@/lib/utils/cn";

type Props = {
    plate: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
};

const sizes = {
    sm: { wrap: "text-xs  pl-7  pr-2.5 py-0.5", flag: "w-6", flagText: "text-[6px]", nlText: "text-[7px]" },
    md: { wrap: "text-sm  pl-9  pr-3   py-1", flag: "w-7", flagText: "text-[6.5px]", nlText: "text-[8px]" },
    lg: { wrap: "text-lg  pl-11 pr-4   py-1.5", flag: "w-9", flagText: "text-[8px]", nlText: "text-[10px]" },
    xl: { wrap: "text-2xl pl-14 pr-6   py-2", flag: "w-12", flagText: "text-[10px]", nlText: "text-[13px]" }
};

/**
 * Authentic Dutch license plate.
 * Blue EU strip left with stars + "NL", yellow body with plate text.
 */
export function PlateBadge({ plate, size = "md", className }: Props) {
    const s = sizes[size];

    return (
        <span
            className={cn(
                "relative inline-flex items-center overflow-hidden rounded-lg border-2 border-slate-700",
                "bg-amber-300 font-display font-extrabold uppercase tracking-[0.18em] text-slate-900 shadow-md",
                s.wrap,
                className
            )}
        >
            {/* EU blue strip */}
            <span
                className={cn(
                    "absolute left-0 top-0 flex h-full flex-col items-center justify-center gap-px bg-blue-700 text-white",
                    s.flag
                )}
                aria-hidden="true"
            >
                <span className={cn("text-yellow-300 leading-none", s.flagText)}>★</span>
                <span className={cn("font-black leading-none", s.nlText)}>NL</span>
            </span>
            {plate}
        </span>
    );
}
