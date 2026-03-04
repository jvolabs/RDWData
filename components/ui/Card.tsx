import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

type Variant = "default" | "flat" | "outline" | "colored";
type Color = "indigo" | "emerald" | "sky" | "amber" | "rose";

type Props = {
    children: ReactNode;
    variant?: Variant;
    color?: Color;
    className?: string;
    hover?: boolean;
};

const variantStyles: Record<Variant, string> = {
    default: "bg-white border border-slate-200 shadow-card",
    flat: "bg-slate-50 border border-slate-100",
    outline: "bg-transparent border-2 border-slate-200",
    colored: "bg-white border shadow-card"
};

const colorAccent: Record<Color, string> = {
    indigo: "border-brand-200 bg-brand-50",
    emerald: "border-accent-100 bg-accent-50",
    sky: "border-sky-100 bg-sky-50",
    amber: "border-amber-100 bg-amber-50",
    rose: "border-rose-100 bg-rose-50"
};

export function Card({
    children,
    variant = "default",
    color,
    className,
    hover = false
}: Props) {
    return (
        <div
            className={cn(
                "rounded-2xl p-6 transition-all duration-200",
                color ? colorAccent[color] : variantStyles[variant],
                hover && "hover:-translate-y-0.5 hover:shadow-card-hover cursor-default",
                className
            )}
        >
            {children}
        </div>
    );
}
