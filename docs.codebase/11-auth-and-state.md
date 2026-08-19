# 11 — Authentication & Global State

## Authentication Flow

App dùng **next-auth v4 (JWT strategy)**. Flow:

1. User submit credentials → `useSignIn()` → NextAuth `signIn('credentials', ...)`
2. Server-side `authorize()` gọi `authApi.signin()` → trả về `{ accessToken, refreshToken, ... }`
3. NextAuth lưu vào JWT cookie (`next-auth.session-token`)
4. App load → `AppInitializer` gọi `useMe()` → set `userPermissions`, `isAuthenticated` vào `useIdentityStore`; set `grantedPageRouteConfigs` vào `useAppShellStore`
5. Token expired tự refresh qua `authApi.refreshToken()` trong NextAuth callback
6. 401 từ API → `iamUnauthorizedHandler` tự sign out + redirect

**AI không cần xử lý auth token thủ công** — `HttpRequest` tự inject `Authorization: Bearer ...` ở cả 2 đường: client gọi qua proxy (proxy gắn token), còn SSR gắn token qua `requestInterceptor: iamAuthenticationHandler` (đọc `getServerSession`). Xem [04 — API Proxy Architecture](./04-api-services.md#api-proxy-architecture).

---

## Lấy thông tin user hiện tại

### Client component — dùng `useMe`

```tsx
'use client';
import { useMe } from '@/modules/foundation/identity/services/users/users.queries';

function Profile() {
  const me = useMe(undefined, { meta: { notifyError: false } });

  if (!me.data) return null;
  return <div>Hello {me.data.firstName}</div>;
}
```

`User` type ([users.api.ts](src/modules/foundation/identity/services/users/users.api.ts)):

```ts
import { RoleType } from '@/modules/foundation/identity/constants/roles';
import { PermissionType } from '@/modules/permissions';

interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  roles: RoleType[];
  permissions: PermissionType[];
}
```

### Server component / API route — dùng `getServerSession`

```ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth';

const session = await getServerSession(authOptions);
if (!session?.accessToken) {
  return new Response('Unauthorized', { status: 401 });
}
// session.accessToken, session.error
```

---

## Sign Out

```ts
import useAppSignOut, { appSignOut } from '@/core/auth/signOut';

// Trong component
function LogoutButton() {
  const signOut = useAppSignOut();
  return <Button onClick={() => signOut.mutate()}>Đăng xuất</Button>;
}

// Trực tiếp (ngoài component, ví dụ trong interceptor)
await appSignOut({ redirect: true });
```

`appSignOut` tự xóa flag `___HAS_SIGNIN` trong localStorage và redirect về sign-in route.

---

## Permission Check

Permission registry toàn app nằm ở `src/modules/permissions.ts`; từng module khai báo
permission riêng trong `src/modules/<module-name>/permissions.ts`. Import
`PermissionType` từ `@/modules/permissions`, không tạo registry trong `shared`.

> ⚠️ **Mock mode cảnh báo bypass:** [src/modules/foundation/identity/services/users/users.api.ts](src/modules/foundation/identity/services/users/users.api.ts) override `response.permissions = Object.values(PERMISSIONS)` khi `NEXT_PUBLIC_MOCK_API=true`. Nếu lỡ bật env này ở production, **mọi user sẽ có toàn quyền**. Luôn check `NEXT_PUBLIC_MOCK_API !== 'true'` trước khi deploy.

### useHasPermissions hook

```ts
import { useHasPermissions } from '@/core/auth/useHasPermissions';

// Một permission
const canCreate = useHasPermissions('HRM_EM.EMPLOYEE.EMPLOYEE.CREATE');

// Nhiều permission — phải có TẤT CẢ (default 'every')
const canFullyEdit = useHasPermissions([
  'HRM_EM.EMPLOYEE.EMPLOYEE.VIEW',
  'HRM_EM.EMPLOYEE.EMPLOYEE.UPDATE',
]);

// Nhiều permission — chỉ cần MỘT trong số đó
const canDoSomething = useHasPermissions(
  ['HRM_EM.EMPLOYEE.EMPLOYEE.VIEW', 'HRM_EM.EMPLOYEE.EMPLOYEE.UPDATE'],
  'any',
);
```

> **Lưu ý:** second param của `useHasPermissions` là `'every' | 'any'` (lowercase), khác với `permissionsCondition: 'ALL' | 'ANY'` trong `PermissionOptions` của route config.

### Pattern: conditional render

```tsx
const canDelete = useHasPermissions('HRM_EM.EMPLOYEE.EMPLOYEE.DELETE');

return (
  <div>
    {canDelete && (
      <Button variant="destructive" onClick={handleDelete}>
        Xóa
      </Button>
    )}
  </div>
);
```

### Pattern: guard update mode dựa trên permission

```tsx
// Details page — chỉ nhận UPDATE khi URL/flow yêu cầu và user có quyền UPDATE.
// Không tự mở UPDATE chỉ vì user có quyền update.
const canUpdate = useHasPermissions('HRM_EM.EMPLOYEE.EMPLOYEE.UPDATE');
const defaultMode: CRUDMode =
  mode === 'UPDATE' && canUpdate ? 'UPDATE' : 'READ';
return <EmployeeCRUD defaultMode={defaultMode} id={id} />;
```

---

## Identity Store — `useIdentityStore`

Store Zustand cho identity/session state. Store này chỉ giữ thông tin xác thực và permission của user,
không giữ route/layout/sidebar state.

```ts
import { useIdentityStore } from '@/modules/foundation/identity/stores/identity.store';
```

### Identity state

| Key               | Type               | Mô tả                                        |
| ----------------- | ------------------ | -------------------------------------------- |
| `isAuthenticated` | `boolean`          | User đã login chưa (set sau khi fetch `/me`) |
| `userPermissions` | `PermissionType[]` | Permissions của user hiện tại                |

### Identity actions

```ts
const setIsAuthenticated = useIdentityStore(s => s.setIsAuthenticated);
const setUserPermissions = useIdentityStore(s => s.setUserPermissions);
const resetIdentity = useIdentityStore(s => s.resetIdentity);
```

### Identity selector pattern — bắt buộc

```ts
// ✅ ĐÚNG — selector function (chỉ re-render khi field này đổi)
const isAuthenticated = useIdentityStore(state => state.isAuthenticated);

// ❌ SAI — lấy toàn bộ store (re-render mỗi khi BẤT KỲ field nào đổi)
const store = useIdentityStore();
```

---

## App Shell Store — `useAppShellStore`

Store Zustand cho app shell/runtime state. Store này giữ trạng thái khởi tạo app, route đã được grant,
route hiện tại, sidebar và translation function dùng ngoài React context. Không đặt auth/session state
trong store này; phần đó thuộc `useIdentityStore`.

```ts
import { useAppShellStore } from '@/modules/foundation/app-shell/stores/app-shell.store';
```

### App shell state

| Key                             | Type                            | Mô tả                                                 |
| ------------------------------- | ------------------------------- | ----------------------------------------------------- |
| `isInitAppFetched`              | `boolean`                       | App đã fetch xong `/me` chưa                          |
| `grantedPageRouteConfigs`       | `GrantedPageRouteConfigProps[]` | Routes user có quyền truy cập (đã tính level)         |
| `currentGrantedPageRouteConfig` | `GrantedPageRouteConfigProps?`  | Route đang active                                     |
| `sidebarOpen`                   | `boolean?`                      | Sidebar đang mở/đóng                                  |
| `sidebarMode`                   | `'persistent' \| 'temporary'?`  | Mode hiển thị sidebar                                 |
| `appHeaderVisible`              | `boolean`                       | App header dang hien/bi an                            |
| `translations`                  | `TranslationsFn?`               | Hàm translate được inject bởi `core/i18n/InjectStore` |

### App shell actions

```ts
const setIsInitAppFetched = useAppShellStore(s => s.setIsInitAppFetched);
const setGrantedPageRouteConfigs = useAppShellStore(
  s => s.setGrantedPageRouteConfigs,
);
const openSidebar = useAppShellStore(s => s.openSidebar);
const closeSidebar = useAppShellStore(s => s.closeSidebar);
const setSidebarMode = useAppShellStore(s => s.setSidebarMode);
const showAppHeader = useAppShellStore(s => s.showAppHeader);
const hideAppHeader = useAppShellStore(s => s.hideAppHeader);
const setTranslations = useAppShellStore(s => s.setTranslations);
const resetAppShell = useAppShellStore(s => s.resetAppShell);
// ... etc
```

### Sidebar controlled state

`SidebarProvider` trong app-shell layout phải được bind với `useAppShellStore.sidebarOpen` và `openSidebar` / `closeSidebar` để mọi component/page có thể điều khiển trạng thái sidebar qua store.

```tsx
const sidebarOpen = useAppShellStore(state => state.sidebarOpen);
const openSidebar = useAppShellStore(state => state.openSidebar);
const closeSidebar = useAppShellStore(state => state.closeSidebar);

const setSidebarOpen = React.useCallback(
  (open: boolean) => {
    if (open) openSidebar();
    else closeSidebar();
  },
  [closeSidebar, openSidebar],
);

<SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
  {/* app shell */}
</SidebarProvider>;
```

Khi một page cần tự thu nhỏ sidebar để ưu tiên không gian làm việc, gọi `closeSidebar()` trong `useEffect` của page/component con. Không thao tác trực tiếp với DOM hoặc context nội bộ của shared sidebar từ business module.

```tsx
const closeSidebar = useAppShellStore(state => state.closeSidebar);

React.useEffect(() => {
  closeSidebar();
}, [closeSidebar]);
```

### App header visibility

`AppHeader` co the duoc an/hien qua `useAppShellStore.appHeaderVisible` va cac action `showAppHeader` / `hideAppHeader`. Layout app-shell phai render mot nut phuc hoi khi header dang an de user co duong mo lai header ma khong can reload page.

Khi mot page can uu tien khong gian lam viec, goi `hideAppHeader()` trong `useEffect` cua page/component con. Khong thao tac truc tiep voi DOM hoac set CSS global de an header.

```tsx
const hideAppHeader = useAppShellStore(state => state.hideAppHeader);

React.useEffect(() => {
  hideAppHeader();
}, [hideAppHeader]);
```

Nếu widget hoặc component nhúng trong sidebar có prop phụ thuộc vào trạng thái `open` và không update ổn định sau khi mount, thêm `key` theo trạng thái hiển thị để remount component khi đổi giữa expanded/collapsed.

```tsx
<SomeSidebarWidget
  key={open ? 'widget-expanded' : 'widget-collapsed'}
  variant={open ? 'full' : 'icon'}
/>
```

### App shell selector pattern — bắt buộc

```ts
// ✅ ĐÚNG — selector function (chỉ re-render khi field này đổi)
const isInitAppFetched = useAppShellStore(state => state.isInitAppFetched);

// ❌ SAI — lấy toàn bộ store (re-render mỗi khi BẤT KỲ field nào đổi)
const store = useAppShellStore();
```

---

## LocalStorage Wrapper

**KHÔNG dùng `localStorage` trực tiếp.** Dùng wrapper typed từ `@/core/storage`:

```ts
import { storage } from '@/core/storage';

// Set/get (auto JSON serialize)
storage.set('___HAS_SIGNIN', true);
const hasSignedIn = storage.get<boolean>('___HAS_SIGNIN');

// Check tồn tại (1 hoặc nhiều keys)
if (storage.exist('___HAS_SIGNIN')) { ... }

// Xóa
storage.remove('___HAS_SIGNIN');

// Clear all (trừ một số keys)
storage.clear('___HAS_SIGNIN');  // Xóa hết trừ key này
```

### Storage Keys phải declare

Mỗi key dùng trong `storage.set()`/`storage.get()` phải có trong type `StorageKey` (declare ở [storage-key.d.ts](src/core/storage/storage-key.d.ts)). Thêm key mới → declare type trước.

---

## Session-related Routes

```ts
import { routerConfig } from '@/core/router/config';
import routePaths from '@/modules/route-paths';

routerConfig.rootRoute.path; // '/'
routerConfig.signInRoute.path; // '/sign-in'
routerConfig.signInRoute.externalPath; // SSO URL nếu có

routePaths.root; // '/'
routePaths.signIn; // '/sign-in'
routePaths.public; // '/public'
```

`routerConfig` dùng cho cấu hình router/SSO; `routePaths` dùng khi cần typed
app path cho navigation/link trong UI.

Khi sign in xong app sẽ auto-redirect về root route, từ đó router engine sẽ tự pick route đầu tiên user có quyền.
