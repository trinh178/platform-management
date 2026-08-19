/* eslint-disable no-restricted-globals */

export type AppfetchMockHandler = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Response | Promise<Response>;

export interface AppfetchMockRoute {
  method?: string;
  /** String = exact match, RegExp = pattern match */
  url: string | RegExp;
  handler: AppfetchMockHandler;
}

/**
 * appfetch — thin wrapper quanh fetch native.
 *
 * API hoàn toàn giống fetch() bình thường, chỉ thêm mock:
 *   const af = new appfetch();
 *   af.mock([{ method: 'GET', url: /\/users/, handler: () => appfetch.json({ id: 1 }) }]);
 *   const res = await af.fetch('/api/users');
 *
 * Để tắt mock:
 *   af.mock(null);
 */
export class appfetch {
  #routes: AppfetchMockRoute[] | null = null;

  /**
   * Bật mock với danh sách routes, hoặc tắt mock bằng null.
   */
  mock(routes: AppfetchMockRoute[] | null) {
    this.#routes = routes;
  }

  /**
   * Thêm mock route.
   */
  addMockRoute(route: AppfetchMockRoute) {
    if (this.#routes) this.#routes?.push?.(route);
    else this.#routes = [route];
  }

  /**
   * Gọi fetch — API giống hệt fetch() native.
   * Nếu mock đang bật và có route khớp → trả mock response.
   * Nếu không khớp route nào → fall through xuống fetch thật.
   */
  async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (this.#routes) {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      const method = (init?.method ?? 'GET').toUpperCase();

      const matched = this.#routes.find(route => {
        const methodMatch =
          !route.method || route.method.toUpperCase() === method;
        const urlMatch =
          typeof route.url === 'string'
            ? url === route.url
            : route.url.test(url);
        return methodMatch && urlMatch;
      });

      if (matched) return matched.handler(input, init);
    }

    return fetch(input, init);
  }

  // ─── Helpers tạo mock Response nhanh ─────────────────────────────────────

  static json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  static text(body: string, status = 200): Response {
    return new Response(body, { status });
  }

  static empty(status = 204): Response {
    return new Response(null, { status });
  }

  static error(data: unknown, status = 400): Response {
    return appfetch.json(data, status);
  }
}

/**
 * Singleton dùng chung toàn app — HttpRequest và proxy đều import cái này.
 * Khi cần mock: import appfetchInstance rồi gọi appfetchInstance.mock([...])
 */
export const appfetchInstance = new appfetch();
