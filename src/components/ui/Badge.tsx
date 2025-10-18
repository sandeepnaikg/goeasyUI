import { HTMLAttributes } from "react";
import { cn } from "./cn";

export default function Badge({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-full border bg-brand-50 border-brand-200 text-brand-700",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
