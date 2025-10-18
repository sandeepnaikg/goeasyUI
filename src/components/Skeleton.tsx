export function SkeletonLine({
  width = "100%",
  height = 12,
}: {
  width?: number | string;
  height?: number;
}) {
  return (
    <div className="skeleton rounded" style={{ width, height }} />
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <div className="skeleton rounded-full" style={{ width: size, height: size }} />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="p-4 border border-gray-200 rounded-2xl bg-white">
      <div className="flex items-center gap-3 mb-3">
        <SkeletonAvatar />
        <div className="flex-1">
          <SkeletonLine width="60%" height={12} />
          <div className="mt-2">
            <SkeletonLine width="40%" height={10} />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine key={i} height={10} width={`${80 - i * 10}%`} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-2xl p-3 bg-white"
        >
          <div className="w-full h-28 skeleton rounded mb-2" />
          <SkeletonLine width="70%" height={12} />
          <div className="mt-2">
            <SkeletonLine width="50%" height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}
