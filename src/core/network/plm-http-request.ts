import { HttpRequest, HttpRequestError } from './http-request';
import { iamAuthenticationHandler } from './iam-authentication-handler';
import { iamUnauthorizedHandler } from './iam-unauthorized-handler';
import { resolveServiceBaseUrl } from './service-registry';

export interface PlmServerError {
  code: string;
  message: string;
}

export type PlmHttpRequestError = HttpRequestError<PlmServerError>;

const plmHttpRequest = new HttpRequest<PlmServerError>({
  baseUrl: resolveServiceBaseUrl('plm'),
  headers: {
    'Content-Type': 'application/json',
  },
  requestInterceptor: iamAuthenticationHandler,
  responseInterceptor: iamUnauthorizedHandler,
});

export default plmHttpRequest;

// Mock
if (
  process.env.NEXT_PUBLIC_MOCK_API === 'true' &&
  typeof window === 'undefined'
) {
  import('@/mock/plm');
}
