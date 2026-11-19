import { domainStore } from '@/mock/plm/domain/stores';
import { resourceStore } from '@/mock/plm/resource/stores';
import { serviceStore } from '@/mock/plm/service/stores';

export const PERMISSION_CODE_PATTERN =
  /^[A-Z][A-Z0-9_]*(\.[A-Z][A-Z0-9_]*){3}$/;

export type PermissionCatalogItemMock = {
  id: string;
  code: string;
  serviceCode: string;
  domainCode: string;
  resourceCode: string;
  action: string;
};

export type PermissionImportErrorMock = {
  line: number;
  code: string;
  reason: 'INVALID_FORMAT' | 'DUPLICATE_IN_FILE';
};

// Dựng danh mục quyền phẳng từ cây Service → Domain → Resource → Action.
export function buildPermissionCatalog(serviceCode?: string) {
  const items: PermissionCatalogItemMock[] = [];

  for (const service of serviceStore) {
    if (serviceCode && service.serviceCode !== serviceCode) continue;
    for (const domain of domainStore) {
      if (domain.serviceId !== service.id) continue;
      for (const resource of resourceStore) {
        if (resource.domainId !== domain.id) continue;
        for (const action of resource.actions) {
          items.push({
            id: action.id,
            code: [
              service.serviceCode,
              domain.domainCode,
              resource.resourceCode,
              action.action,
            ].join('.'),
            serviceCode: service.serviceCode,
            domainCode: domain.domainCode,
            resourceCode: resource.resourceCode,
            action: action.action,
          });
        }
      }
    }
  }

  return items.sort((a, b) => a.code.localeCompare(b.code));
}

// Mỗi dòng một mã; bỏ qua dòng trống và khoảng trắng đầu/cuối dòng.
export function parseCodeList(text: string) {
  const lines: { line: number; code: string }[] = [];
  text
    .replace(/^﻿/, '')
    .split(/\r\n|\r|\n/)
    .forEach((raw, index) => {
      const code = raw.trim();
      if (code) lines.push({ line: index + 1, code });
    });
  return lines;
}

export function validateCodeList(lines: { line: number; code: string }[]) {
  const errors: PermissionImportErrorMock[] = [];
  const seen = new Set<string>();
  for (const { line, code } of lines) {
    if (!PERMISSION_CODE_PATTERN.test(code))
      errors.push({ line, code, reason: 'INVALID_FORMAT' });
    else if (seen.has(code))
      errors.push({ line, code, reason: 'DUPLICATE_IN_FILE' });
    seen.add(code);
  }
  return errors;
}
