import ImageWithFallback from './ImageWithFallback';

export type DealItem = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  price?: number | string;
  badge?: string; // e.g., "50% OFF"
  cta?: string; // e.g., "Shop Now"
  onClick?: () => void;
};

export default function DealsCarousel({ title, items }: { title: string; items: DealItem[] }) {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
          {items.map((d) => (
            <button
              key={d.id}
              onClick={() => d.onClick?.()}
              className="snap-start shrink-0 w-64 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow hover:shadow-lg transition-all text-left"
            >
              <div className="relative h-36">
                <ImageWithFallback src={d.image} alt={d.title} className="absolute inset-0 w-full h-full object-cover" />
                {d.badge && (
                  <span className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full bg-black/70 text-white">
                    {d.badge}
                  </span>
                )}
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold text-gray-900 line-clamp-1">{d.title}</div>
                {d.subtitle && (
                  <div className="text-xs text-gray-600 line-clamp-1">{d.subtitle}</div>
                )}
                <div className="mt-2 flex items-center justify-between">
                  {d.price && (
                    <div className="text-sm font-bold text-gray-900">{typeof d.price === 'number' ? `₹${d.price.toLocaleString()}` : d.price}</div>
                  )}
                  {d.cta && (
                    <span className="text-xs font-semibold text-brand-600">{d.cta} →</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
