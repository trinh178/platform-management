import { HttpRequest, HttpRequestError } from './http-request';
import { iamAuthenticationHandler } from './iam-authentication-handler';
import { iamUnauthorizedHandler } from './iam-unauthorized-handler';
import { resolveServiceBaseUrl } from './service-registry';

export interface IamServerError {
  code: string;
  message: string;
}

export type IamHttpRequestError = HttpRequestError<IamServerError>;

const iamHttpRequest = new HttpRequest<IamServerError>({
  baseUrl: resolveServiceBaseUrl('iam'),
  headers: {
    'Content-Type': 'application/json',
  },
  requestInterceptor: iamAuthenticationHandler,
  responseInterceptor: iamUnauthorizedHandler,
});

export default iamHttpRequest;

// Mock
if (
  process.env.NEXT_PUBLIC_MOCK_API === 'true' &&
  typeof window === 'undefined'
) {
  import('@/mock/iam');
}
