import { useEffect, useState } from "react";

type ConfettiDetail =
  | { mode?: "default" | "shoutout"; pieces?: number }
  | undefined;

export default function Confetti() {
  const [active, setActive] = useState(false);
  const [burst, setBurst] = useState(0);
  const [config, setConfig] = useState<{
    pieces: number;
    mode: "default" | "shoutout";
  }>({ pieces: 28, mode: "default" });

  useEffect(() => {
    const fire = (e: Event) => {
      const detail = (e as CustomEvent<ConfettiDetail>).detail || {};
      const mode = detail.mode || "default";
      const pieces = detail.pieces ?? (mode === "shoutout" ? 60 : 28);
      setConfig({ pieces, mode });
      setBurst(Date.now());
      setActive(true);
      window.setTimeout(
        () => setActive(false),
        mode === "shoutout" ? 2200 : 1800
      );
    };
    window.addEventListener("confetti", fire as EventListener);
    return () => window.removeEventListener("confetti", fire as EventListener);
  }, []);

  if (!active) return null;
  const colors = ["#FDE68A", "#FCA5A5", "#A7F3D0", "#93C5FD", "#C4B5FD"];
  const pieces = Array.from({ length: config.pieces }, (_, i) => ({
    id: `${burst}-${i}`,
    left: Math.random() * 100,
    delay: Math.random() * (config.mode === "shoutout" ? 300 : 200),
    dur: (config.mode === "shoutout" ? 1400 : 1200) + Math.random() * 900,
    color: colors[i % colors.length],
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-[130] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute block w-2 h-3 rounded-sm opacity-0"
          style={{
            left: `${p.left}%`,
            top: "-10vh",
            backgroundColor: p.color,
            animation: `confettiFall ${p.dur}ms ease-out ${p.delay}ms forwards`,
          }}
        />
      ))}
    </div>
  );
}
