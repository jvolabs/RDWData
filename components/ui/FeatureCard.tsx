import React from "react";
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

export type FeatureVariant = "info" | "warning" | "success" | "critical";

function getIcons(variant: FeatureVariant) {
    switch (variant) {
        case "info": return <Info className="h-5 w-5 text-sky-600" />;
        case "warning": return <AlertTriangle className="h-5 w-5 text-amber-600" />;
        case "success": return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
        case "critical": return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
}

function getStyles(variant: FeatureVariant) {
    switch (variant) {
        case "info": return "bg-sky-50 border-sky-100";
        case "warning": return "bg-amber-50 border-amber-100";
        case "success": return "bg-emerald-50 border-emerald-100";
        case "critical": return "bg-red-50 border-red-100";
    }
}

function getTextStyles(variant: FeatureVariant) {
    switch (variant) {
        case "info": return "text-sky-900 text-sky-700";
        case "warning": return "text-amber-900 text-amber-800";
        case "success": return "text-emerald-900 text-emerald-700";
        case "critical": return "text-red-900 text-red-700";
    }
}

export function FeatureCard({
    variant = "info",
    title,
    desc,
    badge
}: {
    variant?: FeatureVariant;
    title: string;
    desc: React.ReactNode;
    badge?: string;
}) {
    const [titleColor, descColor] = getTextStyles(variant).split(" ");

    return (
        <div className={`relative overflow-hidden flex flex-col gap-2 rounded-2xl border p-5 ${getStyles(variant)}`}>
            <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">{getIcons(variant)}</div>
                <div className="flex-1">
                    <h4 className={`font-bold ${titleColor} pr-20`}>{title}</h4>
                    <p className={`mt-1.5 text-xs text-balance ${descColor} leading-relaxed`}>{desc}</p>
                </div>
            </div>
            {badge && (
                <span className={`absolute top-4 right-4 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${titleColor} bg-white/60`}>
                    {badge}
                </span>
            )}
        </div>
    );
}
