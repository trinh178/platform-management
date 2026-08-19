import { cn } from '@/shared/lib/utils';

type EmptyAvatarProps = {
  className?: string;
  size?: number | string;
};

export function EmptyAvatar({ className, size = '100%' }: EmptyAvatarProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={cn('text-muted-foreground/40', className)}
    >
      {/* Background */}
      <circle cx="12" cy="12" r="12" fill="currentColor" opacity="0.06" />

      {/* Head */}
      <circle cx="12" cy="8" r="3.5" fill="currentColor" opacity="0.35" />

      {/* Body */}
      <path
        d="M5 18c0-2.8 3-5 7-5s7 2.2 7 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}
