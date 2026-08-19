import { TranslationsKey } from '@/core/i18n/types';
import { FilterOperator } from '@/shared/types/pagination';

/**
 * Giá trị filter lưu trong TanStack `columnFilters` cho mỗi cột.
 * Encode đủ operator + value/values để map thẳng sang `FilterCondition` của contract.
 */
export type DataTableFilterValue = {
  operator: FilterOperator;
  value?: string;
  values?: string[];
};

export type FilterFieldOption = {
  label: TranslationsKey;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
};

/**
 * Option đã sẵn sàng hiển thị (label là string) — dùng cho filter `select`
 * lấy từ API và cho options đã được dispatcher resolve.
 */
export type FilterOption = {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
};

/**
 * Map options theo field id, thường lấy từ 1 API multi-column rồi truyền vào
 * bảng qua prop `filterOptions`. Áp dụng cho các field `type: 'select'`.
 */
export type DataTableFilterOptions = Record<string, FilterOption[]>;

type BaseFilterField = {
  /** Phải trùng tên field public mà API cho phép filter. */
  id: string;
  title: TranslationsKey;
};

/** Filter enum tĩnh (options khai báo sẵn, label i18n). multi → `In`, single → `Equal`. */
export type EnumFilterField = BaseFilterField & {
  type?: 'enum';
  options: FilterFieldOption[];
  /** true (mặc định) → `In` + values; false → `Equal` + value (chọn 1). */
  multiple?: boolean;
};

/**
 * Filter chọn từ danh sách động — options lấy từ API qua `filterOptions[id]`
 * (label là string). Cùng UI/operator với `enum`, chỉ khác nguồn options.
 */
export type SelectFilterField = BaseFilterField & {
  type: 'select';
  multiple?: boolean;
};

/** Filter text — operator picker (Contains mặc định). */
export type TextFilterField = BaseFilterField & {
  type: 'text';
  operators?: FilterOperator[];
};

/** Filter số — operator picker (Equal mặc định, hỗ trợ Between). */
export type NumberFilterField = BaseFilterField & {
  type: 'number';
  operators?: FilterOperator[];
};

/** Filter khoảng ngày → `Between` (hoặc một đầu mở → Gte/Lte). */
export type DateRangeFilterField = BaseFilterField & {
  type: 'dateRange';
};

/** Filter boolean → `Equal` true/false. */
export type BooleanFilterField = BaseFilterField & {
  type: 'boolean';
  trueLabel?: TranslationsKey;
  falseLabel?: TranslationsKey;
};

export type DataTableFilterField =
  | EnumFilterField
  | SelectFilterField
  | TextFilterField
  | NumberFilterField
  | DateRangeFilterField
  | BooleanFilterField;

export const TEXT_OPERATORS: FilterOperator[] = [
  'Contains',
  'Equal',
  'NotEqual',
  'StartsWith',
  'EndsWith',
  'IsNull',
  'IsNotNull',
];

export const NUMBER_OPERATORS: FilterOperator[] = [
  'Equal',
  'NotEqual',
  'GreaterThan',
  'GreaterThanOrEqual',
  'LessThan',
  'LessThanOrEqual',
  'Between',
  'IsNull',
  'IsNotNull',
];

export const OPERATOR_LABEL: Record<FilterOperator, TranslationsKey> = {
  Equal: 'common.filter.op.equal',
  NotEqual: 'common.filter.op.notEqual',
  GreaterThan: 'common.filter.op.greaterThan',
  GreaterThanOrEqual: 'common.filter.op.greaterThanOrEqual',
  LessThan: 'common.filter.op.lessThan',
  LessThanOrEqual: 'common.filter.op.lessThanOrEqual',
  Contains: 'common.filter.op.contains',
  StartsWith: 'common.filter.op.startsWith',
  EndsWith: 'common.filter.op.endsWith',
  In: 'common.filter.op.in',
  NotIn: 'common.filter.op.notIn',
  Between: 'common.filter.op.between',
  IsNull: 'common.filter.op.isNull',
  IsNotNull: 'common.filter.op.isNotNull',
};

/** Operator không cần value/values (chỉ kiểm tra null). */
export function operatorTakesNoInput(operator: FilterOperator): boolean {
  return operator === 'IsNull' || operator === 'IsNotNull';
}

/** Operator cần hai giá trị (Between). */
export function operatorTakesRange(operator: FilterOperator): boolean {
  return operator === 'Between';
}
