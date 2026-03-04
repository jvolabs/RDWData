import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
};

/** Clean white elevated panel — main layout container for light theme */
export function Panel({ className, children }: Props) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-card md:p-8",
        className
      )}
    >
      {children}
    </section>
  );
}
