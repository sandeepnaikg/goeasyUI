import ImageWithFallback from './ImageWithFallback';

export interface CardTileProps {
  image: string;
  title: string;
  subtitle?: string;
  priceBadge?: string; // text shown as pill over image (e.g., ₹29999 or ₹250 for two)
  rating?: number | string;
  footerLeft?: string; // e.g., price text below
  footerRight?: string; // e.g., nights/duration
  onClick?: () => void;
  accentColor?: 'cyan' | 'emerald' | 'pink' | 'purple' | 'blue';
}

const colorMap: Record<NonNullable<CardTileProps['accentColor']>, string> = {
  cyan: 'text-cyan-700',
  emerald: 'text-emerald-700',
  pink: 'text-pink-700',
  purple: 'text-purple-700',
  blue: 'text-blue-700',
};

export default function CardTile({
  image,
  title,
  subtitle,
  priceBadge,
  rating,
  footerLeft,
  footerRight,
  onClick,
  accentColor = 'cyan',
}: CardTileProps) {
  const accentClass = colorMap[accentColor] || 'text-cyan-700';
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow overflow-hidden cursor-pointer transform hover:scale-105 transition-all border border-gray-200"
    >
      <div className="relative h-48">
        <ImageWithFallback src={image} alt={title} className="w-full h-full object-cover" />
        {priceBadge && (
          <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-sm font-bold shadow">
            <span className={accentClass}>{priceBadge}</span>
          </div>
        )}
        {rating !== undefined && (
          <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-bold text-gray-800">
            ⭐ {rating}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-xl mb-1 text-gray-900">{title}</h3>
        {subtitle && <p className="text-gray-700 mb-2">{subtitle}</p>}
        {(footerLeft || footerRight) && (
          <div className="flex justify-between items-center">
            <span className={`text-lg font-semibold ${accentClass}`}>{footerLeft}</span>
            <span className="text-sm text-gray-500">{footerRight}</span>
          </div>
        )}
      </div>
    </div>
  );
}
