import { cn } from '@/shared/lib/utils';

const STATUS_DOT_CLASS: Record<string, string> = {
  Active: 'bg-emerald-500',
  Inactive: 'bg-muted-foreground/40',
  Deprecated: 'bg-amber-500',
};

export default function StatusDot({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-block size-1.5 shrink-0 rounded-full',
        STATUS_DOT_CLASS[status] ?? 'bg-muted-foreground/40',
      )}
    />
  );
}
