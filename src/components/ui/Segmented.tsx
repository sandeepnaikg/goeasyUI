import { cn } from "./cn";

interface Option<T extends string> {
  label: string;
  value: T;
}

export default function Segmented<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg border-2 border-gray-300 overflow-hidden bg-white",
        className
      )}
    >
      {options.map((o, i) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "px-3 py-2 text-sm",
            i > 0 && "border-l-2 border-gray-300",
            o.value === value
              ? "bg-brand-600 text-white"
              : "hover:bg-brand-50 text-gray-800"
          )}
          aria-pressed={o.value === value}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
