import { Skeleton } from '@/shared/components/ui/skeleton';

export function PageContentSkeleton() {
  const rows = [
    'w-[42%]',
    'w-[58%]',
    'w-[36%]',
    'w-[64%]',
    'w-[48%]',
    'w-[54%]',
    'w-[40%]',
    'w-[62%]',
    'w-[46%]',
    'w-[56%]',
  ];

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4">
      <div className="flex shrink-0 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className="size-10 rounded-md" />
          <div className="flex min-w-0 flex-col gap-2">
            <Skeleton className="h-4 w-44 max-w-[45vw]" />
            <Skeleton className="h-3 w-28 max-w-[32vw]" />
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-1 gap-3 md:grid-cols-[minmax(14rem,1fr)_9rem_9rem]">
        <Skeleton className="h-9 rounded-md" />
        <Skeleton className="h-9 rounded-md" />
        <Skeleton className="h-9 rounded-md" />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <div className="flex min-h-0 flex-col gap-3 rounded-md border border-border/60 bg-background/40 p-4">
          <div className="grid shrink-0 grid-cols-[2fr_1fr_1fr_5rem] gap-3">
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
          </div>

          <div className="grid min-h-0 flex-1 auto-rows-fr gap-3">
            {rows.map((widthClassName, index) => (
              <div
                key={index}
                className="grid grid-cols-[2fr_1fr_1fr_5rem] items-center gap-3"
              >
                <Skeleton className="h-8 rounded-md" />
                <Skeleton className="h-8 rounded-md" />
                <Skeleton className={`h-8 rounded-md ${widthClassName}`} />
                <Skeleton className="h-8 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden min-h-0 flex-col gap-3 rounded-md border border-border/60 bg-background/40 p-4 lg:flex">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-24 rounded-md" />
          <Skeleton className="h-3 w-[72%]" />
          <Skeleton className="h-3 w-[54%]" />
          <Skeleton className="h-3 w-[66%]" />
          <div className="mt-auto grid grid-cols-2 gap-3">
            <Skeleton className="h-9 rounded-md" />
            <Skeleton className="h-9 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
