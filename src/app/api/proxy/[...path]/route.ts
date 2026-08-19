import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth';
import { appfetchInstance } from '@/core/network/appfetch';
import { ensureMockRoutesReady } from '@/core/network/inject-mock';
import {
  ProxyBackendUrlError,
  resolveProxyBackendUrl,
} from '@/core/network/service-registry';

type ProxyContextParams = Promise<{ path: string[] }>;
type RequestInitWithDuplex = RequestInit & { duplex?: 'half' };

const FORWARDED_REQUEST_HEADERS = [
  'accept',
  'accept-language',
  'content-type',
] as const;
const PRESERVED_RESPONSE_HEADERS = [
  'cache-control',
  'content-disposition',
  'content-type',
  'vary',
] as const;
const EXPOSED_RESPONSE_HEADERS = ['content-disposition'] as const;
const NO_BODY_RESPONSE_STATUSES = new Set([204, 205, 304]);
const PROXY_ALLOWED_METHODS = [
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
] as const;
const CORS_ALLOWED_ORIGIN_ENV_KEYS = [
  'NEXT_PUBLIC_APIPROXY_BASE_URL',
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_SIGNIN_URL',
] as const;

function getUrlOrigin(url: string | undefined): string | undefined {
  if (!url) return undefined;

  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
}

function getConfiguredAllowedOrigins(): Set<string> {
  return new Set(
    CORS_ALLOWED_ORIGIN_ENV_KEYS.map(envKey =>
      getUrlOrigin(process.env[envKey]),
    ).filter(origin => origin !== undefined),
  );
}

function isLocalDevelopmentOrigin(origin: string): boolean {
  if (process.env.NODE_ENV === 'production') return false;

  try {
    const { hostname } = new URL(origin);
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]'
    );
  } catch {
    return false;
  }
}

function isOriginAllowed(origin: string): boolean {
  return (
    getConfiguredAllowedOrigins().has(origin) ||
    isLocalDevelopmentOrigin(origin)
  );
}

function buildCorsHeaders(req: NextRequest): Headers {
  const headers = new Headers();
  const origin = req.headers.get('origin');

  if (origin) {
    headers.set('Vary', 'Origin');
  }

  if (origin && isOriginAllowed(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
  }

  headers.set('Access-Control-Allow-Methods', PROXY_ALLOWED_METHODS.join(', '));
  headers.set(
    'Access-Control-Allow-Headers',
    req.headers.get('access-control-request-headers') ??
      'Content-Type, Authorization',
  );
  headers.set(
    'Access-Control-Expose-Headers',
    EXPOSED_RESPONSE_HEADERS.join(', '),
  );
  headers.set('Access-Control-Max-Age', '86400');

  return headers;
}

function appendHeaderListValue(
  headers: Headers,
  headerName: string,
  headerValue: string,
) {
  const existingHeaderValue = headers.get(headerName);

  if (!existingHeaderValue) {
    headers.set(headerName, headerValue);
    return;
  }

  const existingValues = new Set(
    existingHeaderValue.split(',').map(value => value.trim().toLowerCase()),
  );
  const valuesToAppend = headerValue
    .split(',')
    .map(value => value.trim())
    .filter(value => value && !existingValues.has(value.toLowerCase()));

  if (valuesToAppend.length > 0) {
    headers.set(
      headerName,
      `${existingHeaderValue}, ${valuesToAppend.join(', ')}`,
    );
  }
}

function addCorsHeaders(req: NextRequest, headers: Headers): Headers {
  for (const [headerName, headerValue] of buildCorsHeaders(req)) {
    if (headerName.toLowerCase() === 'vary') {
      appendHeaderListValue(headers, headerName, headerValue);
    } else {
      headers.set(headerName, headerValue);
    }
  }

  return headers;
}

function buildProxyJsonResponse(
  req: NextRequest,
  message: string,
  status: number,
) {
  return Response.json({ message }, { headers: buildCorsHeaders(req), status });
}

function buildProxyRequestHeaders(req: NextRequest, accessToken: string) {
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${accessToken}`);

  for (const headerName of FORWARDED_REQUEST_HEADERS) {
    const headerValue = req.headers.get(headerName);
    if (headerValue) headers.set(headerName, headerValue);
  }

  return headers;
}

function buildProxyResponseInit(
  req: NextRequest,
  response: Response,
): ResponseInit {
  const headers = new Headers();

  for (const headerName of PRESERVED_RESPONSE_HEADERS) {
    const headerValue = response.headers.get(headerName);
    if (headerValue) headers.set(headerName, headerValue);
  }

  return {
    headers: addCorsHeaders(req, headers),
    status: response.status,
    statusText: response.statusText,
  };
}

async function proxy(req: NextRequest, paramsPromise: ProxyContextParams) {
  const { path } = await paramsPromise;

  const session = await getServerSession(authOptions);

  if (session === null) {
    return buildProxyJsonResponse(req, 'UnauthorizedProxy', 401);
  }

  if (!session.accessToken || session.error === 'RefreshAccessTokenError') {
    return buildProxyJsonResponse(req, 'UnauthorizedOriginalServer', 401);
  }

  const url = new URL(req.url);
  let backendUrl: string;

  try {
    backendUrl = resolveProxyBackendUrl(path, url.search);
  } catch (error) {
    if (error instanceof ProxyBackendUrlError) {
      return buildProxyJsonResponse(req, error.message, error.status);
    }

    throw error;
  }

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const body = hasBody ? req.body : undefined;
  const requestInit: RequestInitWithDuplex = {
    headers: buildProxyRequestHeaders(req, session.accessToken),
    method: req.method,
  };

  if (body) {
    requestInit.body = body;
    requestInit.duplex = 'half';
  }

  let backendRes: Response;
  try {
    await ensureMockRoutesReady();
    backendRes = await appfetchInstance.fetch(backendUrl, requestInit);
  } catch {
    return buildProxyJsonResponse(req, 'Bad Gateway', 502);
  }

  return new Response(
    NO_BODY_RESPONSE_STATUSES.has(backendRes.status) ? null : backendRes.body,
    buildProxyResponseInit(req, backendRes),
  );
}

export async function GET(
  req: NextRequest,
  context: { params: ProxyContextParams },
) {
  return proxy(req, context.params);
}

export async function HEAD(
  req: NextRequest,
  context: { params: ProxyContextParams },
) {
  return proxy(req, context.params);
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { headers: buildCorsHeaders(req), status: 204 });
}

export async function POST(
  req: NextRequest,
  context: { params: ProxyContextParams },
) {
  return proxy(req, context.params);
}

export async function PUT(
  req: NextRequest,
  context: { params: ProxyContextParams },
) {
  return proxy(req, context.params);
}

export async function PATCH(
  req: NextRequest,
  context: { params: ProxyContextParams },
) {
  return proxy(req, context.params);
}

export async function DELETE(
  req: NextRequest,
  context: { params: ProxyContextParams },
) {
  return proxy(req, context.params);
}
