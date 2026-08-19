import React from 'react';
import { ConstantBase } from '@/core/constants';
import { defaultListRequest } from '@/shared/constants/pagination';
import {
  ListRequest,
  ListResponse,
  SortCondition,
} from '@/shared/types/pagination';
import { matchFilterOperator } from '@/shared/utils';

export type DemoEmployeeJobLevel = 'Intern' | 'Junior' | 'Senior';
export type DemoEmployeeStatus = 'Active' | 'Inactive' | 'OnLeave';

export interface DemoEmployee {
  id: string;
  code: string;
  fullName: string;
  jobLevel: DemoEmployeeJobLevel;
  status: DemoEmployeeStatus;
  hireDate: Date;
  isActive: boolean;
  manager: { fullName: string };
}

export const CONST_DEMO_EMPLOYEE_JOB_LEVEL: ConstantBase<DemoEmployeeJobLevel>[] =
  [
    { value: 'Intern', label: 'datatableGuide.field.jobLevelIntern' },
    { value: 'Junior', label: 'datatableGuide.field.jobLevelJunior' },
    { value: 'Senior', label: 'datatableGuide.field.jobLevelSenior' },
  ];

export const CONST_DEMO_EMPLOYEE_STATUS: ConstantBase<DemoEmployeeStatus>[] = [
  { value: 'Active', label: 'datatableGuide.field.statusActive' },
  { value: 'Inactive', label: 'datatableGuide.field.statusInactive' },
  { value: 'OnLeave', label: 'datatableGuide.field.statusOnLeave' },
];

const FULL_NAMES = [
  'Nguyễn Văn An',
  'Trần Thị Bình',
  'Phạm Quang Chính',
  'Lê Hoài Dương',
  'Bùi Minh Khoa',
  'Đặng Văn Hùng',
  'Vũ Thị Lan',
  'Hoàng Đức Mạnh',
  'Đỗ Thị Mai',
  'Ngô Văn Nam',
  'Lý Thị Oanh',
  'Dương Minh Phúc',
];

const MANAGERS = [
  'Nguyễn Thị Hoa',
  'Trần Văn Dũng',
  'Phạm Thị Thu',
  'Lê Văn Tâm',
];

function pad(num: number, len: number) {
  return String(num).padStart(len, '0');
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const MOCK_EMPLOYEES: DemoEmployee[] = Array.from({ length: 47 }).map(
  (_, i) => {
    const r = pseudoRandom(i + 1);
    const r2 = pseudoRandom(i + 100);
    return {
      id: `employee-${i + 1}`,
      code: `EMP-${pad(i + 1, 4)}`,
      fullName: FULL_NAMES[i % FULL_NAMES.length],
      jobLevel: (['Intern', 'Junior', 'Senior'] as const)[Math.floor(r * 3)],
      status: (['Active', 'Inactive', 'OnLeave'] as const)[Math.floor(r2 * 3)],
      hireDate: new Date(2018 + (i % 7), i % 12, ((i * 7) % 28) + 1),
      isActive: r > 0.3,
      manager: { fullName: MANAGERS[i % MANAGERS.length] },
    };
  },
);

function matchSearch(item: DemoEmployee, term: string): boolean {
  const t = term.toLowerCase();
  return (
    item.code.toLowerCase().includes(t) ||
    item.fullName.toLowerCase().includes(t) ||
    item.manager.fullName.toLowerCase().includes(t)
  );
}

function getNested(obj: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (acc, key) =>
        acc != null && typeof acc === 'object'
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      obj,
    );
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

function applySort(
  items: DemoEmployee[],
  sorts: SortCondition[] | undefined,
): DemoEmployee[] {
  if (!sorts?.length) return items;
  return [...items].sort((a, b) => {
    for (const { field, direction } of sorts) {
      const cmp = compareValues(getNested(a, field), getNested(b, field));
      // Contract: direction mặc định là 'Descending' khi bỏ trống.
      if (cmp !== 0) return direction !== 'Ascending' ? -cmp : cmp;
    }
    return 0;
  });
}

function applyFilters(items: DemoEmployee[], req: ListRequest): DemoEmployee[] {
  let result = items;
  if (req.searchTerm) {
    result = result.filter(i => matchSearch(i, req.searchTerm!));
  }
  for (const f of req.filters ?? []) {
    result = result.filter(i => matchFilterOperator(getNested(i, f.field), f));
  }
  return applySort(result, req.sorts);
}

export function useMockEmployeeList(listRequest: ListRequest) {
  const [data, setData] = React.useState<
    ListResponse<DemoEmployee> | undefined
  >(undefined);
  const [isFetching, setIsFetching] = React.useState(false);

  React.useEffect(() => {
    React.startTransition(() => setIsFetching(true));
    const handle = window.setTimeout(() => {
      const pageIndex = listRequest.pageIndex ?? 0;
      const pageSize = listRequest.pageSize ?? 10;
      const all = applyFilters(MOCK_EMPLOYEES, listRequest);
      const start = pageIndex * pageSize;
      const items = all.slice(start, start + pageSize);
      setData({
        items,
        totalItems: all.length,
        totalPages: Math.ceil(all.length / pageSize),
        pageIndex,
        pageSize,
        searchTerm: listRequest.searchTerm,
        filters: listRequest.filters,
        sorts: listRequest.sorts,
      });
      setIsFetching(false);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [listRequest]);

  return { data, isFetching };
}

export const DEFAULT_LIST_REQUEST: ListRequest = {
  ...defaultListRequest,
  sorts: [{ field: 'hireDate', direction: 'Descending' }],
};
