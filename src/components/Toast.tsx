import { useCallback, useEffect, useRef, useState } from "react";

type ToastItem = {
  id: string;
  type?: "success" | "info" | "error";
  title?: string;
  message: string;
  durationMs?: number;
};

type ToastPayload = Partial<Omit<ToastItem, "id">> & { message: string };

export default function Toast() {
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const timerRefs = useRef<Record<string, number>>({});
  const remainingRefs = useRef<Record<string, number>>({});
  const startRefs = useRef<Record<string, number>>({});

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<unknown>;
      const d: unknown = ce?.detail;
      let payload: ToastPayload | null = null;
      if (typeof d === "string") {
        payload = { message: d };
      } else if (
        d &&
        typeof d === "object" &&
        typeof (d as { message?: unknown }).message === "string"
      ) {
        const obj = d as {
          message: unknown;
          title?: unknown;
          type?: unknown;
          durationMs?: unknown;
        };
        payload = {
          message: obj.message as string,
          title: typeof obj.title === "string" ? obj.title : undefined,
          type:
            obj.type === "success" ||
            obj.type === "info" ||
            obj.type === "error"
              ? (obj.type as "success" | "info" | "error")
              : undefined,
          durationMs:
            typeof obj.durationMs === "number" ? obj.durationMs : undefined,
        };
      }
      if (!payload) return;
      const item: ToastItem = {
        id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: payload.type || "info",
        title: payload.title,
        message: payload.message,
        durationMs: payload.durationMs ?? 3500,
      };
      setQueue((prev) => [...prev, item]);
      // initialize timers bookkeeping
      remainingRefs.current[item.id] = item.durationMs!;
    };
    window.addEventListener("toast", handler as EventListener);
    return () => window.removeEventListener("toast", handler as EventListener);
  }, []);

  // dismiss
  const dismiss = useCallback((id: string) => {
    setQueue((prev) => prev.filter((t) => t.id !== id));
    if (timerRefs.current[id]) {
      clearTimeout(timerRefs.current[id]);
      delete timerRefs.current[id];
    }
    delete remainingRefs.current[id];
    delete startRefs.current[id];
  }, []);

  const schedule = useCallback(
    (id: string) => {
      const remaining = Math.max(0, remainingRefs.current[id] ?? 0);
      startRefs.current[id] = Date.now();
      timerRefs.current[id] = window.setTimeout(() => dismiss(id), remaining);
    },
    [dismiss]
  );

  useEffect(() => {
    // schedule timers for new items not yet scheduled
    queue.forEach((t) => {
      if (timerRefs.current[t.id]) return;
      schedule(t.id);
    });
  }, [queue, schedule]);

  useEffect(() => {
    // Dismiss latest toast on Escape
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const last = queue[queue.length - 1];
        if (last) dismiss(last.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [queue, dismiss]);

  // unmount cleanup
  useEffect(() => {
    return () => {
      Object.values(timerRefs.current).forEach((id) => clearTimeout(id));
      timerRefs.current = {};
      remainingRefs.current = {} as Record<string, number>;
      startRefs.current = {} as Record<string, number>;
    };
  }, []);

  const pause = useCallback((id: string) => {
    const tid = timerRefs.current[id];
    if (tid) {
      clearTimeout(tid);
      delete timerRefs.current[id];
      const elapsed = Date.now() - (startRefs.current[id] || Date.now());
      remainingRefs.current[id] = Math.max(
        0,
        (remainingRefs.current[id] || 0) - elapsed
      );
    }
  }, []);

  const resume = useCallback(
    (id: string) => {
      if (remainingRefs.current[id] && remainingRefs.current[id] > 0) {
        schedule(id);
      }
    },
    [schedule]
  );

  return (
    <div
      className="fixed inset-x-0 bottom-6 z-[120] flex items-end justify-center px-4 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
      role="region"
    >
      <div className="w-full max-w-md space-y-2">
        {queue.map((t) => (
          <ToastCard
            key={t.id}
            item={t}
            onClose={() => dismiss(t.id)}
            onPause={() => pause(t.id)}
            onResume={() => resume(t.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ToastCard({
  item,
  onClose,
  onPause,
  onResume,
}: {
  item: ToastItem;
  onClose: () => void;
  onPause: () => void;
  onResume: () => void;
}) {
  const [offsetY, setOffsetY] = useState(0);
  const startY = useRef<number | null>(null);

  const color =
    item.type === "success"
      ? "from-emerald-500 to-green-600"
      : item.type === "error"
      ? "from-rose-500 to-red-600"
      : "from-sky-500 to-blue-600";

  return (
    <div
      role="status"
      className={`pointer-events-auto card-lift relative overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white`}
      style={{ transform: `translateY(${offsetY}px)` }}
      onMouseEnter={onPause}
      onMouseLeave={onResume}
      onTouchStart={(e) => {
        startY.current = e.touches[0].clientY;
      }}
      onTouchMove={(e) => {
        if (startY.current == null) return;
        const delta = e.touches[0].clientY - startY.current;
        setOffsetY(delta);
      }}
      onTouchEnd={() => {
        if (Math.abs(offsetY) > 40) {
          onClose();
        }
        setOffsetY(0);
        startY.current = null;
      }}
    >
      <div className={`h-1 w-full bg-gradient-to-r ${color}`} />
      <div className="p-3">
        {item.title && (
          <div className="text-sm font-semibold text-gray-900">
            {item.title}
          </div>
        )}
        <div className="text-sm text-gray-800">{item.message}</div>
        <div className="mt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 pressable"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
