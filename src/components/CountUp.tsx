import { useEffect, useRef, useState } from "react";

export default function CountUp({
  start = 0,
  end,
  duration = 1200,
  formatter,
  suffix = "",
  className = "",
}: {
  start?: number;
  end: number;
  duration?: number; // ms
  formatter?: (n: number) => string;
  suffix?: string;
  className?: string;
}) {
  const [val, setVal] = useState(start);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(start);

  useEffect(() => {
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const p = Math.min(1, (ts - startRef.current) / duration);
      const next = fromRef.current + (end - fromRef.current) * easeOutCubic(p);
      setVal(next);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration]);

  const display = formatter ? formatter(val) : Math.round(val).toLocaleString();
  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  );
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
