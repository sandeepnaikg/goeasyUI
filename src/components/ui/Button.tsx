import { ButtonHTMLAttributes, forwardRef, MouseEvent } from "react";
import { cn } from "./cn";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "subtle"
  | "danger"
  | "success";
type Size = "sm" | "md" | "lg";

export interface UIButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
}

const base =
  "inline-flex items-center justify-center font-semibold rounded-lg transition-all pressable focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-300 disabled:opacity-50 disabled:cursor-not-allowed";

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2",
  lg: "px-5 py-2.5 text-lg",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-brand-700 to-brand-500 text-white shadow hover:brightness-105",
  secondary:
    "bg-gray-900 text-white hover:bg-gray-800 shadow-sm",
  outline:
    "border-2 border-gray-300 text-gray-800 hover:border-brand-500 bg-white",
  subtle:
    "bg-gray-100 text-gray-800 hover:bg-gray-200",
  danger:
    "bg-red-600 text-white hover:bg-red-500",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-500",
};

export const Button = forwardRef<HTMLButtonElement, UIButtonProps>(
  ({ className, size = "md", variant = "primary", loading, block, children, onClick, ...props }, ref) => {
    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      // ripple (respect reduced motion)
      try {
        const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (!mql.matches) {
          const target = e.currentTarget;
          const rect = target.getBoundingClientRect();
          const span = document.createElement("span");
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;
          span.className = "btn-ripple";
          span.style.width = span.style.height = `${size}px`;
          span.style.left = `${x}px`;
          span.style.top = `${y}px`;
          target.appendChild(span);
          window.setTimeout(() => span.remove(), 650);
        }
      } catch {
        /* ignore */
      }
      onClick?.(e);
    };
    return (
      <button
        ref={ref}
        className={cn(
          base,
          sizes[size],
          variants[variant],
          block && "w-full",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {loading && (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
