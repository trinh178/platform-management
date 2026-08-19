import React from 'react';
import Image, { StaticImageData } from 'next/image';

type RoundedSize = 'sm' | 'lg' | 'xl' | '2xl' | '3xl';

interface AppIconProps {
  src: string | StaticImageData;
  alt?: string;
  size?: number;
  rounded?: RoundedSize;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
  placeholderClassName?: string;
  showPlaceholder?: boolean;
}

const roundedMap: Record<RoundedSize, string> = {
  sm: 'rounded-sm',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
};

export default function AppIcon({
  src,
  alt = 'icon',
  size = 80,
  rounded = '2xl',
  className = '',
  priority = false,
  onClick,
  showPlaceholder = true,
  placeholderClassName = 'from-(--app-icon-gradient-from) via-(--app-icon-gradient-via) to-(--app-icon-gradient-to)',
}: AppIconProps) {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <div
      onClick={onClick}
      className={`
        group relative cursor-pointer
        transform transition duration-300 ease-out
        hover:scale-110 active:scale-95
        ${className}
      `}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-tr from-(--app-icon-gradient-from)/30 via-(--app-icon-gradient-via)/30 to-(--app-icon-gradient-to)/30 opacity-0 group-hover:opacity-100 blur-md transition duration-500" />

      <div
        className={`
          relative w-full h-full overflow-hidden
          ${roundedMap[rounded]}
          shadow-md dark:shadow-black/40
          group-hover:shadow-xl
          transition duration-300
        `}
      >
        {showPlaceholder && !loaded && (
          <div
            className={`
              absolute inset-0 animate-pulse bg-gradient-to-br
              ${placeholderClassName}
            `}
          />
        )}

        <Image
          src={src}
          alt={alt}
          fill
          sizes="64px"
          priority={priority}
          onLoad={() => setLoaded(true)}
          className={`
            object-cover transition-opacity duration-500
            ${loaded ? 'opacity-100' : 'opacity-0'}
          `}
          placeholder="blur"
        />

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300" />
      </div>
    </div>
  );
}
