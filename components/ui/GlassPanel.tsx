import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
    className?: string;
    glow?: boolean;
};

/**
 * Heavy frosted-glass panel — the primary layout container on dark backgrounds.
 * Provides backdrop-blur, subtle inner border, and optional brand glow.
 */
export function GlassPanel({ children, className, glow = false }: Props) {
    return (
        <div
            className={cn(
                "relative rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-2xl md:p-8",
                glow && "shadow-glow border-brand-500/20",
                !glow && "shadow-glass",
                className
            )}
        >
            {/* Inner highlight rim */}
            <div
                className="pointer-events-none absolute inset-0 rounded-3xl"
                style={{
                    background:
                        "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)"
                }}
                aria-hidden="true"
            />
            <div className="relative">{children}</div>
        </div>
    );
}
