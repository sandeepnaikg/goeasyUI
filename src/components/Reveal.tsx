import { useEffect, useRef, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  animation?: "fade-up" | "fade-in" | "zoom-in";
  delay?: number; // ms
  once?: boolean;
  className?: string;
};

export default function Reveal({
  children,
  animation = "fade-up",
  delay = 0,
  once = true,
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // small delay to allow paint before animating
            const t = window.setTimeout(
              () => setVisible(true),
              Math.max(0, delay)
            );
            if (once) observer.unobserve(entry.target);
            return () => window.clearTimeout(t);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, once]);

  return (
    <div
      ref={ref}
      className={`${className} reveal ${animation} ${
        visible ? "is-visible" : ""
      }`}
    >
      {children}
    </div>
  );
}
