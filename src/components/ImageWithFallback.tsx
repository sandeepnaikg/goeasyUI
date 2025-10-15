import React, { ImgHTMLAttributes, useState } from 'react';

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  fallback?: string;
};

// Simple inline SVG placeholder (keeps repo asset-free)
const DEFAULT_FALLBACK = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'>
    <rect width='100%' height='100%' fill='%23f3f4f6' />
    <g fill='%239ca3af' font-family='Arial, Helvetica, sans-serif' text-anchor='middle'>
      <text x='50%' y='45%' font-size='32'>Image unavailable</text>
      <text x='50%' y='55%' font-size='18'>We couldn't load this image</text>
    </g>
  </svg>`
)}`;

export default function ImageWithFallback({ src, alt, fallback, ...rest }: Props) {
  const [srcState, setSrcState] = useState<string | undefined>(typeof src === 'string' ? src : undefined);

  const handleError: React.ReactEventHandler<HTMLImageElement> = () => {
    setSrcState(fallback || DEFAULT_FALLBACK);
  };

  return (
    <img
      {...rest}
      src={srcState}
      alt={alt}
      loading="lazy"
      onError={handleError}
    />
  );
}
