import { useEffect, useRef, useState, useCallback } from "react";
import ImageWithFallback from "./ImageWithFallback";

type Slide = {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onClick?: () => void;
};

export default function Carousel({
  slides,
  auto = true,
  interval = 3500,
}: {
  slides: Slide[];
  auto?: boolean;
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);
  const stop = () => {
    if (timer.current) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  };
  const start = useCallback(() => {
    if (!auto || slides.length <= 1) return;
    stop();
    timer.current = window.setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      interval
    );
  }, [auto, slides.length, interval]);
  useEffect(() => {
    start();
    return stop;
  }, [start]);

  const goto = (i: number) => setIndex((i + slides.length) % slides.length);
  // no-op: we rely on index to render active slide

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-gray-200 shadow">
      <div className="h-[220px] md:h-[280px] relative bg-gray-100">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => s.onClick?.()}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out will-change-[opacity] ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            aria-label={s.title || "slide"}
          >
            <ImageWithFallback
              src={s.image}
              alt={s.title || ""}
              className="w-full h-full object-cover"
            />
            {(s.title || s.subtitle || s.ctaText) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
            )}
            <div
              className={`absolute left-5 bottom-5 text-left transition-opacity duration-500 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={i !== index}
            >
              {s.title && (
                <div className="text-white text-2xl md:text-3xl font-bold drop-shadow">
                  {s.title}
                </div>
              )}
              {s.subtitle && (
                <div className="text-white/90 text-sm md:text-base drop-shadow">
                  {s.subtitle}
                </div>
              )}
              {s.ctaText && (
                <div className="mt-3 inline-block px-4 py-2 rounded-xl bg-white text-gray-900 font-semibold">
                  {s.ctaText}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      {/* dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goto(i)}
            className={`w-2.5 h-2.5 rounded-full ${
              i === index ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
      {/* arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => goto(index - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow"
          >
            ‹
          </button>
          <button
            onClick={() => goto(index + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
