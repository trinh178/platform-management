/**
 * Import this file wherever appfetchInstance is used directly on the server.
 * It loads custom HttpRequest modules so their mock setup can register routes.
 */
import './iam-http-request';
import './hrmem-http-request';
import './plm-http-request';

let mockRoutesPromise: Promise<unknown> | undefined;

export function ensureMockRoutesReady(): Promise<unknown> {
  if (
    process.env.NEXT_PUBLIC_MOCK_API !== 'true' ||
    typeof window !== 'undefined'
  ) {
    return Promise.resolve();
  }

  mockRoutesPromise ??= Promise.all([
    import('@/mock/iam'),
    import('@/mock/hrmem'),
    import('@/mock/plm'),
  ]);

  return mockRoutesPromise;
}
