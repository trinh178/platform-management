# 10 — Code Patterns (Thực tế từ Source Code)

## Module Reference — Employee Module

Module `employee` ([src/modules/employee/](src/modules/employee/)) là **module mẫu** hoàn chỉnh, dùng làm reference khi tạo module mới:

```text
src/modules/employee/
├── index.tsx                    ← AppModuleProps với route tree
├── permissions.ts               ← HRM_EM.EMPLOYEE.* keys
├── route-paths.ts               ← { employees, employeesDetails, create, details }
├── i18n/vi.json + en.json       ← { employee: { title, fields: {...} } }
├── pages/
│   ├── employees.page.tsx       ← <PageContent><EmployeeDataTable/></PageContent>
│   ├── employees-create.page.tsx ← <PageContent><EmployeeCRUD defaultMode="CREATE"/></PageContent>
│   └── employees-details.page.tsx ← <EmployeeCRUD defaultMode={...} id={id}/>
├── components/
│   ├── employee-crud/
│   │   ├── index.tsx              ← Mode CREATE/READ/UPDATE + Context provider
│   │   ├── context.tsx            ← React Context cho CRUD state
│   │   ├── content-header.tsx
│   │   ├── content-form.tsx       ← Render sections
│   │   ├── form-validate-resolver.ts
│   │   ├── transform-create-data.ts
│   │   ├── employee-created-dialog.tsx
│   │   └── sections/              ← employee-basic, employee-contact, employee-job-info, ...
│   ├── employee-data-table/
│   │   ├── index.tsx              ← DataTable wrapper với state + query + handlers
│   │   ├── columns.tsx            ← Column defs dùng getColumnHelper
│   │   ├── filter-fields.ts       ← Filter config (enum/select/text/number/dateRange/boolean)
│   │   └── actions.tsx            ← Nút Create ở header table
│   └── employee-delete-confirm-content.tsx ← Card hiển thị trong confirm modal
├── services/
│   ├── employee.api.ts            ← list, details, create, update, remove, generateEmployeeCode
│   ├── employee.api-types.ts      ← Request/Response types
│   ├── employee.queries.ts        ← useEmployees, useEmployeeDetails, useGenerateEmployeeCode
│   ├── employee.mutation.ts       ← useEmployeeCreate, useEmployeeUpdate, useEmployeeDelete
│   ├── employee.query-keys.ts     ← employeeKeys object
│   ├── employee-documents.api.ts  ← Nested resource: documents
│   ├── employee-qualifications.api.ts ← Nested resource: qualifications
│   └── organization-unit.api.ts   ← Related: org-units
├── types/
│   ├── employee.ts                ← Employee, EmployeePreview, GenderType, MaritalStatusType
│   ├── employee-contact.ts
│   ├── employee-job-info.ts
│   ├── employee-qualification.ts
│   └── organization.ts
└── constants/employee.ts          ← CONST_GENDER, CONST_MARITAL_STATUS
```

> Mock của module được đặt ở [src/mock/hrmem/employee/](src/mock/hrmem/employee/) với cấu trúc 5 file `{index, mock-types, stores, helpers, routes}` — xem [04-api-services.md — Mock API](./04-api-services.md#mock-api).

## Pattern: ConstantBase với typed value

```ts
// Dùng ConstantBase<ValueType> để type-safe constant arrays
import { ConstantBase } from '@/core/constants';
import { GenderType } from '../types/employee';

export const CONST_GENDER: ConstantBase<GenderType>[] = [
  { label: 'employee.constants.gender.male', value: 'Male' },
  { label: 'employee.constants.gender.female', value: 'Female' },
] as const;
// label là TranslationsKey, value là literal type
```

## Pattern: ConstantBase với extra fields (className, icon, …)

Dùng generic `E` của `ConstantBase<V, E>` để khai báo thêm bất kỳ field nào — thường dùng cho `className` của Badge/status. Ưu điểm: màu + label nằm cùng chỗ, không phải switch-case rải rắc trong component.

```ts
import { ConstantBase } from '@/core/constants';
import { EmployeeStatusType } from '../types/employee';

export const CONST_EMPLOYEE_STATUS: ConstantBase<
  EmployeeStatusType,
  { className: string }
>[] = [
  {
    label: 'employee.constants.status.active',
    value: 'Active',
    className:
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300',
  },
  {
    label: 'employee.constants.status.inactive',
    value: 'Inactive',
    className:
      'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900 dark:text-gray-400',
  },
] as const;
```

Lấy `className` bằng `constGet` — type-safe:

```tsx
// Trong createStatusColumn
createStatusColumn<EmployeePreview>({
  accessor: 'status',
  header: 'employee.fields.status' satisfies TranslationsKey,
  status: row =>
    gT(constGet(CONST_EMPLOYEE_STATUS, row.original.status, 'label') as TranslationsKey),
  statusClassName: row =>
    constGet(CONST_EMPLOYEE_STATUS, row.original.status, 'className'),
}),

// Trong custom component (badge/span)
const className = constGet(CONST_EMPLOYEE_STATUS, status, 'className') as string;
<span className={cn('px-2 py-0.5 rounded-full border text-xs font-medium', className)}>
  {label}
</span>
```

## Pattern: transformSuccessResponse trong API

```ts
function list(data: ListEmployeesRequest) {
  return hrmemHttpRequest.request<ListEmployeesResponse>({
    method: 'GET',
    url: '/profiles/employees',
    params: {
      ...data,
      pageIndex: (data.pageIndex ?? 0) + 1, // Client 0-based → API 1-based
    },
    transformSuccessResponse(response) {
      // Compose fullName (BE chỉ trả firstName/lastName riêng)
      response.items = response.items.map(e => ({
        ...e,
        fullName: getFullName(e.firstName, e.lastName),
      }));
      response.pageIndex -= 1; // API 1-based → Client 0-based
      // Inject lại client-side state để DataTable restore khi remount từ cache
      if (data.searchTerm) response.searchTerm = data.searchTerm;
      if (data.filters) response.filters = data.filters;
      if (data.sorts) response.sorts = data.sorts;
      return response;
    },
  });
}
```

## Pattern: AuditFields — shared type cho audit tracking

Mọi entity có `createdBy/createdOnUtc/modifiedBy/modifiedOnUtc` đều dùng `AuditFields` từ `@/shared/types/audit` thay vì khai báo lại.
API trả audit date dạng ISO string, service layer phải convert bằng `transformAuditFields` / `transformAuditFieldsList` trước khi trả về entity cho UI.

```ts
// src/shared/types/audit.ts
export type AuditFields = {
  createdBy?: string;
  createdOnUtc?: Date;
  modifiedBy?: string | null;
  modifiedOnUtc?: Date | null;
};
```

**Entity dùng intersection:**

```ts
import { AuditFields } from '@/shared/types/audit';

export type Employee = AuditFields & {
  id: string;
  fullName: string;
  // ...
};
```

**Preview/list type dùng Pick:**

```ts
export type EmployeePreview = Pick<
  Employee,
  | 'id'
  | 'fullName'
  | 'createdBy'
  | 'createdOnUtc'
  | 'modifiedBy'
  | 'modifiedOnUtc'
  // ...
>;
```

> Tương tự cho mock interfaces: dùng `MockAuditFields` từ `src/mock/hrmem/mock-types.ts`.

## Pattern: Resolve audit users dùng chung

Không tự viết `useMemo` để gom `createdBy` / `modifiedBy` rồi gọi API trong từng table hoặc detail component. Dùng `useEmployeeAuditUserInfo`, hook nhận một `AuditFields`, một mảng `AuditFields`, hoặc giá trị rỗng và trả về map thông tin hiển thị theo user ID.

```tsx
import { useEmployeeAuditUserInfo } from '@/modules/employee/services/employee-audit.queries';

// Data table
const userInfoById = useEmployeeAuditUserInfo(listQuery.data?.items);

<DataTableServer
  // ...
  meta={{ userInfoById }}
/>;

// Detail/CRUD section
const userInfoById = useEmployeeAuditUserInfo(detailsQuery.data);
const createdByInfo = detailsQuery.data?.createdBy
  ? userInfoById.get(detailsQuery.data.createdBy)
  : undefined;
```

Luồng chuẩn hóa nằm tập trung trong employee service:

1. Thu thập `createdBy` và `modifiedBy`.
2. Loại giá trị rỗng và actor đặc biệt `'system'` không phân biệt chữ hoa/thường.
3. Loại ID trùng, sort để query key ổn định.
4. Chỉ gọi API khi còn user ID hợp lệ.
5. API function chuẩn hóa lại và trả mảng rỗng nếu không cần request.

> Với bảng dùng `createUserColumn`, truyền map qua `meta.userInfoById`. Không đưa logic gọi employee API vào shared DataTable vì shared component không được phụ thuộc ngược vào module nghiệp vụ.

## Pattern: details với Date conversion

```ts
function details(id: EmployeeDetailsRequest) {
  return hrmemHttpRequest.request<EmployeeDetailsResponse>({
    method: 'GET',
    url: `/profiles/employee/${id}`,
    transformSuccessResponse(response) {
      response.fullName = getFullName(response.firstName, response.lastName);
      // Convert string → Date — guard với && để không tạo Invalid Date khi field optional null/undefined
      response.dateOfBirth = new Date(response.dateOfBirth);
      response.idDateOfIssue =
        response.idDateOfIssue && new Date(response.idDateOfIssue);
      response.idDateOfExpiry =
        response.idDateOfExpiry && new Date(response.idDateOfExpiry);
      return response;
    },
  });
}
```

## Pattern: useQuery với options override

```ts
// Gọi query với options override
const employees = useEmployees(listRequest, {
  placeholderData: previousData => previousData, // Keep previous data khi paging
  meta: { notifyError: false }, // Suppress error notification
});

// Query refetch thủ công (vd cho nút Generate)
const generateCode = useGenerateEmployeeCode(undefined, {
  enabled: false, // Chỉ fetch khi gọi refetch() thủ công
});
// Dùng: generateCode.refetch().then(r => r.data?.employeeCode)
```

## Pattern: Details Page với inline-edit từng field

CRUD forms bắt buộc render field bằng `FieldInput*` từ `src/shared/components/form`. Nếu chưa có field phù hợp, tạo thêm field input dùng `FieldInputBase` trước khi dùng trong module. Xem rule chi tiết ở [`05-forms.md`](./05-forms.md#rule-bắt-buộc-khi-làm-crud-form).

```tsx
// Trong details page ở UPDATE mode: inline-edit từng field
<FieldInputText
  label={t('employee.fields.firstName')}
  form={form}
  name="firstName"
  mode="EDIT" // Bắt buộc để inlineEdit hoạt động
  inlineEdit // Chưa bấm edit thì field read-only, hover hiện nút edit
  onInlineSave={(name, value) => updateMutation.mutate({ id, [name]: value })}
  loading={updateMutation.isPending && editingFieldName === 'firstName'}
/>
```

> **Editing field tracking:** dùng `editingFieldName` state để biết field nào đang được mutate, từ đó chỉ field đang edit hiển thị spinner thay vì tất cả field cùng loading.

### Quy tắc: content-header và cơ chế edit trong details page

`CRUDMode` chỉ mô tả trạng thái trang (`CREATE`, `READ`, `UPDATE`). Cơ chế edit của details page là một lớp riêng:

| Capability          | Hành vi                                                                              |
| ------------------- | ------------------------------------------------------------------------------------ |
| `INLINE_ONLY`       | Inline edit có sẵn ở từng field/group khi user có quyền update; không có global Save |
| `GLOBAL_ONLY`       | `UPDATE` dùng global form submit, header có Save/Cancel                              |
| `INLINE_AND_GLOBAL` | Inline edit có thể có sẵn; nút **Sửa** chuyển sang global edit                       |

Quy tắc quan trọng: tại một thời điểm chỉ được chạy một cơ chế save. Inline edit và global edit có thể cùng tồn tại trên một page, nhưng phải được tách bằng sub-mode/cờ riêng, ví dụ `editMode: 'INLINE' | 'GLOBAL'` hoặc một mode cục bộ như `UPDATE_GLOBAL`.

Details page mặc định luôn mở `READ`. Với page có inline edit, `READ` vẫn có thể truyền `mode="EDIT" inlineEdit` xuống field/group nếu user có quyền update để hiện nút edit tại từng field/group. Chỉ dùng header **Sửa** để vào global edit. Với page `INLINE_AND_GLOBAL`, inline edit có thể là trạng thái mặc định; header vẫn hiển thị nút **Sửa** để chuyển sang global edit.

| Trạng thái        | Cơ chế save                            | Header actions                                                                                                                                                |
| ----------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CREATE`          | Global form submit (`<form onSubmit>`) | **Save** + Cancel (navigate về list)                                                                                                                          |
| `READ` + inline   | Per-field inline save (`onInlineSave`) | Không có global Save; không cần header **Sửa** nếu page chỉ hỗ trợ inline edit; nếu page hỗ trợ global edit thì **Sửa** dùng để vào global edit               |
| `READ`            | Không edit                             | Với page chỉ hỗ trợ global edit, **Sửa** chuyển sang `UPDATE` nếu user có quyền update                                                                        |
| `UPDATE` + inline | Per-field inline save (`onInlineSave`) | Chỉ dùng khi flow/URL cần biểu diễn inline edit bằng `mode=UPDATE`; không có global Save; nếu page hỗ trợ global edit thì hiển thị **Sửa** để vào global edit |
| `UPDATE` + global | Global form submit                     | **Save** + Cancel, không bật `inlineEdit`                                                                                                                     |

```tsx
type DetailEditMode = 'INLINE' | 'GLOBAL';

const [editMode, setEditMode] = React.useState<DetailEditMode>(
  supportsInlineEdit ? 'INLINE' : 'GLOBAL',
);

const isInlineEnabled =
  canUpdate && supportsInlineEdit && editMode === 'INLINE';
const isGlobalUpdate = mode === 'UPDATE' && editMode === 'GLOBAL';
const fieldMode = isInlineEnabled || isGlobalUpdate ? 'EDIT' : 'VIEW';

if (mode === 'CREATE') {
  return (
    <PageContentHeader
      actions={
        <>
          <Button variant="outline" onClick={() => router.push(listPath)}>
            Hủy
          </Button>
          <Button type="submit">Lưu</Button>
        </>
      }
    />
  );
}

return (
  <PageContentHeader
    actions={
      <>
        {canUpdate && mode === 'READ' && !supportsInlineEdit && (
          <Button onClick={() => setMode('UPDATE')}>Sửa</Button>
        )}

        {canUpdate && isInlineEnabled && supportsGlobalEdit && (
          <Button onClick={() => setEditMode('GLOBAL')}>Sửa</Button>
        )}

        {canUpdate && isGlobalUpdate && (
          <>
            <Button
              variant="outline"
              onClick={() => {
                if (supportsInlineEdit) setEditMode('INLINE');
                else setMode('READ');
              }}
            >
              Hủy
            </Button>
            <Button type="submit">Lưu</Button>
          </>
        )}
      </>
    }
  />
);
```

Trong `ContentForm`, truyền `inlineEdit={isInlineEnabled}` cho `FieldInput*`. Khi `isGlobalUpdate`, field vẫn nhận `mode="EDIT"` nhưng không bật `inlineEdit`, để user sửa toàn form rồi bấm Save ở header.

> **Lý do:** Global Save trong cùng trạng thái với inline draft có thể submit toàn bộ form và ghi đè fields user chưa muốn thay đổi. Tách inline/global bằng sub-mode giúp page có đủ hai cơ chế mà không lẫn lifecycle save.

## Pattern: Inline update với flat path → nested object

Field name dạng `contact.permanentAddress.provinceCode` được biến thành nested object qua `unflatten` (thư viện `flat`) trước khi gọi mutate. Pattern này cho phép inline-edit nested field mà không cần custom handler cho từng field:

```tsx
import { unflatten } from 'flat';

const handleUpdate = React.useCallback(
  (
    name: FieldPath<Employee>,
    value: unknown,
    payload?: DeepPartial<Employee>,
  ) => {
    if (!read.data?.id) return;
    setEditingFieldName(name);
    update.mutate(
      payload
        ? { id: read.data.id, ...payload } // override toàn bộ nếu cần payload tùy biến
        : unflatten({ id: read.data.id, [name]: value }), // flat → nested
      { onSettled: () => setEditingFieldName(undefined) },
    );
  },
  [read.data, update],
);
```

## Pattern: Field Names trong column/form (type-safe)

```tsx
// Truy cập field trong column
columnHelper.accessor('employeeCode', {
  header: 'employee.fields.employeeCode' satisfies TranslationsKey,
})

// Trong form field
<FieldInputText
  name="employeeCode"
  label={t('employee.fields.employeeCode')}
  form={form}
/>
```

## Pattern: ColumnHelper với `satisfies TranslationsKey`

```tsx
// 'satisfies' = compile-time check: lỗi nếu key không tồn tại trong i18n
columnHelper.accessor('employeeCode', {
  header: 'employee.fields.employeeCode' satisfies TranslationsKey,
}),

// ❌ Lỗi compile:
// header: 'employee.fields.nonExistentKey' satisfies TranslationsKey,
```

## Pattern: Mutation với invalidateQueries

```ts
// Invalidate list khi create
export const useEmployeeCreate = createUseMutationHrmEm({
  mutationFn: employeeApi.create,
  onSuccess() {
    queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
  },
});

// Invalidate cả list lẫn details khi update
export const useEmployeeUpdate = createUseMutationHrmEm({
  mutationFn: employeeApi.update,
  onSuccess(_, vars) {
    queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
    queryClient.invalidateQueries({ queryKey: employeeKeys.details(vars.id) });
  },
});

// Clear details cache khi delete (tránh refetch 404)
export const useEmployeeDelete = createUseMutationHrmEm({
  mutationFn: employeeApi.remove,
  onSuccess(_, id) {
    queryClient.setQueryData(employeeKeys.details(id), undefined);
    queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
  },
});
```

## Pattern: Query Keys hierarchical

```ts
const employeeKeys = {
  all: ['employee'], // Invalidate tất cả
  list: (params?: ListRequest) =>
    params
      ? (['employee', 'list', params] as const)
      : (['employee', 'list'] as const),
  details: (id?: string) => ['employee', 'details', id] as const,
  me: ['employee', 'details', 'me'] as const,
  generateEmployeeCode: ['employee', 'generate-employee-code'] as const,
};

// Usage:
queryClient.invalidateQueries({ queryKey: employeeKeys.list() }); // Tất cả lists
queryClient.invalidateQueries({ queryKey: employeeKeys.details(id) }); // Specific id
queryClient.invalidateQueries({ queryKey: employeeKeys.all }); // Mọi thứ thuộc 'employee'
```

## Pattern: PageContent Layout

> **Quy tắc bắt buộc:** Mọi `*.page.tsx` đều phải bọc nội dung trong `<PageContent>` — kể cả create page, list page, details page. `<PageContent>` chỉ được đặt ở `*.page.tsx`, không được đặt bên trong component con (CRUD component, data table, steps panel, …). Component con communicate loading state lên PageContent cha qua `usePageContentContext().setLoading()`.

```tsx
// ✅ ĐÚNG — mọi page đều bọc trong <PageContent>
// src/modules/employee/pages/employees-create.page.tsx
export default function EmployeesCreatePage() {
  return (
    <PageContent>
      <EmployeeCRUD defaultMode="CREATE" />
    </PageContent>
  );
}

// ✅ ĐÚNG — <PageContent> ở page file
// src/modules/employee/pages/employees-details.page.tsx
export default function EmployeesDetailsPage() {
  return (
    <PageContent>
      <EmployeeCRUD defaultMode={defaultMode} id={id} />
    </PageContent>
  );
}

// ✅ ĐÚNG — CRUD component dùng usePageContentContext để set loading
// src/modules/employee/components/employee-crud/index.tsx
import { usePageContentContext } from '@/core/layout/page-content-context';

export default function EmployeeCRUD({ defaultMode, id }: EmployeeCRUDProps) {
  const read = useEmployeeDetails(id!, { enabled: !!id });

  const pageLoading = mode !== 'CREATE' && !!id && (read.isPending || !read.data);
  const { setLoading } = usePageContentContext();
  React.useEffect(() => {
    setLoading(pageLoading);
    return () => setLoading(false);
  }, [pageLoading, setLoading]);

  return (
    <EmployeeCRUDContext.Provider value={...}>
      {!pageLoading && (
        <form>
          <ContentHeader />
          <ContentForm />
        </form>
      )}
    </EmployeeCRUDContext.Provider>
  );
}

// ❌ SAI — <PageContent> bên trong CRUD component
export default function EmployeeCRUD({ id }: EmployeeCRUDProps) {
  return (
    <EmployeeCRUDContext.Provider value={...}>
      <PageContent loading={loading}>  {/* ← SAI */}
        <ContentHeader />
        <ContentForm />
      </PageContent>
    </EmployeeCRUDContext.Provider>
  );
}
```

```tsx
import PageContent from '@/core/layout/page-content';
import PageContentHeader from '@/core/layout/page-content-header';

<PageContent>
  <PageContentHeader
    title={t('employee.title')}
    actions={
      <Button onClick={handleCreate}>{t('common.control.create')}</Button>
    }
  />
  {/* Page body */}
</PageContent>;
```

### PageContent props

| Prop                   | Type      | Mô tả                                                                   |
| ---------------------- | --------- | ----------------------------------------------------------------------- |
| `loading`              | `boolean` | Hiện skeleton overlay, khóa scroll                                      |
| `fixed`                | `boolean` | Khóa chiều cao PageContent và ẩn overflow khi cần vùng làm việc cố định |
| `fullScreen`           | `boolean` | Dùng chiều cao toàn viewport (`min-h-screen` / `h-screen` khi fixed)    |
| `className`            | `string`  | Tailwind override (vd `pt-4`, `flex flex-col gap-4`)                    |
| `...HTMLDivAttributes` |           | Pass-through cho `<div>`                                                |

PageContent là `forwardRef<HTMLDivElement>`. Default styling: `animate-in fade-in-0 duration-700 flex flex-col p-4 pt-0 relative` + `min-h-0 flex-1` để fill phần còn lại của app shell/main dưới app header.

Không tự tính `calc(100vh - header)` trong page hoặc iframe. Với màn nhúng/full workspace, dùng `fixed` nếu cần khóa scroll của PageContent; component con bên trong nên dùng `min-h-0 flex-1` và tránh thêm `min-h-[calc(...)]` riêng.

```tsx
<PageContent fixed className="p-2">
  <div className="flex min-h-0 flex-1 overflow-hidden">
    <iframe className="min-h-0 w-full flex-1 border-0" />
  </div>
</PageContent>
```

### PageContentHeader props

| Prop       | Type              | Mô tả                                                                                   |
| ---------- | ----------------- | --------------------------------------------------------------------------------------- |
| `title`    | `React.ReactNode` | Nếu là `string` → tự `t(title as TranslationsKey)`; nếu là ReactNode → render trực tiếp |
| `actions`  | `React.ReactNode` | Render bên phải header (Button group, BackButton, …)                                    |
| `backPath` | `AppPath`         | Nếu set → BackButton (luôn hiện) sẽ navigate tới path này thay vì `router.back()`       |

Header có sẵn `BackButton` ở bên trái — không cần thêm thủ công.

## Pattern: SectionPanel cho form/detail sections

`SectionPanel` là shared layout primitive cho các khối nội dung có tiêu đề trong form, detail page,
approval history, steps panel, hoặc các panel nghiệp vụ tương tự.

```tsx
import SectionPanel from '@/shared/components/layout/section-panel';

<SectionPanel title={t('employee.sections.basic.title')}>
  <EmployeeBasicInfo />
</SectionPanel>;
```

### SectionPanel props

| Prop                | Type              | Mô tả                                                    |
| ------------------- | ----------------- | -------------------------------------------------------- |
| `title`             | `React.ReactNode` | Tiêu đề section, render trong header panel               |
| `description`       | `React.ReactNode` | Mô tả ngắn dưới title                                    |
| `actions`           | `React.ReactNode` | Action phụ bên phải header, ví dụ nút thêm dòng/collapse |
| `contentClassName`  | `string`          | Tailwind override cho vùng content, default `p-4`        |
| `className`         | `string`          | Tailwind override cho wrapper `<section>`                |
| `...HTMLAttributes` |                   | Pass-through cho `<section>`                             |

Quy ước:

- Dùng `SectionPanel` thay cho wrapper thủ công kiểu `border bg-white rounded-md p-4`.
- Không thêm ký tự trang trí như `#` vào title; title chỉ là nội dung đã translate.
- Dùng `actions` cho nút thao tác phụ của panel thay vì đặt nút rời trong content.
- Nếu một màn cần layout không có khung, dùng section semantic riêng; không biến `SectionPanel` thành nhiều biến thể cục bộ trong từng module.

## Pattern: SubSection cho sub-group trong form/detail

`SubSection` là shared layout primitive cho **nhóm con bên trong `SectionPanel`** — ví dụ chia một section
"Thông tin cơ bản" thành 3 nhóm con "General / CCCD / Education". Render nhẹ hơn `SectionPanel`: dashed
border, không shadow, heading `<h3>` text-primary, không có primary accent stripe.

```tsx
import SectionPanel from '@/shared/components/layout/section-panel';
import SubSection from '@/shared/components/layout/sub-section';

<SectionPanel title={t('employee.sections.basic.title')}>
  <div className="space-y-4">
    <SubSection title={t('employee.sections.basic.general')}>
      <FieldGroup className="grid grid-cols-2 2xl:grid-cols-3">
        {/* FieldInputText, FieldInputDate, ... */}
      </FieldGroup>
    </SubSection>

    <SubSection title={t('employee.sections.basic.id')}>
      <FieldGroup className="grid grid-cols-3">{/* CCCD fields */}</FieldGroup>
    </SubSection>
  </div>
</SectionPanel>;
```

### SubSection props

| Prop                | Type              | Mô tả                                                            |
| ------------------- | ----------------- | ---------------------------------------------------------------- |
| `title`             | `React.ReactNode` | Tiêu đề sub-section, render `<h3>` text-primary trong header     |
| `description`       | `React.ReactNode` | Mô tả ngắn dưới title                                            |
| `actions`           | `React.ReactNode` | Action phụ bên phải header (ví dụ nút "+ Add" cho danh sách con) |
| `contentClassName`  | `string`          | Tailwind override cho vùng content, default `p-4`                |
| `className`         | `string`          | Tailwind override cho wrapper `<section>`                        |
| `...HTMLAttributes` |                   | Pass-through cho `<section>`                                     |

Quy ước:

- KHÔNG dùng `FieldSet` raw + inline border (`border-dashed border-emerald-700`, `border-border` v.v.) để vẽ sub-group; luôn dùng `SubSection`.
- KHÔNG nest `SectionPanel` trong `SectionPanel` cho sub-group — nesting 2 cấp full panel sẽ quá nặng visual; dùng `SubSection` cho cấp 2.
- Bọc danh sách `SubSection` bằng wrapper `<div className="space-y-4">` để khoảng cách đều; không gắn `mt-4` thủ công vào từng `SubSection`.
- Khi sub-group có hành động riêng (ví dụ nút "+ Add row"), truyền qua prop `actions` của `SubSection` thay vì absolute-position thủ công.

## Pattern: BackButton

```tsx
import { BackButton } from '@/core/layout/back-button';

// Default: gọi router.back()
<BackButton />

// Custom: replace tới path cụ thể
<BackButton backPath="/employees" backPathParams={{ filter: 'active' }} />
```

`PageContentHeader` đã có BackButton sẵn — chỉ dùng standalone khi layout custom.

## Pattern: Conditional render với Permission

```tsx
const canCreate = useHasPermissions('HRM_EM.EMPLOYEE.EMPLOYEE.CREATE');
const canDelete = useHasPermissions('HRM_EM.EMPLOYEE.EMPLOYEE.DELETE');

return (
  <div>
    {canCreate && <Button onClick={handleCreate}>Thêm mới</Button>}
    {canDelete && (
      <Button variant="destructive" onClick={handleDelete}>
        Xóa
      </Button>
    )}
  </div>
);
```

## Pattern: useConstWithTranslations (khi cần label đã translate)

```tsx
import { useConstWithTranslations } from '@/core/constants';
import { CONST_GENDER } from '../../constants/employee';

// Trong component — translate label trước khi truyền vào Select
const genderOptions = useConstWithTranslations(CONST_GENDER);
// → [{ value: 'Male', label: 'Nam' }, { value: 'Female', label: 'Nữ' }]

<FieldInputSelect
  options={genderOptions}
  ...
/>
```

## Pattern: BlinkHighlightContainer (highlight khi navigate đến)

```tsx
import React from 'react';
import BlinkHighlightContainer, {
  BlinkHighlightContainerHandle,
} from '@/shared/components/feedback/blink-highlight-container';

const highlightRef = React.useRef<BlinkHighlightContainerHandle>(null);

React.useEffect(() => {
  if (justCreated) highlightRef.current?.trigger();
}, [justCreated]);

// Highlight khi navigate từ create → details (justCreated = true lần đầu)
<BlinkHighlightContainer triggerRef={highlightRef}>
  <SomeContent />
</BlinkHighlightContainer>;
```

## Pattern: AppIcon (product icon)

```tsx
import AppIcon from '@/shared/components/ui/app-icon';
import appIcon from '@/assets/icons/app-icon.png';

<AppIcon
  src={appIcon}
  size={92}
  rounded="2xl"
  placeholderClassName="from-[#0f766e] via-[#1fa39a] to-[#65d6c9]"
/>;
```

## Pattern: Zod với schemaFn (khi cần z.ZodObject đầy đủ)

```ts
// strictSchemaFn (thường dùng): chỉ khai báo fields
const resolver = createFormValidateResolverWithTranslations<EmployeeFormValues>(
  t => ({
    firstName: z.string().min(1, t('validation.required')),
    lastName: z.string().min(1, t('validation.required')),
  }),
);

// schemaFn (khi cần .refine(), .superRefine(), .transform(),...):
const resolver = createFormValidateResolverWithTranslations<EmployeeFormValues>(
  undefined, // strictSchemaFn = undefined
  t =>
    z
      .object({
        idDateOfIssue: z.date().optional(),
        idDateOfExpiry: z.date().optional(),
      })
      .refine(
        data =>
          !data.idDateOfIssue ||
          !data.idDateOfExpiry ||
          data.idDateOfExpiry > data.idDateOfIssue,
        {
          message: t('validation.dateRangeInvalid'),
          path: ['idDateOfExpiry'],
        },
      ),
);
```
