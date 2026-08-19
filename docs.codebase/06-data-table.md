# 06 — Data Table

> **Quy tắc bắt buộc:** KHÔNG BAO GIỜ dùng HTML `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` trực tiếp. Luôn dùng một trong ba component DataTable bên dưới.

Có 3 component:

| Component         | Import                                  | Dùng khi                                                           |
| ----------------- | --------------------------------------- | ------------------------------------------------------------------ |
| `DataTableServer` | `@/shared/components/data-table/server` | Dữ liệu từ API, pagination/filter/sort server-side                 |
| `DataTableStatic` | `@/shared/components/data-table/static` | Dữ liệu tĩnh (array), xử lý client-side                            |
| `DataTablePlain`  | `@/shared/components/data-table/plain`  | Sub-table trong form/detail view — không toolbar, không pagination |

Column helpers dùng chung: `@/shared/components/data-table/shared/column-utils`

---

## DataTableServer

```tsx
// src/modules/employee/components/employee-data-table/index.tsx
'use client';

import { useState } from 'react';
import { Row } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useEmployeeDelete } from '../../services/employee.mutation';
import { useEmployees } from '../../services/employee.queries';
import type { EmployeePreview } from '../../types/employee';
import EmployeeDeleteConfirmContent from '../employee-delete-confirm-content';
import Actions from './actions';
import columns from './columns';
import filterFields from './filter-fields';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useConfirm } from '@/core/confirmation/confirm-provider';
import { useAppRouter } from '@/core/router/next';
import routePaths from '@/modules/employee/route-paths';
import { DataTableServer } from '@/shared/components/data-table/server';
import { defaultListRequest } from '@/shared/constants/pagination';

export function EmployeeDataTable() {
  const t = useTranslations();
  const router = useAppRouter();
  const confirm = useConfirm();
  const canUpdate = useHasPermissions('HRM_EM.EMPLOYEE.EMPLOYEE.UPDATE');
  const canDelete = useHasPermissions('HRM_EM.EMPLOYEE.EMPLOYEE.DELETE');

  const [listRequest, setListRequest] = useState(defaultListRequest);
  const employees = useEmployees(listRequest, {
    placeholderData: prev => prev, // giữ data cũ khi paging
  });
  const deleteMutation = useEmployeeDelete({
    meta: { notifySuccess: 'common.notify.delete_success' },
  });

  const handleView = (row: Row<EmployeePreview>) =>
    router.push(routePaths.employeesDetails, {
      params: { id: row.original.id, mode: 'READ' },
    });

  const handleEdit = (row: Row<EmployeePreview>) =>
    router.push(routePaths.employeesDetails, {
      params: { id: row.original.id, mode: 'UPDATE' },
    });

  const handleDelete = async (row: Row<EmployeePreview>) => {
    const employee = row.original;
    if (!employee.id || !canDelete) return;
    const confirmed = await confirm({
      title: t('employee.deleteConfirm.title'),
      description: t('employee.deleteConfirm.description'),
      content: <EmployeeDeleteConfirmContent employee={employee} />,
      variant: 'danger',
      confirmText: t('common.control.delete'),
      cancelText: t('common.control.cancel'),
    });
    if (confirmed) deleteMutation.mutate(employee.id);
  };

  return (
    <DataTableServer
      columns={columns}
      isFetching={employees.isFetching}
      error={employees.error}
      listResponse={employees.data}
      onChangeListRequest={setListRequest}
      searchPlaceholder={t('employee.controls.search')}
      filterFields={filterFields}
      enableViewOptions
      actionsRender={() => <Actions />}
      meta={{
        onView: handleView,
        onEdit: canUpdate ? handleEdit : undefined,
        onDelete: canDelete ? handleDelete : undefined,
      }}
    />
  );
}
```

> **Pattern**: dùng `meta` để truyền callbacks (`onView`, `onEdit`, `onDelete`) xuống cell renderer trong `columns.tsx` — không inline trong column definition để columns stay pure và reusable.

### Props DataTableServer

`initialListRequest?: ListRequest` dung de khoi tao pagination/filter/sort state khi `listResponse` chua co du lieu. Dung prop nay khi request dau tien da co sort/filter mac dinh va UI table, vi du icon sort/filter, can hien dung state mac dinh ngay lan render dau.

| Prop                      | Type                            | Mô tả                                                                                        |
| ------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------- |
| `columns`                 | `ColumnDef[]`                   | Định nghĩa cột                                                                               |
| `listResponse`            | `ListResponse<TData>`           | Data + pagination từ API                                                                     |
| `onChangeListRequest`     | `(req: ListRequest) => void`    | Gọi khi page/filter/sort thay đổi                                                            |
| `isFetching`              | `boolean`                       | Hiện skeleton khi loading                                                                    |
| `error`                   | `unknown`                       | Hiện error banner                                                                            |
| `searchPlaceholder`       | `string`                        | Bật global search                                                                            |
| `filterFields`            | `DataTableFilterField[]`        | Bật filter theo cột (enum/select/text/number/dateRange/boolean)                              |
| `filterOptions`           | `DataTableFilterOptions`        | Options động cho field `type:'select'`, keyed theo field id (thường từ 1 API multi-column)   |
| `enableViewOptions`       | `boolean`                       | Nút ẩn/hiện cột                                                                              |
| `actionsRender`           | `(state) => ReactNode`          | Thanh action (nút Create...)                                                                 |
| `onRowClick`              | `(row: TData) => void`          | Click vào row (bỏ qua click trên button/link)                                                |
| `emptyState`              | `ReactNode`                     | Custom UI khi không có data                                                                  |
| `enableMultiRowSelection` | `boolean`                       | Chọn nhiều row (default: false)                                                              |
| `onSelectedRowsChange`    | `(rows: TData[]) => void`       | Callback khi chọn row                                                                        |
| `getRowId`                | `(row, index) => string`        | Custom row ID (default: `row.id`)                                                            |
| `hiddenToolbar`           | `boolean`                       | Ẩn toàn bộ toolbar                                                                           |
| `footerRender`            | `(table, helpers) => ReactNode` | Render footer bên trong `<TableFooter>`, dùng cho tổng cộng/summary theo cột                 |
| `topRowsRender`           | `(table, helpers) => ReactNode` | Render row ở đầu `<TableBody>`, ngay dưới table header; dùng cho summary cần thấy trước data |
| `meta`                    | `TableMeta<TData>`              | Truyền callbacks xuống cell (onEdit, onDelete...)                                            |
| `initialState`            | `InitialTableState`             | State khởi tạo (columnVisibility...)                                                         |

---

### Default sort/filter khi moi vao bang

Khi bang can sort/filter mac dinh ngay request dau tien, tao mot `ListRequest` rieng va dung chung cho `useState` lan `initialListRequest`. Khong chi set state phia component cha; neu khong truyen `initialListRequest`, `DataTableServer` co the goi API dung nhung icon sort/filter chua phan anh state mac dinh trong lan render dau.

```tsx
const DEFAULT_REQUEST: ListRequest = {
  ...defaultListRequest,
  sorts: [{ field: 'createdOnUtc', direction: 'Descending' }],
};

const [listRequest, setListRequest] = useState(DEFAULT_REQUEST);
const records = useRecords(listRequest, {
  placeholderData: prev => prev,
});

<DataTableServer
  columns={columns}
  listResponse={records.data}
  isFetching={records.isFetching}
  onChangeListRequest={setListRequest}
  initialListRequest={DEFAULT_REQUEST}
/>;
```

---

## Footer row cho DataTableServer

Dùng `footerRender` khi API list trả thêm tổng hợp/summary cần hiển thị thẳng trong các cột tương ứng của bảng. Footer nên render `<TableRow>` và `<TableCell>` từ `@/shared/components/ui/table`, map theo `table.getVisibleLeafColumns()` để tự khớp trạng thái ẩn/hiện cột.

```tsx
<DataTableServer
  columns={columns}
  listResponse={records.data}
  isFetching={records.isFetching}
  onChangeListRequest={setListRequest}
  footerRender={(table, helpers) => (
    <TableRow className="bg-muted/50 font-semibold">
      {table.getVisibleLeafColumns().map(column => {
        const pinnedCellProps = helpers.getPinnedCellProps(column, {
          backgroundClassName: 'bg-background',
        });

        return (
          <TableCell
            key={column.id}
            {...pinnedCellProps}
            className={cn(
              column.columnDef.meta?.align === 'right'
                ? 'text-right'
                : undefined,
              pinnedCellProps.className,
            )}
          >
            {column.id === 'amount'
              ? formatCurrency(records.data?.summary?.amount)
              : null}
          </TableCell>
        );
      })}
    </TableRow>
  )}
/>
```

---

## Summary row ngay dưới header

Dùng `topRowsRender` khi summary/tổng hợp cần nằm ngay dưới table header để user thấy trước khi scroll qua nhiều dòng dữ liệu. Row này render ở đầu `<TableBody>`, vì vậy vẫn nằm trong cùng table layout và khớp trạng thái ẩn/hiện cột.

```tsx
<DataTableServer
  columns={columns}
  listResponse={records.data}
  isFetching={records.isFetching}
  onChangeListRequest={setListRequest}
  topRowsRender={(table, helpers) => (
    <TableRow className="border-b border-primary/25 bg-primary/5 font-semibold">
      {table.getVisibleLeafColumns().map(column => {
        const pinnedCellProps = helpers.getPinnedCellProps(column, {
          backgroundClassName: 'bg-primary/5',
          style: {
            backgroundColor:
              'color-mix(in oklch, var(--primary) 5%, var(--background))',
          },
        });

        return (
          <TableCell
            key={column.id}
            {...pinnedCellProps}
            className={cn(
              column.columnDef.meta?.align === 'right'
                ? 'text-right'
                : undefined,
              pinnedCellProps.className,
            )}
          >
            {column.id === 'amount'
              ? formatCurrency(records.data?.summary?.amount)
              : null}
          </TableCell>
        );
      })}
    </TableRow>
  )}
/>
```

Chọn slot theo vị trí mong muốn:

- `topRowsRender`: summary cần nổi bật ngay dưới header.
- `footerRender`: summary/tổng cộng cuối bảng, sau toàn bộ data rows.

Khi table có sticky/pinned columns, dùng `helpers.getPinnedCellProps(column)` cho cell của summary/footer để áp đúng `position: sticky`, offset và shadow theo column đang hiển thị.

Neu row summary/footer dung background trong suot nhu `bg-primary/5` hoac `bg-muted/50`, truyen them `style.backgroundColor` opaque qua `helpers.getPinnedCellProps(...)` cho pinned cell. Viec nay giu cell pin khong bi lo text cua cac cot khong pin khi scroll ngang.

---

## DataTableStatic

```tsx
import { DataTableStatic } from '@/shared/components/data-table/static';

// Tối giản
<DataTableStatic columns={columns} data={items} />

// Đầy đủ — search/filter/sort/pagination client-side
<DataTableStatic
  columns={columns}
  data={items}
  searchPlaceholder={t('employee.controls.search')}
  filterFields={filterFields}
  enablePagination
  enableViewOptions
  actionsRender={() => <CreateButton />}
  onRowClick={row => openDetail(row)}
/>
```

### Props DataTableStatic

| Prop                | Type                     | Mô tả                                                           |
| ------------------- | ------------------------ | --------------------------------------------------------------- |
| `data`              | `TData[]`                | Array data                                                      |
| `columns`           | `ColumnDef[]`            | Định nghĩa cột                                                  |
| `isFetching`        | `boolean`                | Hiện skeleton                                                   |
| `searchPlaceholder` | `string`                 | Bật global search                                               |
| `filterFields`      | `DataTableFilterField[]` | Bật filter theo cột (enum/select/text/number/dateRange/boolean) |
| `filterOptions`     | `DataTableFilterOptions` | Options động cho field `type:'select'` (keyed theo field id)    |
| `enablePagination`  | `boolean`                | Bật phân trang                                                  |
| `enableViewOptions` | `boolean`                | Nút ẩn/hiện cột                                                 |
| `actionsRender`     | `(state) => ReactNode`   | Thanh action                                                    |
| `onRowClick`        | `(row: TData) => void`   | Click vào row                                                   |
| `emptyState`        | `ReactNode`              | Custom UI khi không có data                                     |
| `hiddenToolbar`     | `boolean`                | Ẩn toàn bộ toolbar                                              |

---

## Column Definitions

```tsx
// src/modules/employee/components/employee-data-table/columns.tsx
import type { CellContext } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { EmployeePreview } from '../../types/employee';
import { constGet } from '@/core/constants';
import { gT } from '@/core/i18n';
import { TranslationsKey } from '@/core/i18n/types';
import { AppLink } from '@/core/router/next';
import { CONST_GENDER } from '@/modules/employee/constants/employee';
import routePaths from '@/modules/employee/route-paths';
import {
  createActionsColumn,
  createDateColumn,
  createRowNumberColumn,
  getColumnHelper,
} from '@/shared/components/data-table/shared/column-utils';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import { EmptyAvatar } from '@/shared/components/ui/empty-avatar';

const columnHelper = getColumnHelper<EmployeePreview>();

const columns = [
  createRowNumberColumn<EmployeePreview>(), // số thứ tự, sticky left

  columnHelper.accessor('employeeCode', {
    header: 'employee.fields.employeeCode' satisfies TranslationsKey,
  }),

  columnHelper.accessor('fullName', {
    header: 'employee.fields.fullName' satisfies TranslationsKey,
    cell: FullNameCell, // ← custom cell: avatar + clickable link
  }),

  // Constant cell — translate label qua constGet + gT
  columnHelper.accessor('gender', {
    header: 'employee.fields.gender' satisfies TranslationsKey,
    cell: c =>
      gT(constGet(CONST_GENDER, c.getValue(), 'label') as TranslationsKey),
  }),

  createDateColumn<EmployeePreview>({
    accessor: 'dateOfBirth',
    header: 'employee.fields.dateOfBirth',
  }),

  // Nested field (contact.personalPhoneNumber)
  columnHelper.accessor('contact.personalPhoneNumber', {
    header:
      'employee.fields.contact.personalPhoneNumber' satisfies TranslationsKey,
  }),

  // Actions dropdown — render dựa trên meta callbacks (from table.options.meta)
  createActionsColumn<EmployeePreview>((row, table) => {
    const meta = table.options.meta;
    return (
      <>
        {meta?.onView && (
          <DropdownMenuItem onClick={() => meta.onView?.(row)}>
            <Eye />
            {gT('common.control.view' as TranslationsKey)}
          </DropdownMenuItem>
        )}
        {meta?.onEdit && (
          <DropdownMenuItem onClick={() => meta.onEdit?.(row)}>
            <Pencil />
            {gT('common.control.edit' as TranslationsKey)}
          </DropdownMenuItem>
        )}
        {meta?.onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => meta.onDelete?.(row)}
            >
              <Trash2 />
              {gT('common.control.delete' as TranslationsKey)}
            </DropdownMenuItem>
          </>
        )}
      </>
    );
  }),
];

export default columns;

// Custom cell — link tới details page với avatar
function FullNameCell({ row }: CellContext<EmployeePreview, unknown>) {
  return (
    <div className="flex flex-row gap-2">
      <Avatar>
        <AvatarImage src={row.original.avatar} alt={row.original.fullName} />
        <AvatarFallback>
          <EmptyAvatar />
        </AvatarFallback>
      </Avatar>
      <AppLink
        href={routePaths.details}
        relative
        params={{ id: row.original.id }}
        className="text-foreground w-fit px-0 text-left underline-offset-4 hover:underline"
      >
        {row.original.fullName}
      </AppLink>
    </div>
  );
}
```

> `getColumnHelper<T>()` tạo fresh helper mỗi lần gọi, tránh singleton-mutation bug. Tự động set `meta.isCustomCell = true` khi có `cell` prop — table renderer sẽ dùng `flexRender` thay vì `renderValue` mặc định.

> Cell trong DataTable mo trang chi tiet (ma, ten, bien so, ngay chung tu, ...) phai dung `AppLink`, khong dung `Button + router.push`. Link that giup browser ho tro chuot phai `Open link`, mo tab moi va copy link; `router.push` chi dung cho action/menu/submit/redirect khong can semantic link.

### Prebuilt column factories

> **Quy tắc bắt buộc:** Trước khi tạo custom column, **luôn kiểm tra bảng này trước**. Nếu có factory phù hợp → dùng factory. Chỉ custom khi không có factory nào thích hợp.

| Factory                           | Mô tả                                 | Default meta                                         |
| --------------------------------- | ------------------------------------- | ---------------------------------------------------- |
| `createSelectColumn<T>()`         | Checkbox chọn row                     | `align: center`, `sticky: left`                      |
| `createRowNumberColumn<T>()`      | Số thứ tự dòng (tính theo pagination) | `align: center`, `sticky: left`, header width `w-16` |
| `createActionsColumn<T>(render?)` | Dropdown 3 chấm                       | `align: center`, `sticky: right`                     |
| `createStatusColumn<T>({...})`    | Badge trạng thái                      | —                                                    |
| `createTickColumn<T>({...})`      | Icon ✓/✗                              | `align: center`                                      |
| `createDateColumn<T>({...})`      | Ngày format, null-safe                | —                                                    |
| `createUserColumn<T>({...})`      | Audit user: avatar + name             | resolve via `meta.userInfoById`                      |

### Audit user columns

Với bảng có `createdBy` / `modifiedBy`, dùng `createUserColumn` và hook `useEmployeeAuditUserInfo`. Không tự lặp lại logic gom ID, gọi API và build `Map` trong từng table component.

```tsx
// columns.tsx
createUserColumn<MyPreview>({
  accessor: 'createdBy',
  header: 'myModule.fields.createdBy',
}),
createUserColumn<MyPreview>({
  accessor: 'modifiedBy',
  header: 'myModule.fields.modifiedBy',
}),

// index.tsx
const records = query.data?.items;
const userInfoById = useEmployeeAuditUserInfo(records);

<DataTableServer
  // ...
  meta={{
    onView: handleView,
    userInfoById,
  }}
/>
```

Hook nhận một record hoặc mảng records có shape `AuditFields`, tự loại giá trị rỗng, audit actor `'system'` không phân biệt chữ hoa/thường, ID trùng và không gọi API khi không còn user hợp lệ. `createUserColumn` fallback về audit value gốc khi không có dữ liệu resolve, vì vậy actor hệ thống vẫn hiển thị theo giá trị API trả về, ví dụ `system` hoặc `System`.

---

## Column Styling (meta)

Khai báo trực tiếp trong column definition, áp dụng cho cả header lẫn cell:

```tsx
h.accessor('amount', {
  header: 'invoice.fields.amount',
  meta: {
    align: 'right',                    // 'left' | 'center' | 'right'
    className: 'font-mono tabular-nums', // class thêm vào cell <td>
    headerClassName: 'w-32',           // class thêm vào header <th>
    sticky: 'left',                    // pin cột: 'left' | 'right'
  },
}),
```

**Sticky columns** — khai báo `meta.sticky`, không cần config gì thêm ở DataTable:

```tsx
h.accessor('employeeCode', {
  header: 'employee.fields.employeeCode',
  meta: { sticky: 'left' },
}),

h.accessor('amount', {
  header: 'invoice.fields.amount',
  meta: { sticky: 'right', align: 'right' },
}),
```

Offset của các cột sticky được tính tự động từ `offsetWidth` thực tế của DOM (không phụ thuộc vào `size` prop).

---

## Column Filters

Convention file name: `filter-fields.ts`. Mỗi field khai báo `id` (= **column id**, cũng là tên field API), `title` (i18n key) và `type`. Filter map thẳng sang `FilterCondition` của contract (xem `04-api-services.md`).

### Các loại filter (`type`)

| `type`            | UI                                                   | Operator sinh ra                                                                                   |
| ----------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `enum` (mặc định) | multi-select, options **tĩnh** (label i18n key)      | `In` (multi) / `Equal` (single khi `multiple:false`)                                               |
| `select`          | multi-select, options **động từ API** (label string) | `In` / `Equal`                                                                                     |
| `text`            | input + chọn operator                                | `Contains` (mặc định), `Equal`, `NotEqual`, `StartsWith`, `EndsWith`, `IsNull`, `IsNotNull`        |
| `number`          | input + operator (Between = 2 ô)                     | `Equal`, `NotEqual`, `GreaterThan(OrEqual)`, `LessThan(OrEqual)`, `Between`, `IsNull`, `IsNotNull` |
| `dateRange`       | 2 ô date (from/to)                                   | cả 2 đầu → `Between`; 1 đầu → `GreaterThanOrEqual` / `LessThanOrEqual`                             |
| `boolean`         | select Tất cả/Có/Không                               | `Equal` (`'true'`/`'false'`)                                                                       |

`text` / `number` giới hạn danh sách operator qua `operators?`.

### `enum` — options tĩnh

```ts
// src/modules/employee/components/employee-data-table/filter-fields.ts
import { CONST_GENDER } from '../../constants/employee';
import { TranslationsKey } from '@/core/i18n/types';
import { DataTableFilterField } from '@/shared/components/data-table/shared/data-table-filter';

const filterFields: DataTableFilterField[] = [
  {
    id: 'gender', // phải match column id (cũng là tên field API filter)
    type: 'enum',
    title: 'employee.fields.gender' satisfies TranslationsKey,
    options: CONST_GENDER, // truyền thẳng — ConstantBase<V> đã có shape { label, value }
  },
  {
    id: 'createdOnUtc',
    type: 'dateRange',
    title: '...' satisfies TranslationsKey,
  },
  { id: 'note', type: 'text', title: '...' satisfies TranslationsKey },
];

export default filterFields;
```

### `select` — options động từ API (1 API cho nhiều cột)

Field chỉ khai `type: 'select'` (**không** có `options`). Options đến từ prop `filterOptions`
— map keyed theo field id, thường lấy từ **1 API multi-column** (tối ưu hơn gọi N API cho N cột).
DataTable **không tự fetch**: component bảng gọi API rồi truyền `filterOptions` vào (giữ pattern consumer sở hữu React Query).

```ts
// filter-fields.ts — chỉ khai báo, options đến từ filterOptions
const filterFields: DataTableFilterField[] = [
  { id: 'relatedEntityId', type: 'select', title: '...' satisfies TranslationsKey },
];

// component bảng
const { data: filterOptions } = useTableFilterOptions(); // 1 API
// filterOptions: { relatedEntityId: [{ value, label }], categoryId: [...] }
<DataTableServer
  filterFields={filterFields}
  filterOptions={filterOptions} // chỉ field `select` đọc từ đây
  ...
/>;
```

`select` value luôn là **string** (id số → `String(id)`); label là string hiển thị từ API (không qua i18n). Khi options chưa về → list rỗng (không lỗi).

### Rule quan trọng

- **`field.id` phải bằng column id.** Column dùng accessor lồng (`a.b`) bị TanStack đổi id thành `a_b` → phải đặt `id` tường minh cho column (hoặc field) để khớp, nếu không filter sẽ không hiển thị.
- **Hiển thị label nhưng filter theo code:** khi cột show tên người-đọc-được nhưng filter/sort chạy trên field code/id phía server, đặt `id` tường minh = tên field server và để accessor trỏ vào field label. Khi đó `select` option dùng `value` = code, `label` = tên (vd column `accessor('a.b.name')` + `id: 'bCode'`, filter field `id: 'bCode'`, options `{ value: code, label: name }`).
- `enum` (tĩnh) và `select` (API) dùng chung UI/operator, chỉ khác nguồn options + cách hiển thị label.

---

## actionsRender — Thanh action của table

`actionsRender` nhận `state` (`{ table, isLoading }`) và trả về ReactNode — thường là nút Create/Export.

```tsx
// Đơn giản
actionsRender={() => <CreateEmployeeButton />}

// Cần truy cập selected rows
actionsRender={({ table }) => {
  const selected = table.getSelectedRowModel().rows.map(r => r.original);
  return <ExportButton items={selected} />;
}}
```

---

## Row Click

Click vào bất kỳ vùng nào của row sẽ trigger `onRowClick`, **trừ** click trên `button`, `a`, `input`, `[role="button"]`, `[role="checkbox"]` trong cell.

```tsx
<DataTableServer
  ...
  onRowClick={employee =>
    router.push(routePaths.employeesDetails, {
      params: { id: employee.id },
    })
  }
/>
```

---

## TableMeta — Truyền callbacks xuống cell

Dùng khi action phụ thuộc vào context bên ngoài (mutation, router) và không muốn đóng gói vào column definition.

```tsx
// Khai báo type (src/types/tanstack-table.d.ts)
// interface TableMeta<TData> {
//   onView?: (row: Row<TData>) => void;
//   onEdit?: (row: Row<TData>) => void;
//   onDelete?: (row: Row<TData>) => void;
//   onCreate?: (data: TData[]) => void;  // Batch action trên selected rows
// }

// columns.tsx
createActionsColumn<EmployeePreview>((row, table) => {
  const meta = table.options.meta;
  return (
    <>
      {meta?.onView && (
        <DropdownMenuItem onClick={() => meta.onView?.(row)}>Xem</DropdownMenuItem>
      )}
      {meta?.onEdit && (
        <DropdownMenuItem onClick={() => meta.onEdit?.(row)}>Sửa</DropdownMenuItem>
      )}
      {meta?.onDelete && (
        <DropdownMenuItem
          variant="destructive"
          onClick={() => meta.onDelete?.(row)}
        >
          Xóa
        </DropdownMenuItem>
      )}
    </>
  );
}),

// index.tsx
<DataTableServer
  ...
  meta={{
    onView: row => router.push(routePaths.employeesDetails, { params: { id: row.original.id, mode: 'READ' } }),
    onEdit: canUpdate ? row => /* ... */ : undefined,
    onDelete: canDelete ? row => /* ... */ : undefined,
  }}
/>
```

> Truyền `undefined` cho callback nào user không có permission — column tự ẩn item đó. Đây là cách handle permission đơn giản hơn truyền cả flag riêng.

---

## DataTablePlain

Dùng cho sub-table nhúng bên trong form hoặc detail view — không cần toolbar, search, pagination. Hỗ trợ cell render tùy chỉnh (inline input, button) và footer row.

```tsx
import {
  DataTablePlain,
  PlainTableColumnDef,
} from '@/shared/components/data-table/plain';
import { TableCell, TableRow } from '@/shared/components/ui/table';

const columns: PlainTableColumnDef<Item>[] = [
  {
    key: 'name',
    header: t('fields.name'), // ReactNode — đã translate sẵn
    render: row => row.name,
  },
  {
    key: 'amount',
    header: t('fields.amount'),
    align: 'right',
    render: row => formatCurrency(row.amount),
  },
  {
    key: 'action',
    header: '',
    align: 'center',
    render: (_, index) => (
      <Button size="sm" variant="ghost" onClick={() => remove(index)}>
        {t('common.control.delete')}
      </Button>
    ),
  },
];

<DataTablePlain
  columns={columns}
  data={items}
  isFetching={query.isFetching && !query.data}
  getRowKey={row => row.id}
  footer={
    <TableRow>
      <TableCell colSpan={2} className="text-right font-semibold">
        Tổng
      </TableCell>
      <TableCell className="text-right font-bold">
        {formatCurrency(total)}
      </TableCell>
      <TableCell />
    </TableRow>
  }
/>;
```

### Props DataTablePlain

| Prop              | Type                                  | Mô tả                                                               |
| ----------------- | ------------------------------------- | ------------------------------------------------------------------- |
| `columns`         | `PlainTableColumnDef<TData>[]`        | Định nghĩa cột                                                      |
| `data`            | `TData[]`                             | Array data                                                          |
| `isFetching`      | `boolean`                             | Hiện skeleton khi loading                                           |
| `getRowKey`       | `(row, index) => string`              | Custom row key (default: index)                                     |
| `footer`          | `ReactNode`                           | Render bên trong `<TableFooter>` — thường là `<TableRow>` tổng cộng |
| `emptyState`      | `ReactNode`                           | Custom UI khi không có data                                         |
| `getRowClassName` | `(row, index) => string \| undefined` | Class động per-row — dùng để highlight row mới thêm, bị xóa, v.v.   |

### PlainTableColumnDef

| Prop              | Type                            | Mô tả                                        |
| ----------------- | ------------------------------- | -------------------------------------------- |
| `key`             | `string`                        | Unique key của column                        |
| `header`          | `ReactNode`                     | Nội dung header — truyền string đã translate |
| `render`          | `(row, index) => ReactNode`     | Cell renderer                                |
| `align`           | `'left' \| 'center' \| 'right'` | Căn chỉnh cả header lẫn cell                 |
| `className`       | `string`                        | Class thêm vào mỗi `<td>`                    |
| `headerClassName` | `string`                        | Class thêm vào `<th>` (dùng để set `w-*`)    |

### Cột điều kiện (conditional columns)

```tsx
const columns: PlainTableColumnDef<Item>[] = [
  { key: 'name', header: '...', render: row => row.name },
  { key: 'amount', header: '...', render: row => row.amount },
];

if (canDelete) {
  columns.push({
    key: 'action',
    header: t('common.label.action'),
    align: 'center',
    headerClassName: 'w-20',
    render: row => <Button onClick={() => del(row.id)}>Xóa</Button>,
  });
}
```

---

## Quy tắc: Không dùng HTML table thuần

```tsx
// ❌ SAI — không bao giờ dùng HTML table trực tiếp
<table className="w-full text-sm">
  <thead>...</thead>
  <tbody>...</tbody>
</table>

// ✅ ĐÚNG — dùng DataTablePlain cho sub-table
<DataTablePlain columns={columns} data={items} />

// ✅ ĐÚNG — dùng DataTableStatic khi cần sort/filter client-side
<DataTableStatic columns={columns} data={items} />

// ✅ ĐÚNG — dùng DataTableServer cho data từ API
<DataTableServer columns={columns} listResponse={data} ... />
```
