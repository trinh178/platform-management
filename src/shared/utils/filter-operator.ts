import { FilterCondition, FilterOperator } from '@/shared/types/pagination';

/**
 * Điều kiện đủ để match (operator + value/values), không cần `field`.
 * Dùng chung cho mock (server-side simulation) và DataTableStatic (client-side filtering)
 * để semantics của operator luôn nhất quán một nơi.
 */
export type FilterMatch = Pick<
  FilterCondition,
  'operator' | 'value' | 'values'
>;

function toComparable(v: unknown): number | string {
  if (v == null) return '';
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  const s = String(v);
  const trimmed = s.trim();
  if (trimmed !== '') {
    const n = Number(trimmed);
    if (!Number.isNaN(n)) return n;
    const d = Date.parse(trimmed);
    if (!Number.isNaN(d)) return d;
  }
  return s.toLowerCase();
}

/** So sánh `actual` với một giá trị string từ filter (number/date/string aware). */
function compare(actual: unknown, expected: string): number {
  const a = toComparable(actual);
  const b = toComparable(expected);
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

function looseEqual(actual: unknown, expected: string): boolean {
  if (actual instanceof Date)
    return toComparable(actual) === toComparable(expected);
  return String(actual ?? '') === expected;
}

function asText(actual: unknown): string {
  return String(actual ?? '').toLowerCase();
}

/**
 * Áp dụng một `FilterCondition` lên giá trị thực tế của field.
 * Trả về `true` khi item thỏa điều kiện. Khi thiếu value/values cần thiết → coi như không lọc (true).
 */
export function matchFilterOperator(
  actual: unknown,
  match: FilterMatch,
): boolean {
  const operator: FilterOperator = match.operator ?? 'Equal';
  const { value, values } = match;

  switch (operator) {
    case 'IsNull':
      return actual == null || actual === '';
    case 'IsNotNull':
      return actual != null && actual !== '';
    case 'In':
      return values?.length ? values.some(v => looseEqual(actual, v)) : true;
    case 'NotIn':
      return values?.length ? !values.some(v => looseEqual(actual, v)) : true;
    case 'Between': {
      const [from, to] = values ?? [];
      const okFrom =
        from == null || from === '' ? true : compare(actual, from) >= 0;
      const okTo = to == null || to === '' ? true : compare(actual, to) <= 0;
      return okFrom && okTo;
    }
    default:
      break;
  }

  if (value == null || value === '') return true;

  switch (operator) {
    case 'Equal':
      return looseEqual(actual, value);
    case 'NotEqual':
      return !looseEqual(actual, value);
    case 'Contains':
      return asText(actual).includes(value.toLowerCase());
    case 'StartsWith':
      return asText(actual).startsWith(value.toLowerCase());
    case 'EndsWith':
      return asText(actual).endsWith(value.toLowerCase());
    case 'GreaterThan':
      return compare(actual, value) > 0;
    case 'GreaterThanOrEqual':
      return compare(actual, value) >= 0;
    case 'LessThan':
      return compare(actual, value) < 0;
    case 'LessThanOrEqual':
      return compare(actual, value) <= 0;
    default:
      return true;
  }
}
