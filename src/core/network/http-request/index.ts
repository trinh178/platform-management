/* eslint-disable @typescript-eslint/no-unused-vars */
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import _isString from 'lodash/isString';
import qs from 'qs';
import { AppfetchMockRoute, appfetchInstance } from '../appfetch';
import { HttpRequestError } from './error';
import {
  HttpRequestData,
  HttpRequestOptionProps,
  Method,
  defaultOption,
} from './http-request';
import { ClientErrorProps, HttpResponse } from './http-response';
import { joinURL } from '@/shared/utils';

/**
 * @SE Server Error Response Props
 */
export class HttpRequest<SE> {
  #options: HttpRequestOptionProps<unknown>;

  constructor(option?: HttpRequestOptionProps<unknown>) {
    this.#options = {
      ...defaultOption,
      ...option,
      headers: {
        ...defaultOption.headers,
        ...option?.headers,
      },
    };
  }

  getOptions() {
    return this.#options;
  }

  /**
   * Build URL + headers + body rồi delegate xuống appfetchInstance.
   */
  async #fetch(
    config: HttpRequestOptionProps<unknown>,
  ): Promise<Response & { data?: unknown }> {
    const options = { ...this.#options, ...config };

    // Request interceptor
    const requestInterceptor =
      config.requestInterceptor ?? options.requestInterceptor;
    if (requestInterceptor) {
      const intercepted = await requestInterceptor(options);
      Object.assign(options, intercepted);
    }

    // Build URL
    let fullUrl = joinURL(options.baseUrl, options.url);
    const queryString = qs.stringify(options.params, { allowDots: true });
    if (!_isEmpty(queryString)) {
      fullUrl += `?${queryString}`;
    }

    // Build headers & body
    const headers = { ...options.headers } as Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any =
      options.data !== undefined ? JSON.stringify(options.data) : undefined;
    if (options.data instanceof FormData) {
      delete headers['Content-Type'];
      body = options.data;
    }

    // AbortController for timeout
    const controller = new AbortController();
    const timeoutId = options.timeout
      ? setTimeout(() => controller.abort(), options.timeout)
      : undefined;

    // Strip HttpRequest-specific keys khỏi RequestInit
    const {
      baseUrl: _b,
      url: _u,
      params: _p,
      data: _d,
      timeout: _t,
      responseType: _rt,
      transformSuccessResponse: _tr,
      getErrorResponseMessage: _ge,
      requestInterceptor: _rqi,
      responseInterceptor: _ri,
      headers: _h,
      method: _m,
      ...init
    } = options;

    let response: Response & { data?: unknown };
    try {
      response = await appfetchInstance.fetch(fullUrl, {
        ...init,
        method: options.method,
        headers,
        body,
        signal: controller.signal,
      });
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    }

    // Parse response body
    switch (options.responseType) {
      case 'json':
        if (response.status === 204) {
          (response as Response & { data?: unknown }).data = null;
        } else {
          try {
            (response as Response & { data?: unknown }).data =
              await response.json();
          } catch (e) {
            console.error(e);
            (response as Response & { data?: unknown }).data = response;
          }
        }
        break;
      default:
        (response as Response & { data?: unknown }).data = response;
    }

    // Response interceptor
    const interceptor =
      config.responseInterceptor ?? options.responseInterceptor;
    if (interceptor) {
      response = (await interceptor(
        response as Response & { data?: unknown },
      )) as Response;
    }

    if (!response.ok) {
      throw { isHttpFetchError: true, response };
    }

    return response as Response & { data?: unknown };
  }

  async request<RPD, RQP = unknown, RQB = unknown>(
    options: HttpRequestOptionProps<RPD>,
    url?: string,
    reqData?: HttpRequestData<RQP, RQB>,
  ): Promise<RPD>;
  async request<RPD, RQP = unknown, RQB = unknown>(
    method: Method,
    url: string,
    reqData?: HttpRequestData<RQP, RQB>,
  ): Promise<RPD>;
  async request<RPD, RQP = unknown, RQB = unknown>(
    methodOrOptions: unknown,
    url?: string,
    reqData?: HttpRequestData<RQP, RQB>,
  ) {
    const response: HttpResponse<RPD, SE> = { status: 'client_error' };
    let config: HttpRequestOptionProps<RPD>;
    let transform = this.#options.transformSuccessResponse as
      | ((r: RPD) => RPD)
      | undefined;
    let getErrMsg = this.#options.getErrorResponseMessage as
      | ((response: HttpResponse<RPD, unknown>) => string)
      | undefined;

    try {
      if (typeof methodOrOptions === 'string') {
        config = {
          ...(this.#options as HttpRequestOptionProps<RPD>),
          url: encodeURI(url!),
          method: methodOrOptions as Method,
          params: reqData?.params,
          data: reqData?.body,
        };
      } else {
        config = methodOrOptions as HttpRequestOptionProps<RPD>;
        transform =
          (config.transformSuccessResponse as ((r: RPD) => RPD) | undefined) ??
          transform;
        getErrMsg = config.getErrorResponseMessage ?? getErrMsg;
      }

      const success = await this.#fetch(
        config as HttpRequestOptionProps<unknown>,
      );
      response.status = 'success';
      response.httpStatusCode = success.status;
      response.httpStatusMessage = success.statusText;
      response.data = success.data as RPD;
      return transform ? transform(response.data) : response.data;
    } catch (error) {
      response.status = 'client_error';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      if (err?.isHttpFetchError && err.response) {
        const res: Response & { data?: unknown } = err.response;
        response.status = 'server_error';
        response.httpStatusCode = res.status;
        response.httpStatusMessage = res.statusText;
        response.error = res.data as SE;
      } else if (err?.name === 'AbortError') {
        response.error = {
          code: 'TIMEOUT',
          message: 'Request timed out',
        } as ClientErrorProps;
      } else {
        response.error = {
          code: _get(error, 'code'),
          message: _isString(error)
            ? error
            : _get(error, 'message', 'request catch error'),
        } as ClientErrorProps;
      }
    }

    throw new HttpRequestError(response, getErrMsg?.(response));
  }

  setHeaders(headers: Record<string, string>) {
    this.#options.headers = headers;
  }

  addHeader(name: string, value: string) {
    this.#options.headers = { ...this.#options.headers, [name]: value };
  }

  setAuthorizationToken(token: string) {
    this.addHeader('Authorization', token);
  }

  /**
   * Thêm mock route vào appfetchInstance, tự động kết hợp url với baseUrl của instance.
   *
   * @example
   * // iamHttpRequest có baseUrl = 'https://api.example.com/iam/'
   * iamHttpRequest.addMockRoute({
   *   method: 'GET',
   *   url: 'users',           // → match 'https://api.example.com/iam/users'
   *   handler: () => appfetch.json([{ id: 1 }]),
   * });
   * iamHttpRequest.addMockRoute({
   *   method: 'POST',
   *   url: /users\/\d+/,     // → match regex trên full URL
   *   handler: () => appfetch.json({ updated: true }),
   * });
   */
  addMockRoute(route: AppfetchMockRoute) {
    const baseUrl = this.#options.baseUrl ?? '';

    let combinedUrl: string | RegExp;
    if (typeof route.url === 'string') {
      // String: join baseUrl + route.url để so sánh exact
      combinedUrl = joinURL(baseUrl, route.url);
    } else {
      // RegExp: tạo wrapper test trên full URL (baseUrl + path)
      // Giữ nguyên regex gốc để match trên toàn bộ URL đã build
      const originalRegex = route.url;
      combinedUrl = {
        test: (url: string) => {
          // Chỉ test nếu URL bắt đầu bằng baseUrl, tránh nhầm với service khác
          if (baseUrl && !url.startsWith(baseUrl)) return false;
          return originalRegex.test(url);
        },
      } as RegExp;
    }

    appfetchInstance.addMockRoute({ ...route, url: combinedUrl });
  }
}

export { HttpRequestError };
export type { HttpRequestData, HttpRequestOptionProps, HttpResponse };
