import { cn } from "@/lib/utils/cn";

type Variant = "neutral" | "success" | "warning" | "error" | "primary" | "info";

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  dot?: boolean;
  className?: string;
};

const styles: Record<Variant, string> = {
  neutral: "bg-slate-100 text-slate-600 border border-slate-200",
  success: "bg-accent-50 text-accent-600 border border-accent-100",
  warning: "bg-amber-50  text-amber-700  border border-amber-200",
  error: "bg-red-50    text-red-600    border border-red-200",
  primary: "bg-brand-50  text-brand-700  border border-brand-200",
  info: "bg-sky-50    text-sky-700    border border-sky-100"
};

const dotColors: Record<Variant, string> = {
  neutral: "bg-slate-400",
  success: "bg-accent-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  primary: "bg-brand-500",
  info: "bg-sky-500"
};

export function Badge({ children, variant = "neutral", dot = false, className }: Props) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", styles[variant], className)}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])} />}
      {children}
    </span>
  );
}
