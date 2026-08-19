import moment from 'moment';
import { defaultFormatDate } from '../constants/date';

export * from './crud';
export * from './audit';
export * from './id';
export * from './tree';
export * from './filter-operator';
export * from './nullish';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMessage(data: any, def = 'Unknown message') {
  if (data instanceof Error && process.env.NODE_ENV === 'development') {
    console.error(data);
  }
  switch (typeof data) {
    case 'string':
    case 'number':
    case 'boolean':
      return data.toString();

    case 'object': {
      if (!data) return def;
      if (data?.message) return getMessage(data.message);
      const values = Object.values(data);
      if (values.length === 0) return def;
      return values
        .filter(d => typeof d === 'string' || typeof d === 'number')
        .join(', ');
    }

    case 'symbol':
      return data.description;

    default:
      return def;
  }
}

export function joinURL(base: string = '', path: string = '') {
  return new URL(
    path.replace(/^\//, ''),
    base.endsWith('/') ? base : base + '/',
  ).toString();
}

export function joinPath(a: string = '', b: string = '') {
  return `${a.replace(/\/+$/, '')}/${b.replace(/^\/+/, '')}`;
}

export function formatDate(
  date: Date | string | undefined,
  format: string = defaultFormatDate,
) {
  if (!date) return '-';
  return moment(date).format(format);
}

export function renderValue(value: unknown): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? '-' : trimmed;
  }

  if (value === null || value === undefined) {
    return '-';
  }

  if (value instanceof Date) {
    return moment(value).format(defaultFormatDate);
  }

  if (typeof value === 'number') {
    if (isNaN(value)) return '-';
    return value.toLocaleString();
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '-';
    return value.map(v => renderValue(v)).join(', ');
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '-';
    }
  }

  return String(value);
}

type NameLike = { firstName?: string; lastName?: string };
export function getFullName(value: NameLike): string;
export function getFullName(firstName: string, lastName?: string): string;
export function getFullName(
  firstNameOrEntity: string | NameLike,
  lastName = '',
): string {
  const { firstName, lastName: ln } =
    typeof firstNameOrEntity === 'string'
      ? { firstName: firstNameOrEntity, lastName }
      : firstNameOrEntity;

  const fullName = `${ln ?? ''} ${firstName ?? ''}`.trim();
  return fullName || '-';
}
