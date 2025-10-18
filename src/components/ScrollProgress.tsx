import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      );
      const winHeight = window.innerHeight;
      const total = Math.max(1, docHeight - winHeight);
      setProgress(Math.min(100, Math.max(0, (scrollTop / total) * 100)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true } as AddEventListenerOptions);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div
      style={{ top: "var(--app-header-offset)" }}
      className="fixed left-0 right-0 z-[95] h-1"
      aria-hidden
    >
      <div className="w-full h-full bg-transparent" />
      <div
        className="absolute left-0 top-0 h-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-300 transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
