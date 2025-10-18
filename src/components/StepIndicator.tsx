type Props = {
  steps: string[];
  current: number; // 0-based index
};

export default function StepIndicator({ steps, current }: Props) {
  return (
    <div className="w-full">
      <ol className="flex items-center justify-between gap-2">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s} className="flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm ${
                    done
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : active
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {i + 1}
                </div>
                <div
                  className={`hidden sm:block text-sm ${
                    active ? "font-semibold text-gray-900" : "text-gray-600"
                  }`}
                >
                  {s}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-1 mt-2 rounded ${
                    i < current ? "bg-emerald-400" : "bg-gray-200"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
