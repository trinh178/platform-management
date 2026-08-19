import { HttpRequest, HttpRequestError } from './http-request';
import { iamAuthenticationHandler } from './iam-authentication-handler';
import { iamUnauthorizedHandler } from './iam-unauthorized-handler';
import { resolveServiceBaseUrl } from './service-registry';

export interface HrmEmServerError {
  code: string;
  message: string;
}

export type HrmEmHttpRequestError = HttpRequestError<HrmEmServerError>;

const hrmemHttpRequest = new HttpRequest<HrmEmServerError>({
  baseUrl: resolveServiceBaseUrl('hrmem'),
  headers: {
    'Content-Type': 'application/json',
  },
  requestInterceptor: iamAuthenticationHandler,
  responseInterceptor: iamUnauthorizedHandler,
});

export default hrmemHttpRequest;

// Mock
if (
  process.env.NEXT_PUBLIC_MOCK_API === 'true' &&
  typeof window === 'undefined'
) {
  import('@/mock/hrmem');
}
