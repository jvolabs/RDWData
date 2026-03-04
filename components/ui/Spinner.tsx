import { cn } from "@/lib/utils/cn";

type Props = {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
};

const sizeMap = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8",
    xl: "h-10 w-10"
};

export function Spinner({ size = "md", className }: Props) {
    return (
        <svg
            className={cn("animate-spin text-brand-500", sizeMap[size] ?? "h-5 w-5", className)}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading"
        >
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}
