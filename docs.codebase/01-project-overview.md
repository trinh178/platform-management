# 01 — Project Overview

## Tech Stack

| Layer         | Thư viện                                              | Ghi chú                            |
| ------------- | ----------------------------------------------------- | ---------------------------------- |
| Framework     | Next.js ^16.2.x (App Router)                          |                                    |
| Language      | TypeScript ^5.9 (strict mode)                         |                                    |
| Styling       | Tailwind CSS v4 + shadcn/ui (Radix UI)                |                                    |
| State         | Zustand ^5 (global), React Query ^5 (server state)    |                                    |
| Forms         | react-hook-form ^7 + Zod                              | Source đang import trực tiếp `zod` |
| HTTP          | Custom `HttpRequest` class (wrapper của fetch + `qs`) |                                    |
| Icons         | Lucide React + @tabler/icons-react                    |                                    |
| i18n          | next-intl ^4 (vi / en)                                |                                    |
| Table         | @tanstack/react-table ^8                              |                                    |
| Notifications | sonner ^2 (wrapped bởi `notify`)                      |                                    |
| Auth          | next-auth v4 (JWT strategy)                           |                                    |
| Date          | moment, date-fns                                      |                                    |
| Misc          | lodash, uuid, recharts, dnd-kit, vaul, nprogress      |                                    |

> **Lưu ý Zod:** Source đang dùng `import z from 'zod'`. Nếu dependency graph thay đổi/cleanup `package.json`, hãy khai báo `zod` trực tiếp thay vì dựa vào transitive dependency.

## Rebrand Checklist

Khi fork codebase sang app mới hoặc đổi tên app, cập nhật **tất cả** các vị trí sau:

| File                                                | Trường cần đổi                                                                                             |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `package.json`                                      | `name`                                                                                                     |
| `.github/workflows/ci.dev.yml`                      | `name` (workflow name), `IMAGE_NAME`, `RUNTIME_ENV_FILE`                                                   |
| `.env.example`                                      | `NEXT_PUBLIC_APP_KEY` (app identifier cho AppSwitcher), `NEXT_PUBLIC_APIGATEWAY_<SERVICE>` (service paths) |
| `src/modules/foundation/app-branding/i18n/vi.json`  | `app.name`, `app.description`, `app.shortName`, `app.iconAlt`                                              |
| `src/modules/foundation/app-branding/i18n/en.json`  | `app.name`, `app.description`, `app.shortName`, `app.iconAlt`                                              |
| `src/modules/foundation/app-branding/app-config.ts` | `icon`, `logo` (trỏ sang file mới trong `src/assets/`)                                                     |
| `src/modules/foundation/app-branding/theme.css`     | Hue number trong tất cả `oklch(...)` (vd: `264` → hue mới)                                                 |
| `src/app/favicon.ico`                               | Thay file favicon mới                                                                                      |
| `src/assets/icons/app-icon.png`                     | Thay file icon mới                                                                                         |
| `src/assets/images/logo.png`                        | Thay file logo mới                                                                                         |

## Cấu trúc thư mục

```text
src/
├── app/                        # Next.js App Router pages
│   ├── (em)/                   # Route group cho authenticated app
│   │   ├── layout.tsx          # Layout chính (sidebar, header)
│   │   └── [...slug]/page.tsx  # Catch-all — TẤT CẢ module routes render qua đây
│   ├── api/
│   │   ├── auth/[...nextauth]/ # NextAuth endpoint
│   │   ├── mock/switch-user/   # Mock user switcher (chỉ khi NEXT_PUBLIC_MOCK_API=true)
│   │   └── proxy/[...path]/    # API proxy (forward request + inject Bearer token)
│   ├── sign-in/page.tsx
│   └── layout.tsx              # Root layout (providers + WSR script)
│
├── assets/                     # App-level assets: icon, logo, favicon — dùng chung toàn app
│   ├── icons/                  # app-icon.png, ...
│   └── images/                 # logo.png, ...
│
├── core/                       # Framework-level utilities (KHÔNG chứa business logic)
│   ├── AppInitializer.tsx      # Fetch /me, populate stores, mount RouteAuthorizationGuard
│   ├── Providers.tsx           # Bọc QueryClient, I18n, Theme, Confirm, AppContext, Loading
│   ├── RouteAuthorizationGuard.tsx # Match path → kiểm tra missingRequiredAccess
│   ├── auth/                   # useSignIn, signOut, useHasPermissions, NextAuth config
│   ├── common/                 # Store, LoadingController, ModalController (low-level primitives)
│   ├── confirmation/           # useConfirm() modal
│   ├── constants/              # ConstantBase, constGet, useConstWithTranslations
│   ├── context/                # AppContextProvider
│   ├── form/                   # createFormValidateResolverWithTranslations, useFormValidateResolver
│   ├── i18n/                   # next-intl setup, gT (global translations)
│   ├── loading/                # appLoadingControl (spinner & prevent-interactive)
│   ├── layout/                 # PageContent, PageContentHeader, BackButton, PageContentSkeleton
│   ├── modal/                  # appModalControl + AppWrapper
│   ├── network/                # HttpRequest, iam/hrmem-http-request, service-registry, appfetch, mock-utils
│   ├── notification/           # notify (wrapper của sonner toast)
│   ├── query/                  # useAppQuery, useAppMutation, factories per service
│   ├── router/                 # useAppRouter, AppLink, route config types, rootRoute
│   ├── storage/                # localStorage wrapper (typed)
│   └── theme/                  # AppThemeProvider
│
├── mock/                       # Mock API handlers (chỉ load khi NEXT_PUBLIC_MOCK_API=true, server-side)
│   ├── MockUserSwitcher.tsx    # Floating button cho phép switch user lúc dev
│   ├── constants.ts            # CURRENT_USER_ID mặc định
│   ├── mock-context.ts         # globalThis.__mockCurrentUserId — đọc bởi mock routes
│   ├── iam.ts                  # Mock cho iamHttpRequest (hiện đang disabled — backend trả thật)
│   └── hrmem/                  # Mock cho hrmemHttpRequest (modular theo entity)
│       ├── index.ts            # Barrel: import './employee', './organization-unit', ...
│       ├── mock-types.ts       # MockAuditFields dùng chung
│       ├── employee/
│       │   ├── index.ts        # import './routes'
│       │   ├── mock-types.ts   # Type mở rộng cho mock store
│       │   ├── stores.ts       # In-memory store (employeeStore, documentStore, ...)
│       │   ├── helpers.ts      # buildEmployeeDetails, mergeEmployee, search/filter predicates, ...
│       │   └── routes.ts       # addMockRoute cho từng endpoint
│       └── organization-unit/  # Cấu trúc tương tự
│
├── modules/                    # Feature modules + foundation modules
│   ├── foundation/             # Các module nền dùng chung toàn app
│   │   ├── app-branding/       # Branding: tên/mô tả (i18n), icon, logo (app-config.ts), màu sắc (theme.css)
│   │   ├── app-shell/          # Layout shell, sidebar/header, public page, shell store
│   │   ├── common/             # i18n dùng chung: control, notify, table, constants, label
│   │   ├── identity/           # Sign-in page, auth API, /me query, identity store
│   │   ├── shared-components/  # i18n và tài nguyên liên quan tới shared components
│   │   └── validation/         # Validation i18n messages + rules helpers
│   ├── employee/               # ★ Module mẫu — CRUD đầy đủ (HRM_EM service)
│   ├── form-guide/             # Guide/demo cho FieldInput components
│   ├── datatable-guide/        # Guide/demo cho DataTable components
│   ├── index.tsx               # Barrel: đăng ký tất cả modules vào app
│   ├── i18n.types.ts           # Type union cho tất cả i18n messages
│   ├── permissions.ts          # Barrel: merge business module permissions + PermissionType
│   └── route-paths.ts          # Barrel: merge route paths
│
├── shared/                     # Shared UI components, types, utils
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base components (button, dialog, sidebar, ...)
│   │   ├── form/               # FieldInput* components (20+ variants) + FieldGroupInlineEdit
│   │   ├── data-table/         # DataTable server/static/plain + shared table helpers
│   │   ├── inputs/             # Select, Combobox, DatePicker, FileUpload, TreeSelect, ...
│   │   ├── layout/             # Shared layout primitives (SectionPanel, SubSection, ...)
│   │   ├── address/            # AddressPicker (Việt Nam: tỉnh/huyện/xã)
│   │   └── feedback/           # Visual helpers (BlinkHighlightContainer, ...)
│   ├── constants/              # countries.json, defaultFormatDate, defaultListRequest
│   ├── hooks/                  # useDebounceCallback, useMobile
│   ├── lib/                    # cn() utility
│   ├── types/                  # Pagination, CRUDMode, AuditFields, utility types
│   ├── utils/                  # formatDate, getMessage, joinURL, getFullName, renderValue, ...
│   └── wsr/                    # Web Shared Remote — wrapper components cho widgets remote
│       └── widgets/            # AppSwitcher, ...
│
├── styles/                     # Global CSS, animations, themes
│   ├── globals.css
│   ├── theme.css
│   ├── loading.css
│   ├── nprogress.css
│   └── themes/                 # light, dark theme variables
│
└── types/                      # Global type declarations (next-auth.d.ts, next-intl.d.ts, tanstack-table.d.ts, ...)
```

## Quy ước đặt tên

### Files

- **Components**: `PascalCase.tsx` — `EmployeeCRUD.tsx`, `DataTable.tsx`
- **Hooks**: `camelCase.ts` — `useSignIn.ts`, `useHasPermissions.ts` (standalone core hooks; module hooks đặt trong `*.queries.ts` / `*.mutation.ts`)
- **API/Services**: `kebab-case.api.ts` — `employee.api.ts`
- **API types**: `kebab-case.api-types.ts` — `employee.api-types.ts`
- **Queries**: `kebab-case.queries.ts` — `employee.queries.ts`
- **Mutations**: `kebab-case.mutation.ts` — `employee.mutation.ts`
- **Query keys**: `kebab-case.query-keys.ts` — `employee.query-keys.ts`
- **Types**: `kebab-case.ts` — `employee.ts`
- **Constants**: `kebab-case.ts` — `employee.ts`, `pagination.ts`
- **Module permissions**: `permissions.ts` — đặt ở root module, ví dụ `src/modules/employee/permissions.ts`
- **Pages**: `kebab-case.page.tsx` — `employees.page.tsx`, `employees-create.page.tsx`, `employees-details.page.tsx`
- **i18n**: `vi.json`, `en.json`

### Biến & Functions

- **Constants array**: `CONST_GENDER`, `CONST_EMPLOYEE_QUALIFICATION` (SCREAMING_SNAKE_CASE)
- **Permissions**: `'HRM_EM.EMPLOYEE.EMPLOYEE.VIEW'` (dot-separated strings, format `<SERVICE>.<MODULE>.<ENTITY>.<ACTION>`)
- **Route keys**: string literal dạng kebab-case — `'employee'`, `'employee-create'`, `'employee-details'`

## Path Alias

Chỉ dùng `@/` (trỏ tới `src/`):

```ts
import { notify } from '@/core/notification';
import { DataTableServer } from '@/shared/components/data-table/server';
import { useEmployees } from '@/modules/employee/services/employee.queries';
```

## TypeScript Config

- `strict: true` — không được tắt
- `moduleResolution: bundler` — không dùng `.js` extension trong imports
- `paths: { "@/*": ["./src/*"] }`

## Environment Variables

Các env vars nên được declare type trong [`env.d.ts`](env.d.ts). Khi thêm hoặc dùng env var mới, cập nhật `.env.example` và `env.d.ts` cùng lúc để AI/codegen không sinh code thiếu type.

| Var                                      | Scope           | Mô tả                                                                        |
| ---------------------------------------- | --------------- | ---------------------------------------------------------------------------- |
| `APIGATEWAY_BASE_URL`                    | **Server only** | URL backend gateway thật (server-side dùng trực tiếp)                        |
| `<SERVICE>_DIRECT_URL`                   | **Server only** | (Optional, dev) Bypass gateway → service local, vd `AST_DIRECT_URL`          |
| `NEXT_PUBLIC_APIPROXY_BASE_URL`          | Client          | URL của Next.js proxy (client gọi qua đây)                                   |
| `NEXT_PUBLIC_APIGATEWAY_IAM`             | Client          | Path segment cho IAM service (vd `iam`); dùng trong `iam-http-request.ts`    |
| `NEXT_PUBLIC_APIGATEWAY_HRM_EM`          | Client          | Path segment cho HRM Employee service; dùng trong `hrmem-http-request.ts`    |
| `NEXT_PUBLIC_APIGATEWAY_AST`             | Client          | Path segment cho Asset service; dùng trong `ast-http-request.ts`             |
| `NEXT_PUBLIC_MOCK_API`                   | Both            | `'true'` để bật mock API (chỉ server-side)                                   |
| `NEXT_PUBLIC_SIGNIN_URL`                 | Client          | URL sign-in (có thể là SSO external)                                         |
| `NEXT_PUBLIC_WEB_SHARED_REMOTE_BASE_URL` | Client          | Base URL của WSR widgets                                                     |
| `NEXT_PUBLIC_APP_KEY`                    | Client          | Định danh app (dùng cho AppSwitcher widget) — vd `asset-service`             |
| `NEXTAUTH_SECRET`                        | Server          | NextAuth JWT secret                                                          |
| `NEXTAUTH_URL`                           | Server          | NextAuth callback URL                                                        |
| `NEXTAUTH_COOKIE_DOMAIN`                 | Server          | Domain cho session cookie                                                    |

> **API proxy CORS:** `src/app/api/proxy/[...path]/route.ts` build CORS allowlist từ exact origin của `NEXT_PUBLIC_APIPROXY_BASE_URL`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SIGNIN_URL`. Khi deploy production, đảm bảo origin thật của app nằm trong các URL này. `NEXTAUTH_COOKIE_DOMAIN` chỉ dùng cho cookie domain, không dùng làm CORS allowlist; localhost chỉ được allow ngoài production.

### Rule: client/server URL pattern

Trong `*-http-request.ts`, base URL resolve qua `resolveServiceBaseUrl(key)` (từ `service-registry.ts`) — **không** tự build bằng `joinURL` + `typeof window`:

```ts
import { resolveServiceBaseUrl } from './service-registry';

baseUrl: resolveServiceBaseUrl('ast'); // Server → gateway/directUrl; Client → proxy
```

Logic bên trong: server-side dùng `APIGATEWAY_BASE_URL` (hoặc `<SERVICE>_DIRECT_URL` nếu set); client-side dùng `NEXT_PUBLIC_APIPROXY_BASE_URL`. Chi tiết xem [04 — Service Registry](./04-api-services.md#service-registry--config-base-url-tập-trung).

→ **Đừng tự `fetch` thẳng `APIGATEWAY_BASE_URL` từ client** — sẽ leak auth + bypass proxy.

## Web Shared Remote (WSR)

Project load **widgets-remote.js** từ remote CDN (`NEXT_PUBLIC_WEB_SHARED_REMOTE_BASE_URL`) qua `<Script strategy="beforeInteractive">` trong root layout. Widgets được expose qua global `window.HVANexusWebSharedRemote.Widgets`.

### Sử dụng widget có sẵn

```tsx
// src/shared/wsr/widgets/app-switcher.tsx
import { AppSwitcherFn } from '@hva-nexus/web-shared-remote/src/exposes/widgets/app-switcher';

const containerRef = React.useRef<HTMLDivElement>(null);
const widgetRef = React.useRef<AppSwitcherFn>(undefined);

React.useEffect(() => {
  if (!containerRef.current) return;
  widgetRef.current = window.HVANexusWebSharedRemote.Widgets?.AppSwitcher.mount(
    containerRef.current,
    process.env.NEXT_PUBLIC_APP_KEY,
  );
}, []);

return <div ref={containerRef} />;
```

**Convention:** wrapper components cho WSR widgets đặt trong `src/shared/wsr/widgets/`. Type definitions import từ `@hva-nexus/web-shared-remote/src/exposes/widgets/...` (devDependency).

## Import Order (ESLint enforced)

Thứ tự bắt buộc (không có newline giữa các nhóm):

1. `react` (phải đứng trước tất cả externals)
2. External packages (node_modules)
3. Parent imports (`../`)
4. Sibling imports (`./`)
5. Index imports

```ts
// ✅ ĐÚNG
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui/button';
import { notify } from '@/core/notification';
import { useEmployees } from '../../services/employee.queries';
import { EmployeeActions } from './actions';
```
