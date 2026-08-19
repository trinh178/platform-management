import { HttpRequestOptionProps } from './http-request';

export async function iamAuthenticationHandler(
  config: HttpRequestOptionProps,
): Promise<HttpRequestOptionProps> {
  if (typeof window !== 'undefined') return config;

  // Auth endpoints (sign-in, refresh) don't carry a Bearer token — calling
  // getServerSession here would cause infinite recursion when the jwt callback
  // triggers a token refresh, which in turn re-enters this interceptor.
  if (config.url && /\/auth\//i.test(config.url)) return config;

  // Dynamic import giữ server-only code (next-auth, authOptions) khỏi client bundle
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/core/auth');

  const session = await getServerSession(authOptions);
  if (session?.accessToken) {
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${session.accessToken}`,
      },
    };
  }

  return config;
}
