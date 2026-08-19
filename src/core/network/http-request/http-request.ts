import { HttpResponse } from './http-response';

export type Method =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface HttpRequestOptionProps<RPD = any> extends Omit<
  RequestInit,
  'method' | 'body' | 'headers'
> {
  baseUrl?: string;
  url?: string;
  method?: Method;
  params?: unknown;
  data?: unknown;
  timeout?: number;
  responseType?: 'json' | 'text';
  headers?: Record<string, string>;
  requestInterceptor?: (
    config: HttpRequestOptionProps,
  ) => Promise<HttpRequestOptionProps>;
  responseInterceptor?: (
    response: Response & { data?: unknown },
  ) => Promise<Response & { data?: unknown }>;
  transformSuccessResponse?: (response: RPD) => RPD;
  getErrorResponseMessage?: (response: HttpResponse<RPD, unknown>) => string;
}

/**
 * @RQP Request Params Props
 * @RQB Request Body Props
 */
export interface HttpRequestData<RQP, RQB> {
  params?: RQP;
  body?: RQB;
}

export const defaultOption: HttpRequestOptionProps<unknown> = {
  timeout: 30000,
  responseType: 'json',
};
