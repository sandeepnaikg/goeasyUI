import { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  size?: "sm" | "md";
}

export default function Chip({
  className,
  selected,
  size = "md",
  children,
  ...props
}: ChipProps) {
  return (
    <button
      className={cn(
        "rounded-full border-2 transition-colors",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-1.5 text-sm",
        selected
          ? "border-brand-600 text-brand-700 bg-brand-50"
          : "border-gray-200 text-gray-700 hover:border-brand-400",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
