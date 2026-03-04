import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "xs" | "sm" | "md" | "lg";

type Props = {
    children: ReactNode;
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    className?: string;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
};

const variantStyles: Record<Variant, string> = {
    primary: "bg-brand-600 text-white shadow-brand-sm hover:bg-brand-700 focus:ring-brand-200",
    secondary: "bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 focus:ring-brand-100",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-100",
    outline: "bg-white text-slate-700 border border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-100",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 focus:ring-red-100"
};

const sizeStyles: Record<Size, string> = {
    xs: "px-2.5 py-1.5 text-[11px] gap-1 rounded-lg",
    sm: "px-3.5 py-2   text-xs    gap-1.5 rounded-lg",
    md: "px-4.5 py-2.5 text-sm    gap-2   rounded-xl",
    lg: "px-6   py-3.5 text-base  gap-2   rounded-xl"
};

export function Button({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    className,
    onClick,
    type = "button",
    disabled
}: Props) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                "inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
        >
            {loading && (
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {children}
        </button>
    );
}
