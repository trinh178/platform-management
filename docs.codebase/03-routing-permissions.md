# 03 — Routing & Permissions

## Routing Architecture

App dùng Next.js App Router với **route group `(em)`** chứa layout chính.
File `src/app/(em)/[...slug]/page.tsx` là catch-all — tất cả module routes đều render qua đây.

## ⚠️ Giới hạn: Không hỗ trợ Path Parameters

**Source code hiện tại chưa hỗ trợ dynamic path parameters ở cấp module** (ví dụ `/employees/:id`). Hệ thống routing dùng catch-all `[...slug]` và match route bằng string path tĩnh, không parse `:id` hay `[id]` trong `PageRouteConfigProps.path`.

**Dùng query parameters để thay thế:**

```ts
// ❌ KHÔNG hỗ trợ — path parameter
{
  path: '/employees/:id',  // sẽ KHÔNG match được
  ...
}

// ✅ ĐÚNG — dùng query parameter
{
  path: '/details',       // path tĩnh
  ...
}
// URL thực tế: /employees/details?id=abc123
```

**Navigate đến details page:**

```ts
// ✅ ĐÚNG
router.push('/details', { relative: true, params: { id: employee.id } });
// → /employees/details?id=abc123
```

**Đọc id trong page component:**

```ts
// ✅ ĐÚNG
import { useSearchParams } from 'next/navigation';

const searchParams = useSearchParams();
const id = searchParams.get('id') ?? '';
```

## PageRouteConfigProps

`RouteKey` là `string`. Dùng string literal kebab-case ổn định, ví dụ
`'employee'`, `'employee-create'`, `'request-details'`.

```ts
interface PageRouteConfigProps {
  path: string; // Relative path (không có trailing slash)
  key: RouteKey; // string literal kebab-case ổn định
  title: TranslationsKey; // Phải có trong i18n
  Component?: React.ComponentType<unknown>;
  icon?: React.ReactNode;
  disableLayout?: boolean; // true = ẩn sidebar/header (vd: sign-in)
  permission?: PermissionOptions;
  children?: PageRouteConfigProps[];
  childrenHandleNotFound?: string | React.ReactNode;
  navMenu?: NavMenuOptions;
}
```

Với route con, `path` phải relative theo parent. Ví dụ parent `/employees` thì
child dùng `/details`, không dùng `/employees/details`; router sẽ tự join thành
`/employees/details`.

## PermissionOptions

`PermissionType` được export từ `@/modules/permissions`. Khi thêm permission mới,
khai báo trong `src/modules/<module-name>/permissions.ts` và merge vào
`src/modules/permissions.ts`.

```ts
interface PermissionOptions {
  allowAnyone?: boolean; // true = không cần auth, không cần permission
  onlyGuest?: boolean; // true = chỉ accessible khi CHƯA đăng nhập (sign-in page)
  permissions?: PermissionType[]; // Danh sách permissions cần có
  permissionsCondition?: 'ALL' | 'ANY'; // default 'ALL'
  handleUnGuest?: string | React.ReactNode; // Redirect khi đã login mà vào guest-only route
  handleUnauthenticated?: string | React.ReactNode; // Redirect khi chưa login
  handleNoPermission?: string | React.ReactNode; // Redirect/component khi thiếu permission
}
```

### Permission Patterns phổ biến

```ts
// Route cần đăng nhập, không cần permission cụ thể (dashboard)
permission: {
  permissions: [],
}

// Route cần permission VIEW
permission: {
  permissions: ['HRM_EM.EMPLOYEE.EMPLOYEE.VIEW'],
}

// Route cần một trong nhiều permissions (ANY) — vd Employee module: xem nhân viên hoặc đơn vị
permission: {
  permissions: [
    'HRM_EM.EMPLOYEE.EMPLOYEE.VIEW',
    'HRM_EM.EMPLOYEE.ORGANIZATION_UNIT.VIEW',
  ],
  permissionsCondition: 'ANY',
}

// Route chỉ cho guest (sign-in)
permission: {
  onlyGuest: true,
  handleUnGuest: '/',
}

// Route public (không cần auth)
permission: {
  allowAnyone: true,
}
```

## NavMenuOptions

```ts
interface NavMenuOptions {
  enable: boolean;
  groupLabel: TranslationsKey[]; // Label của nhóm trong sidebar
}
```

## Sidebar Behavior: Route với children có navMenu

**Khi một route có children xuất hiện trong sidebar (`navMenu: { enable: true }`)**, click vào item cha trong sidebar chỉ **toggle open/close group** — **KHÔNG navigate** đến route đó.

→ Nếu route cha cần redirect (ví dụ: `/employees` → `/employees/directory`), phải dùng **Redirect Page pattern**:

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

```tsx
// ✅ ĐÚNG — root dùng redirect page, mỗi sub-page là child có navMenu
{
  key: 'employee',
  path: '/employees',
  Component: EmployeesRedirectPage,   // ← chỉ redirect, không render UI
  navMenu: { enable: true, groupLabel: ['app_shell.nav_menu.group.general'] },
  children: [
    {
      key: 'employee-directory',
      path: '/directory',
      Component: EmployeeDirectoryPage,
      navMenu: { enable: true, groupLabel: ['app_shell.nav_menu.group.general'] },  // ← xuất hiện trong sidebar
    },
    {
      key: 'employee-org-units',
      path: '/organization-units',
      Component: OrganizationUnitsPage,
      navMenu: { enable: true, groupLabel: ['app_shell.nav_menu.group.general'] },
    },
  ],
}
```

> **Lưu ý:** Module chỉ có một route duy nhất không cần redirect page vì không có sibling nav items. Pattern này chỉ cần thiết khi module có **nhiều child routes cùng xuất hiện trong sidebar**.

## Khi nào KHÔNG tạo child routes create/details

Chỉ tạo `create` và `details` child routes khi có page tương ứng. Nếu entity chỉ có list view (không có create form hay details page riêng), **không tạo route con** và **không thêm nút Create hoặc ID clickable** vào DataTable.

## useAppRouter — KHÔNG dùng `useRouter` từ next/navigation

```ts
// ❌ FORBIDDEN — ESLint sẽ báo lỗi
import { useRouter } from 'next/navigation';

// ✅ ĐÚNG
import { useAppRouter } from '@/core/router/next';

function MyComponent() {
  const router = useAppRouter();

  // Push với query params
  router.push('/details', {
    relative: true, // Relative to current path
    params: { id: '123' }, // Appended as ?id=123
  });

  // Replace
  router.replace('/sign-in');
}
```

### Query-only navigation và NProgress

`useAppRouter` hỗ trợ option mở rộng qua `src/types/next.d.ts`:

```ts
router.push('/details', {
  relative: true,
  params: { id: '123' },
});
```

Quy ước:

- `relative` và `params` là option của wrapper `useAppRouter`, không phải option native của Next.js. Wrapper phải xử lý chúng trước khi gọi `router.push/replace` thật.
- `params` được append vào URL dưới dạng query string. Nếu href đã có query/hash, phải append đúng dạng `?a=1&b=2#hash`, không tạo URL sai kiểu `?a=1?b=2`.
- Navigation chỉ thay đổi query string trên cùng pathname không được coi là đổi route. Không start `nprogress` cho query-only navigation vì effect `nprogress.done()` thường phụ thuộc pathname; nếu pathname không đổi, progress bar có thể bị kẹt.
- Hàm so sánh route dùng cho loading/navigation phải so pathname thật, bỏ qua query string và hash.

## AppLink — KHÔNG dùng `Link` từ next/link

```tsx
// ❌ FORBIDDEN
import Link from 'next/link';

// ✅ ĐÚNG
import { AppLink } from '@/core/router/next';

<AppLink href="/employees" relative params={{ tab: 'basic' }}>
  Xem hồ sơ
</AppLink>;
```

Quy ước khi dùng và sửa `AppLink`:

- `AppLink` phải dùng `onNavigate` của Next.js để xử lý side effect của client-side navigation như `nprogress.start()`. Không dùng `onClick` cho side effect navigation vì `onClick` vẫn chạy khi Ctrl/Cmd click, mở tab mới, external URL hoặc download.
- Vẫn truyền `onClick` của caller xuống `<Link>` để giữ hành vi click thông thường.
- Nếu caller truyền `onNavigate` và gọi `preventDefault()`, wrapper không được start `nprogress`.
- `AppLink` phải hỗ trợ `href` dạng string và `UrlObject`; không dùng `href.toString()` với `UrlObject` vì có thể ra `[object Object]`.
- `AppLink` dùng cùng convention `relative` và `params` với `useAppRouter`.

## useHasPermissions

```ts
import { useHasPermissions } from '@/core/auth/useHasPermissions';

// Check một permission
const canCreate = useHasPermissions('HRM_EM.EMPLOYEE.EMPLOYEE.CREATE');

// Check tất cả permissions (default 'every')
const canFullyEdit = useHasPermissions([
  'HRM_EM.EMPLOYEE.EMPLOYEE.VIEW',
  'HRM_EM.EMPLOYEE.EMPLOYEE.UPDATE',
]);

// Check ít nhất một permission ('any')
const canDoSomething = useHasPermissions(
  ['HRM_EM.EMPLOYEE.EMPLOYEE.VIEW', 'HRM_EM.EMPLOYEE.EMPLOYEE.UPDATE'],
  'any',
);
```

> Tham số thứ hai của `useHasPermissions` là `'every' | 'any'` (lowercase), khác với `permissionsCondition: 'ALL' | 'ANY'` (uppercase) trong `PermissionOptions` của route config.

## Route Guards

Route authorization được xử lý tự động bởi `RouteAuthorizationGuard`.
AI **không cần tự viết guards** trong components.

Các `missingRequiredAccess` values:

- `'NONE'` — được phép truy cập
- `'GUEST'` — user đã login mà cố vào guest-only route → redirect `handleUnGuest`
- `'AUTHENTICATED_USER'` — chưa login → redirect `handleUnauthenticated`
- `'AUTHORIZED_USER'` — thiếu permission → redirect/render `handleNoPermission`

## rootRoute & signInRoute

Khi user vào `/`, app tự động redirect đến route đầu tiên mà user có quyền truy cập.

```ts
// Trong router config
routerConfig.signInRoute = {
  key: 'sign-in',
  path: '/sign-in',
  externalPath: process.env.NEXT_PUBLIC_SIGNIN_URL, // SSO external URL (nếu có)
};
```

`routerConfig` vẫn là nguồn cho root/sign-in router config và `externalPath`.
Các path nền được expose qua foundation modules:

- `src/modules/foundation/identity/route-paths.ts`: `root`, `signIn`
- `src/modules/foundation/app-shell/route-paths.ts`: `public`

Sau đó các path này được merge vào `src/modules/route-paths.ts` cùng business modules:

```ts
import routePaths from '@/modules/route-paths';

routePaths.root; // '/'
routePaths.signIn; // '/sign-in'
routePaths.public; // '/public'
```
