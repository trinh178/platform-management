import { RESOURCE_ACTION_PATTERN } from '../constants/resource';
import type { PermissionImportErrorReason } from '../types/permission-catalog';

// <ServiceCode>.<DomainCode>.<ResourceCode>.<Action>, mỗi đoạn UPPER_SNAKE_CASE.
export const PERMISSION_CODE_PATTERN =
  /^[A-Z][A-Z0-9_]*(\.[A-Z][A-Z0-9_]*){3}$/;

export function buildPermissionCode(parts: {
  serviceCode?: string;
  domainCode?: string;
  resourceCode?: string;
  action: string;
}) {
  return [parts.serviceCode, parts.domainCode, parts.resourceCode, parts.action]
    .map(part => part || '?')
    .join('.');
}

// Chuẩn hoá danh sách action: trim, uppercase, bỏ rỗng, bỏ trùng, sắp xếp.
export function normalizeResourceActions(actions: unknown): string[] {
  if (!Array.isArray(actions)) return [];
  const set = new Set(
    actions
      .filter((item): item is string => typeof item === 'string')
      .map(item => item.trim().toUpperCase())
      .filter(Boolean),
  );
  return Array.from(set).sort();
}

export function isValidResourceAction(action: string) {
  return RESOURCE_ACTION_PATTERN.test(action);
}

/* ─── Code list TXT (import/export) ─────────────────────────────────────── */

export const PERMISSION_CODE_LIST_TEMPLATE = [
  'FTM.DRIVER.DRIVER.VIEW',
  'FTM.DRIVER.DRIVER.CREATE',
  'FTM.FUEL_ENTRY.FUEL_LOG.UPDATE',
].join('\n');

export type PermissionCodeLineStatus =
  'VALID' | 'EXISTS' | PermissionImportErrorReason;

export type PermissionCodeLine = {
  line: number; // số dòng trong file (1-based)
  code: string;
  status: PermissionCodeLineStatus;
};

// Mỗi dòng một mã; bỏ qua dòng trống và khoảng trắng đầu/cuối dòng.
export function parsePermissionCodeList(
  text: string,
  existingCodes: Iterable<string> = [],
): PermissionCodeLine[] {
  const existing = new Set(existingCodes);
  const seen = new Set<string>();
  const result: PermissionCodeLine[] = [];

  text
    .replace(/^﻿/, '')
    .split(/\r\n|\r|\n/)
    .forEach((raw, index) => {
      const code = raw.trim();
      if (!code) return;

      let status: PermissionCodeLineStatus = 'VALID';
      if (!PERMISSION_CODE_PATTERN.test(code)) status = 'INVALID_FORMAT';
      else if (seen.has(code)) status = 'DUPLICATE_IN_FILE';
      else if (existing.has(code)) status = 'EXISTS';

      seen.add(code);
      result.push({ line: index + 1, code, status });
    });

  return result;
}

export function isPermissionCodeLineError(line: PermissionCodeLine) {
  return (
    line.status === 'INVALID_FORMAT' || line.status === 'DUPLICATE_IN_FILE'
  );
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
