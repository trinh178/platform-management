'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface BlinkHighlightContainerHandle {
  trigger: () => void;
}

export interface BlinkHighlightContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  triggerRef?: React.Ref<BlinkHighlightContainerHandle>;
  duration?: number;
}

export const BlinkHighlightContainer = React.forwardRef<
  HTMLDivElement,
  BlinkHighlightContainerProps
>((props, ref) => {
  const { triggerRef, duration = 1000, className, children, ...rest } = props;

  const [active, setActive] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const trigger = React.useCallback(() => {
    setActive(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setActive(false);
    }, duration);
  }, [duration]);

  React.useImperativeHandle(triggerRef, () => ({
    trigger,
  }));

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'relative border rounded-md',
        active && 'animate-blink-highlight border-primary',
        className,
      )}
      {...rest}
    >
      {children}

      <style jsx>{`
        @keyframes blink-highlight {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          }
        }

        .animate-blink-highlight {
          animation: blink-highlight 0.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
});

BlinkHighlightContainer.displayName = 'BlinkHighlightContainer';

export default BlinkHighlightContainer;
