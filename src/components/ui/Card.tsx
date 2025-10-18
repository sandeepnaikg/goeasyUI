import { HTMLAttributes } from "react";
import { cn } from "./cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  gradient?: boolean;
  innerClassName?: string; // customize inner content padding/border
}

export default function Card({ gradient, className, innerClassName, children, ...props }: CardProps) {
  if (gradient) {
    return (
      <div
        className={cn(
          "gradient-border bg-gradient-to-r from-brand-300 to-brand-600/60 rounded-2xl",
          className
        )}
        {...props}
      >
        <div className={cn("gradient-content rounded-2xl shadow-md border border-gray-100 p-6", innerClassName)}>
          {children}
        </div>
      </div>
    );
  }
  return (
    <div
      className={cn(
        cn("bg-white rounded-2xl shadow-md border border-gray-100", innerClassName || "p-6"),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
