import { joinURL } from '@/shared/utils';

type ServiceEntry = {
  /** Gateway prefix used as the first path segment in proxy and gateway URLs. */
  prefix: string;
  /** Optional server-side direct service URL that bypasses the gateway. */
  directUrl?: string;
};

const SERVICE_REGISTRY = {
  iam: {
    prefix: process.env.NEXT_PUBLIC_APIGATEWAY_IAM!,
    directUrl: process.env.IAM_DIRECT_URL,
  },
  hrmem: {
    prefix: process.env.NEXT_PUBLIC_APIGATEWAY_HRM_EM!,
    directUrl: process.env.HRMEM_DIRECT_URL,
  },
} as const satisfies Record<string, ServiceEntry>;

export type ServiceKey = keyof typeof SERVICE_REGISTRY;

export class ProxyBackendUrlError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ProxyBackendUrlError';
  }
}

function normalizeServicePrefix(prefix: string | undefined): string {
  return (prefix ?? '').replace(/^\/+|\/+$/g, '');
}

function encodeProxyPathSegments(pathSegments: string[]): string[] {
  if (pathSegments.length === 0) {
    throw new ProxyBackendUrlError(400, 'Invalid proxy path');
  }

  return pathSegments.map(segment => {
    if (
      !segment ||
      segment === '.' ||
      segment === '..' ||
      segment.includes('/') ||
      segment.includes('\\')
    ) {
      throw new ProxyBackendUrlError(400, 'Invalid proxy path');
    }

    return encodeURIComponent(segment);
  });
}

export function resolveServiceBaseUrl(key: ServiceKey): string {
  const service = SERVICE_REGISTRY[key];
  const isServer = typeof window === 'undefined';

  if (isServer && service.directUrl) return service.directUrl;

  const base = isServer
    ? process.env.APIGATEWAY_BASE_URL
    : process.env.NEXT_PUBLIC_APIPROXY_BASE_URL;

  return joinURL(base, service.prefix);
}

export function resolveProxyBackendUrl(
  pathSegments: string[],
  search: string,
): string {
  const encodedPathSegments = encodeProxyPathSegments(pathSegments);
  const servicePrefix = normalizeServicePrefix(pathSegments[0]);
  const matched = Object.values(SERVICE_REGISTRY).find(
    service => normalizeServicePrefix(service.prefix) === servicePrefix,
  );

  if (!matched) {
    throw new ProxyBackendUrlError(404, 'Unknown proxy service');
  }

  if (matched.directUrl) {
    return joinURL(
      matched.directUrl,
      `${encodedPathSegments.slice(1).join('/')}${search}`,
    );
  }

  return joinURL(
    process.env.APIGATEWAY_BASE_URL,
    `${encodedPathSegments.join('/')}${search}`,
  );
}
