import 'next/navigation';
import type { AppPath } from '@/modules/route-paths';

declare module 'next/dist/shared/lib/app-router-context.shared-runtime' {
  interface NavigateOptions {
    relative?: boolean;
    params?: Record<string, string>;
  }

  interface AppRouterInstance {
    push(href: AppPath, options?: NavigateOptions): void;
  }
}
