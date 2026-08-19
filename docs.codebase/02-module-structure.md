# 02 — Module Structure

## Cấu trúc chuẩn của một module

Business module đặt trực tiếp dưới `src/modules/<module-name>/`. Các module nền dùng chung đặt dưới
`src/modules/foundation/<module-name>/` và được đăng ký trước business modules.

Các foundation modules hiện có:

| Module              | Vai trò                                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `app-branding`      | Branding tổng thể: tên/mô tả (i18n), icon + logo (`app-config.ts`), màu chủ đạo (`theme.css`)                    |
| `app-shell`         | Layout shell, sidebar/header, public page, app-shell store                                                       |
| `common`            | i18n dùng chung: `common.control.*`, `common.notify.*`, `common.table.*`, `common.constants.*`, `common.label.*` |
| `identity`          | Sign-in page, auth API, `/me` query, identity store                                                              |
| `shared-components` | i18n/tài nguyên phục vụ shared components                                                                        |
| `validation`        | Validation i18n và rules helpers                                                                                 |

```text
src/modules/<module-name>/
├── index.tsx                   # AppModuleProps: khai báo route + importI18n
├── permissions.ts              # Permission keys của module
├── route-paths.ts              # Định nghĩa các paths của module
├── i18n/
│   ├── vi.json                 # Tiếng Việt
│   └── en.json                 # Tiếng Anh
├── pages/
│   ├── <name>.page.tsx         # List page
│   ├── <name>-create.page.tsx  # Create page
│   └── <name>-details.page.tsx # Details/Edit page
├── components/
│   ├── <name>-crud/            # Form CREATE/READ/UPDATE component
│   │   ├── index.tsx           # Root: state mode, form, mutations, context provider
│   │   ├── context.tsx         # React context cho CRUD form
│   │   ├── content-header.tsx  # Title, mode switch, action buttons
│   │   ├── content-form.tsx    # Render list section dùng SectionPanel
│   │   ├── form-validate-resolver.ts  # Zod schema (tách riêng)
│   │   ├── transform-create-data.ts   # Tiền xử lý data trước khi gửi API
│   │   └── sections/           # Sub-sections của form
│   │       ├── <name>-basic.tsx
│   │       └── <name>-contact.tsx
│   └── <name>-data-table/      # Table component
│       ├── index.tsx
│       ├── columns.tsx
│       ├── filter-fields.ts
│       └── actions.tsx
├── services/
│   ├── <entity>.api.ts         # API calls
│   ├── <entity>.api-types.ts   # Request/Response types
│   ├── <entity>.queries.ts     # useQuery hooks
│   ├── <entity>.mutation.ts    # useMutation hooks
│   └── <entity>.query-keys.ts  # Query key factories
├── types/
│   └── <entity>.ts             # TypeScript types
├── constants/
│   └── <entity>.ts             # Constants (CONST_* arrays)
└── assets/                     # (tùy chọn) Assets riêng của module — illustration, icon, image chỉ dùng trong module này
```

## Khai báo Module (index.tsx)

`AppModuleProps.route` có thể là **một object** hoặc **một array** (khi module cần nhiều route gốc):

```tsx
// src/modules/employee/index.tsx
import { User } from 'lucide-react';
import EmployeesCreatePage from './pages/employees-create.page';
import EmployeesDetailsPage from './pages/employees-details.page';
import EmployeesPage from './pages/employees.page';
import routePaths from './route-paths';
import { AppModuleProps } from '@/types/core.types';

const employeeModule: AppModuleProps = {
  route: {
    key: 'employee',
    path: routePaths.employees,
    title: 'employee.title', // TranslationsKey — phải tồn tại trong i18n
    icon: <User />,
    Component: EmployeesPage,
    permission: {
      permissions: ['HRM_EM.EMPLOYEE.EMPLOYEE.VIEW'],
    },
    navMenu: {
      enable: true,
      groupLabel: ['app_shell.nav_menu.group.general'],
    },
    children: [
      {
        key: 'employee-create',
        path: routePaths.create,
        title: 'employee.page.create',
        permission: {
          permissions: ['HRM_EM.EMPLOYEE.EMPLOYEE.CREATE'],
        },
        Component: EmployeesCreatePage,
      },
      {
        key: 'employee-details',
        path: routePaths.details,
        title: 'employee.page.details',
        Component: EmployeesDetailsPage,
      },
    ],
  },
  importI18n: locale => async () =>
    (await import(`@/modules/employee/i18n/${locale}.json`)).default,
};

export default employeeModule;
```

## Khai báo Module có nhiều sub-page trong sidebar

Khi module có **nhiều child routes cùng xuất hiện trong sidebar** (ví dụ module Employee gom trang Nhân viên / Đơn vị), cần dùng **Redirect Page** ở root thay vì list page trực tiếp — vì route có children với navMenu sẽ chỉ toggle group khi click (xem [03-routing-permissions.md — Sidebar Behavior](03-routing-permissions.md)):

```tsx
// src/modules/employee/index.tsx
const employeeModule: AppModuleProps = {
  route: {
    key: 'employee',
    path: routePaths.employees, // '/employees'
    title: 'employee.title',
    icon: <Users />,
    Component: EmployeesRedirectPage, // ← redirect sang /employees/directory
    permission: {
      permissions: ['HRM_EM.EMPLOYEE.EMPLOYEE.VIEW'],
      permissionsCondition: 'ANY',
    },
    navMenu: { enable: true, groupLabel: ['app_shell.nav_menu.group.general'] },
    children: [
      {
        key: 'employee-directory',
        path: routePaths.directory, // '/directory'
        title: 'employee.directory.title',
        permission: { permissions: ['HRM_EM.EMPLOYEE.EMPLOYEE.VIEW'] },
        navMenu: {
          enable: true,
          groupLabel: ['app_shell.nav_menu.group.general'],
        },
        Component: EmployeeDirectoryPage,
      },
      {
        key: 'employee-org-units',
        path: routePaths.organizationUnits,
        title: 'employee.organization_unit.title',
        permission: { permissions: ['HRM_EM.EMPLOYEE.ORGANIZATION_UNIT.VIEW'] },
        navMenu: {
          enable: true,
          groupLabel: ['app_shell.nav_menu.group.general'],
        },
        Component: OrganizationUnitsPage,
      },
    ],
  },
  importI18n: locale => async () =>
    (await import(`@/modules/employee/i18n/${locale}.json`)).default,
};
```

Redirect page chỉ replace route, không render UI:

```tsx
// src/modules/employee/pages/employees-redirect.page.tsx
'use client';
import { useEffect } from 'react';
import routePaths from '../route-paths';
import { useAppRouter } from '@/core/router/next';

export default function EmployeesRedirectPage() {
  const router = useAppRouter();
  useEffect(() => {
    router.replace(routePaths.employeesDirectory);
  }, [router]);
  return null;
}
```

> Nếu một entity chỉ có list view (không có trang create/details riêng), **không tạo child routes** và **không thêm nút Create hay IdCell clickable** vào DataTable của nó.

## Route Paths

Route config dùng parent/child tree nên `path` của child route phải là path
relative theo parent. Nếu cần navigate/link bằng URL đầy đủ, khai báo thêm key
absolute riêng.

```ts
// src/modules/employee/route-paths.ts
const routePaths = {
  employees: '/employees', // root absolute
  details: '/details', // child relative: dùng trong route children
  employeesDetails: '/employees/details', // absolute: dùng navigate/link
  create: '/create', // child relative
} as const;

export default routePaths;
```

Khi cần navigate tới details page, dùng absolute path hoặc `relative: true`:

```ts
// Tuyệt đối
router.push(routePaths.employeesDetails, { params: { id, mode: 'READ' } });

// Tương đối (từ /employees → /employees/details)
router.push(routePaths.details, { relative: true, params: { id } });
```

Không dùng absolute child path trong route tree:

```ts
// ❌ SAI — parent /employees + child /employees/details => /employees/employees/details
{
  path: '/employees',
  children: [{ path: '/employees/details' }],
}

// ✅ ĐÚNG
{
  path: '/employees',
  children: [{ path: '/details' }],
}
```

## Đăng ký Module — 5 bước bắt buộc

### 1. Thêm vào `src/modules/index.tsx` (barrel chính)

```ts
import datatableGuideModule from './datatable-guide';
import employeeModule from './employee';
import formGuideModule from './form-guide';
import appBrandingModule from './foundation/app-branding';
import appShellModule from './foundation/app-shell';
import commonModule from './foundation/common';
import identityModule from './foundation/identity';
import sharedComponentsModule from './foundation/shared-components';
import validationModule from './foundation/validation';
import myNewModule from './my-new-module'; // ← Thêm
import { AppModuleProps } from '@/types/core.types';

const modules: AppModuleProps[] = [
  appBrandingModule,
  appShellModule,
  commonModule,
  identityModule,
  sharedComponentsModule,
  validationModule,
  employeeModule,
  formGuideModule,
  datatableGuideModule,
  myNewModule, // ← Thêm vào array
];

export default modules;
```

### 2. Đặt route key trực tiếp trong route config

`RouteKey` là `string`. Dùng string literal kebab-case ổn định trong
`src/modules/<module-name>/index.tsx`:

```ts
{
  key: 'employee',
  children: [
    { key: 'employee-create', ... },
    { key: 'employee-details', ... },
  ],
}
```

### 3. Thêm route path vào `src/modules/route-paths.ts`

```ts
import datatableGuide from './datatable-guide/route-paths';
import employee from './employee/route-paths';
import formGuide from './form-guide/route-paths';
import appShell from './foundation/app-shell/route-paths';
import identity from './foundation/identity/route-paths';
import myNewModule from './my-new-module/route-paths'; // ← Thêm

const routePaths = {
  ...identity,
  ...appShell,
  ...formGuide,
  ...datatableGuide,
  ...employee,
  ...myNewModule, // ← Thêm
};

export default routePaths;
export type AppPath = (typeof routePaths)[keyof typeof routePaths];
```

`src/modules/foundation/identity/route-paths.ts` và `src/modules/foundation/app-shell/route-paths.ts`
cũng đi qua barrel này để các path nền như `root`, `signIn`, `public` dùng được với `AppPath`.
Khi thêm business module mới, chỉ thêm spread của module đó; không tạo lại route path cho các
foundation module không có route như `common`, `validation`, `shared-components`, `app-branding`.

### 4. Thêm permission vào module và barrel `src/modules/permissions.ts`

Permission keys thuộc business module nên khai báo trong file root module
`src/modules/<module-name>/permissions.ts`. File tổng `src/modules/permissions.ts`
merge tất cả module permissions giống pattern `route-paths.ts`.

```ts
// src/modules/employee/permissions.ts (đã có trong codebase)
const employeePermissions = {
  'HRM_EM.EMPLOYEE.EMPLOYEE.CREATE': 'HRM_EM.EMPLOYEE.EMPLOYEE.CREATE',
  'HRM_EM.EMPLOYEE.EMPLOYEE.VIEW': 'HRM_EM.EMPLOYEE.EMPLOYEE.VIEW',
  'HRM_EM.EMPLOYEE.EMPLOYEE.UPDATE': 'HRM_EM.EMPLOYEE.EMPLOYEE.UPDATE',
  'HRM_EM.EMPLOYEE.EMPLOYEE.DELETE': 'HRM_EM.EMPLOYEE.EMPLOYEE.DELETE',
} as const;

export default employeePermissions;
```

```ts
// src/modules/permissions.ts
import employeePermissions from './employee/permissions';
import myNewModulePermissions from './my-new-module/permissions'; // ← Thêm

export const PERMISSIONS = {
  ...employeePermissions,
  ...myNewModulePermissions, // ← Thêm
} as const;

export default PERMISSIONS;

export type PermissionType = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
```

> Permission key format: `<SERVICE>.<MODULE>.<ENTITY>.<ACTION>`. Service code phải match với HttpRequest instance (`HRM_EM` → `hrmemHttpRequest`, `IAM` → `iamHttpRequest`).

### 5. Thêm vào `src/modules/i18n.types.ts`

```ts
import datatableGuide from '@/modules/datatable-guide/i18n/vi.json';
import employee from '@/modules/employee/i18n/vi.json';
import formGuide from '@/modules/form-guide/i18n/vi.json';
import app from '@/modules/foundation/app-branding/i18n/vi.json';
import appShell from '@/modules/foundation/app-shell/i18n/vi.json';
import common from '@/modules/foundation/common/i18n/vi.json';
import identity from '@/modules/foundation/identity/i18n/vi.json';
import sharedComponents from '@/modules/foundation/shared-components/i18n/vi.json';
import validation from '@/modules/foundation/validation/i18n/vi.json';
import myNewModule from '@/modules/my-new-module/i18n/vi.json'; // ← Thêm

export type I18nMessagesType = typeof app &
  typeof appShell &
  typeof common &
  typeof identity &
  typeof sharedComponents &
  typeof validation &
  typeof formGuide &
  typeof datatableGuide &
  typeof employee &
  typeof myNewModule; // ← Thêm
```

## Page Components

Pages là thin wrappers — chỉ render component chính, không có logic phức tạp:

```tsx
// src/modules/employee/pages/employees.page.tsx
'use client';

import { EmployeeDataTable } from '../components/employee-data-table';
import PageContent from '@/core/layout/page-content';

export default function EmployeesPage() {
  return (
    <PageContent>
      <EmployeeDataTable />
    </PageContent>
  );
}
```

```tsx
// src/modules/employee/pages/employees-create.page.tsx
'use client';

import EmployeeCRUD from '../components/employee-crud';

export default function EmployeesCreatePage() {
  return <EmployeeCRUD defaultMode="CREATE" />;
}
```

```tsx
// src/modules/employee/pages/employees-details.page.tsx
'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import EmployeeCRUD from '../components/employee-crud';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import PageContent from '@/core/layout/page-content';
import { useAppRouter } from '@/core/router/next';
import type { CRUDMode } from '@/shared/types/crud';

export default function EmployeesDetailsPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || undefined;
  const mode = searchParams.get('mode');
  const router = useAppRouter();
  const canUpdate = useHasPermissions('HRM_EM.EMPLOYEE.EMPLOYEE.UPDATE');

  // Không có id → quay về list
  React.useEffect(() => {
    if (!id) router.push('/employees');
  }, [id, router]);

  const defaultMode: CRUDMode =
    mode === 'UPDATE' && canUpdate ? 'UPDATE' : 'READ';

  return (
    <PageContent>
      {/* key remount để reset form khi id/mode đổi */}
      <EmployeeCRUD
        key={`${id}-${defaultMode}`}
        defaultMode={defaultMode}
        id={id}
      />
    </PageContent>
  );
}
```

> Trang details mặc định luôn mở `READ`. Chỉ nhận `mode=UPDATE` khi flow chủ động muốn mở thẳng global edit hoặc một sub-mode update rõ ràng, ví dụ action "Edit" từ DataTable. Không tự đổi sang `UPDATE` chỉ vì user có quyền update; permission UPDATE vẫn phải được kiểm ở header/action trước khi cho user vào global edit.

> `CRUDMode` không quyết định page dùng inline edit hay global edit. Với details page, hãy khai báo capability edit riêng ở component CRUD: inline-only, global-only, hoặc inline-and-global. `READ` là trạng thái mặc định của details page. `INLINE_ONLY` có thể bật inline edit ngay trong `READ` khi user có quyền update; `GLOBAL_ONLY` dùng header **Sửa** để vào `UPDATE`; `INLINE_AND_GLOBAL` có thể bật inline edit sẵn và dùng header **Sửa** để chuyển sang global edit.

### CRUD content-form với sections

Khi CRUD form có nhiều nhóm thông tin, tách từng nhóm vào
`components/<name>-crud/sections/...` và để `content-form.tsx` render danh sách
section. Mỗi section tự gọi `useEmployeeCRUDContext()` để đọc `form`, `mode`, `inlineEdit`, `data`:

```tsx
// src/modules/employee/components/employee-crud/content-form.tsx
import React from 'react';
import { useEmployeeCRUDContext } from './context';
import EmployeeBasic from './sections/employee-basic';
import EmployeeContact from './sections/employee-contact';
import EmployeeDocuments from './sections/employee-documents';
import EmployeeJobInfo from './sections/employee-job-info';
import EmployeeQualifications from './sections/employee-qualifications';
import { TranslationsKey } from '@/core/i18n/types';
import { CRUDMode } from '@/shared/types/crud';

const sections: {
  label: TranslationsKey;
  Content: () => React.ReactNode;
  hiddenOnCreate: boolean;
  hidden?: (context: { mode: CRUDMode; hasEmployee: boolean }) => boolean;
}[] = [
  {
    label: 'employee.sections.basic.title',
    Content: EmployeeBasic,
    hiddenOnCreate: false,
  },
  {
    label: 'employee.sections.contact.title',
    Content: EmployeeContact,
    hiddenOnCreate: false,
  },
  {
    label: 'employee.sections.jobInfo.title',
    Content: EmployeeJobInfo,
    hiddenOnCreate: false,
  },
  {
    label: 'employee.sections.qualifications.title',
    Content: EmployeeQualifications,
    hiddenOnCreate: false,
  },
  {
    label: 'employee.sections.documents.title',
    Content: EmployeeDocuments,
    hiddenOnCreate: true,
    hidden: ({ hasEmployee }) => !hasEmployee, // documents cần employeeId, ẩn nếu chưa tạo xong
  },
];

export default function EmployeeCRUDForm() {
  const { mode, data } = useEmployeeCRUDContext();

  const visibleSections = sections.filter(section => {
    if (mode === 'CREATE' && section.hiddenOnCreate) return false;
    if (section.hidden?.({ mode, hasEmployee: !!data?.id })) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {visibleSections.map(({ label, Content }) => (
        <Content key={label} />
      ))}
    </div>
  );
}
```

Mỗi section component tự wrap `SectionPanel` (không wrap ở `content-form.tsx`) để section có thể tùy biến `actions`, `description` riêng:

```tsx
// src/modules/employee/components/employee-crud/sections/employee-basic.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useEmployeeCRUDContext } from '../context';
import FieldInputText from '@/shared/components/form/field-input-text';
import SectionPanel from '@/shared/components/layout/section-panel';
import SubSection from '@/shared/components/layout/sub-section';

export default function EmployeeBasic() {
  const t = useTranslations();
  const { form, mode, inlineEdit } = useEmployeeCRUDContext();
  const fieldMode = mode === 'READ' && !inlineEdit ? 'VIEW' : 'EDIT';

  return (
    <SectionPanel title={t('employee.sections.basic.title')}>
      <div className="space-y-4">
        <SubSection title={t('employee.sections.basic.general')}>
          {/* FieldInputText, FieldInputDate, ... */}
        </SubSection>
        <SubSection title={t('employee.sections.basic.id')}>
          {/* CCCD fields */}
        </SubSection>
      </div>
    </SectionPanel>
  );
}
```

`SectionPanel` là wrapper chuẩn cho các section/panel trong form và detail view. Không tự dựng lại bằng
`<div className="border bg-white rounded-md p-4">` hoặc thêm prefix hiển thị như `#` trước title.
Khi section có nút thao tác phụ, truyền qua prop `actions`; khi cần mô tả ngắn, dùng `description`.

Khi một section có nhiều nhóm con bên trong (sub-group), dùng `SubSection` từ
`@/shared/components/layout/sub-section` thay cho `FieldSet` raw. Chi tiết pattern: xem
[10-code-patterns.md — Pattern: SubSection cho sub-group trong form/detail](./10-code-patterns.md).

## Constants Pattern

Dùng `ConstantBase` từ `@/core/constants`:

```ts
// src/modules/employee/constants/employee.ts
import { GenderType, MaritalStatusType } from '../types/employee';
import { ConstantBase } from '@/core/constants';

export const CONST_GENDER: ConstantBase<GenderType>[] = [
  { value: 'Male', label: 'employee.constants.gender.male' },
  { value: 'Female', label: 'employee.constants.gender.female' },
] as const;

export const CONST_MARITAL_STATUS: ConstantBase<MaritalStatusType>[] = [
  { value: 'Single', label: 'employee.constants.marital.single' },
  { value: 'Married', label: 'employee.constants.marital.married' },
  { value: 'Divorced', label: 'employee.constants.marital.divorced' },
] as const;
```

Dùng `constGet` để lấy label (non-React context, vd column cell):

```tsx
import { constGet } from '@/core/constants';
constGet(CONST_GENDER, value, 'label'); // → TranslationsKey
```

Dùng `useConstWithTranslations` khi cần label đã được translate (vd: truyền vào Select options trong form):

```tsx
import { useConstWithTranslations } from '@/core/constants';
const genderOptions = useConstWithTranslations(CONST_GENDER);
// → [{ value: 'Male', label: 'Nam' }, { value: 'Female', label: 'Nữ' }]
```
