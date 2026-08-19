/**
 * Các utility dùng chung cho mock handler.
 * Import từ đây thay vì định nghĩa lại trong từng file mock.
 */

import { FilterOperator, SortDirection } from '@/shared/types/pagination';
import { matchFilterOperator } from '@/shared/utils';

// Re-export để mock route dùng chung một nguồn helper.
export { matchFilterOperator };

/**
 * Đọc body của request và parse thành object.
 * HttpRequest truyền body dưới dạng JSON.stringify() → string,
 * nhưng hàm này handle toàn bộ các dạng BodyInit có thể gặp.
 */
export async function parseBody(
  _input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Record<string, unknown>> {
  try {
    const raw = init?.body;
    if (!raw) return {};
    // Trường hợp phổ biến nhất: HttpRequest truyền JSON.stringify() → string
    if (typeof raw === 'string') return JSON.parse(raw);
    // ArrayBuffer / Uint8Array
    if (raw instanceof ArrayBuffer)
      return JSON.parse(new TextDecoder().decode(raw));
    if (raw instanceof Uint8Array)
      return JSON.parse(new TextDecoder().decode(raw));
    // ReadableStream (Next.js server environment)
    if (raw instanceof ReadableStream) {
      const reader = raw.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      const merged = new Uint8Array(
        chunks.reduce((acc, c) => acc + c.length, 0),
      );
      let offset = 0;
      for (const c of chunks) {
        merged.set(c, offset);
        offset += c.length;
      }
      return JSON.parse(new TextDecoder().decode(merged));
    }
    // Blob
    if (raw instanceof Blob) return JSON.parse(await raw.text());
    return {};
  } catch {
    return {};
  }
}

/**
 * Lấy URL string từ RequestInfo | URL.
 */
export function toUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return (input as Request).url;
}

export type MockListFilter = {
  field: string;
  operator?: FilterOperator;
  value?: string;
  values?: string[];
};
export type MockListSort = { field: string; direction: SortDirection };
export type MockListResponse<TItem> = {
  items: TItem[];
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type BuildMockListResponseOptions<TItem, TResponseItem = TItem> = {
  sp: URLSearchParams;
  items: TItem[];
  search?: (item: TItem, searchTerm: string) => boolean;
  filter?: (item: TItem, filter: MockListFilter) => boolean;
  mapItem?: (item: TItem) => TResponseItem;
  defaultSort?: MockListSort[];
};

export function parseMockListFilters(sp: URLSearchParams): MockListFilter[] {
  const byIndex = new Map<string, MockListFilter>();

  const read = (index: string, key: string) =>
    sp.get(`filters[${index}].${key}`) ?? sp.get(`filters[${index}][${key}]`);

  for (const key of sp.keys()) {
    const match = key.match(/^filters\[(\d+)\]/);
    if (!match) continue;

    const index = match[1];
    if (byIndex.has(index)) continue;

    const field = read(index, 'field');
    if (!field) continue;

    const operator =
      (read(index, 'operator') as FilterOperator | null) ?? 'Equal';
    const value = read(index, 'value') ?? undefined;

    const values: string[] = [];
    for (let j = 0; ; j++) {
      const v =
        sp.get(`filters[${index}].values[${j}]`) ??
        sp.get(`filters[${index}][values][${j}]`);
      if (v == null) break;
      values.push(v);
    }

    byIndex.set(index, {
      field,
      operator,
      value,
      values: values.length ? values : undefined,
    });
  }

  return Array.from(byIndex.values());
}

export function parseMockListSort(sp: URLSearchParams): MockListSort[] {
  const sort: MockListSort[] = [];

  for (const key of sp.keys()) {
    const match = key.match(/^sorts\[(\d+)\](?:\.|\[)field\]?$/);
    if (!match) continue;

    const index = match[1];
    const field = sp.get(key);
    const direction =
      sp.get(`sorts[${index}].direction`) ??
      sp.get(`sorts[${index}][direction]`);

    // Contract: direction mặc định là 'Descending' khi bỏ trống.
    if (field)
      sort.push({
        field,
        direction: direction === 'Ascending' ? 'Ascending' : 'Descending',
      });
  }

  return sort;
}

export function applyMockListSort<T extends Record<string, unknown>>(
  items: T[],
  sort?: MockListSort[],
): T[] {
  if (!sort?.length) return items;

  return items.sort((a, b) => {
    for (const { field, direction } of sort) {
      const asc = direction === 'Ascending';
      const aValue = a[field];
      const bValue = b[field];
      if (aValue == null && bValue == null) continue;
      if (aValue == null) return asc ? -1 : 1;
      if (bValue == null) return asc ? 1 : -1;
      if (aValue > bValue) return asc ? 1 : -1;
      if (aValue < bValue) return asc ? -1 : 1;
    }
    return 0;
  });
}

export function buildMockListResponse<TItem, TResponseItem = TItem>({
  sp,
  items,
  search,
  filter,
  mapItem,
  defaultSort,
}: BuildMockListResponseOptions<
  TItem,
  TResponseItem
>): MockListResponse<TResponseItem> {
  const rawPageIndex = parseInt(sp.get('pageIndex') ?? '1', 10);
  const rawPageSize = parseInt(sp.get('pageSize') ?? '10', 10);
  const pageIndex =
    Number.isFinite(rawPageIndex) && rawPageIndex > 0 ? rawPageIndex : 1;
  const pageSize =
    Number.isFinite(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10;
  const searchTerm = sp.get('searchTerm')?.trim().toLowerCase();
  const filters = parseMockListFilters(sp);
  const sort = parseMockListSort(sp);

  let listItems = items.slice();

  if (searchTerm && search) {
    listItems = listItems.filter(item => search(item, searchTerm));
  }

  if (filters.length > 0) {
    for (const currentFilter of filters) {
      listItems = listItems.filter(item =>
        filter
          ? filter(item, currentFilter)
          : matchFilterOperator(
              (item as Record<string, unknown>)[currentFilter.field],
              currentFilter,
            ),
      );
    }
  }

  applyMockListSort(
    listItems as Record<string, unknown>[],
    sort.length ? sort : defaultSort,
  );

  const start = Math.max(pageIndex - 1, 0) * pageSize;
  const pagedItems = listItems
    .slice(start, start + pageSize)
    .map(item =>
      mapItem ? mapItem(item) : (item as unknown as TResponseItem),
    );

  return {
    items: pagedItems,
    pageIndex,
    pageSize,
    totalItems: listItems.length,
    totalPages: Math.ceil(listItems.length / pageSize),
  };
}

/**
 * Trích xuất ID từ URL theo pattern `/<resource>/<id>`.
 *
 * @param url    - URL string (kết quả của toUrl())
 * @param resource - tên resource segment ngay trước ID, ví dụ 'vehicles', 'drivers'
 * @returns ID string hoặc null nếu không khớp
 *
 * @example
 * extractIdFromUrl('http://localhost/vehicles/abc-001?foo=bar', 'vehicles') // → 'abc-001'
 * extractIdFromUrl('http://localhost/drivers/xyz-999', 'drivers')           // → 'xyz-999'
 */
/**
 * Trích xuất tất cả named params từ URL theo pattern kiểu Express.
 *
 * @param pattern - Route pattern, ví dụ '/drivers/:driverId/salary/:salaryId'
 * @param url     - URL thực tế (kết quả của toUrl())
 * @returns Object chứa các param, hoặc {} nếu không khớp
 *
 * @example
 * extractPathParams('/drivers/:id/salary/:salaryId', '/drivers/abc/salary/s-001')
 * // → { id: 'abc', salaryId: 's-001' }
 */
export function extractPathParams(
  pattern: string,
  url: string,
): Record<string, string> {
  const cleanUrl = url.replace(/\?.*$/, '');
  const patternSegs = pattern.split('/').filter(Boolean);
  const urlSegs = cleanUrl.split('/').filter(Boolean);

  for (
    let offset = 0;
    offset <= urlSegs.length - patternSegs.length;
    offset++
  ) {
    const result: Record<string, string> = {};
    let matched = true;

    for (let i = 0; i < patternSegs.length; i++) {
      if (patternSegs[i].startsWith(':')) {
        result[patternSegs[i].slice(1)] = urlSegs[offset + i];
      } else if (patternSegs[i] !== urlSegs[offset + i]) {
        matched = false;
        break;
      }
    }

    if (matched) return result;
  }

  return {};
}

export function extractIdFromUrl(url: string, resource: string): string | null {
  const match = url
    .replace(/\?.*$/, '')
    .match(new RegExp(`\\/${resource}\\/([a-z0-9-]+)(?:\\/|$)`));
  return match ? match[1] : null;
}

/**
 * Sinh mã tiếp theo dựa trên danh sách trong store.
 * Tìm số lớn nhất trong các mã hiện có rồi cộng thêm 1.
 *
 * @param store   - mảng record có field chứa mã
 * @param codeField - tên field chứa mã (ví dụ: 'vehicleCode', 'code')
 * @param prefix  - tiền tố của mã, ví dụ 'VH-', 'DRV-'
 * @param padLength - số chữ số của phần số, mặc định 4
 * @returns mã mới dạng `<prefix><số đã pad>`, ví dụ 'VH-0004', 'DRV-0003'
 *
 * @example
 * generateCodeFromStore(vehicleStore, 'vehicleCode', 'VH-')   // → 'VH-0004'
 * generateCodeFromStore(driverStore,  'code',        'DRV-')  // → 'DRV-0004'
 */
export function generateCodeFromStore<T extends Record<string, unknown>>(
  store: T[],
  codeField: keyof T,
  prefix: string,
  padLength = 4,
): string {
  const max = store.reduce((acc, item) => {
    const raw = item[codeField];
    if (typeof raw !== 'string') return acc;
    const num = parseInt(raw.replace(prefix, ''), 10);
    return isNaN(num) ? acc : Math.max(acc, num);
  }, 0);
  return `${prefix}${String(max + 1).padStart(padLength, '0')}`;
}
