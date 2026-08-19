# AI Code Generation Rules

`docs.codebase` là bộ quy tắc code generation và implementation pattern dùng chung cho các dự án dùng cùng codebase. Folder này chỉ mô tả cách tổ chức và triển khai source code; không chứa nghiệp vụ, hành vi sản phẩm hoặc API contract cụ thể của một dự án.

> **Đọc file này trước.** Mỗi file docs mô tả một nhóm rules cụ thể.
> Trước khi generate code, AI **phải** đọc các file liên quan.
>
> **Module mẫu**: `src/modules/employee/` (HRM_EM service) là module reference đầy đủ — gồm CRUD form (`employee-crud`), data table (`employee-data-table`), services theo factory pattern, mock store-based (`src/mock/hrmem/employee/`), permissions (`HRM_EM.EMPLOYEE.*`). Khi tạo module mới, dùng `employee` làm template.

## Danh sách tài liệu

| File | Nội dung |
| --- | --- |
| [CHANGELOG.md](./CHANGELOG.md) | Lịch sử cập nhật rule và pattern trong docs.codebase |
| [EDITING_RULES.md](./EDITING_RULES.md) | Quy tắc chỉnh sửa folder docs.codebase |
| [01-project-overview.md](./01-project-overview.md) | Stack, cấu trúc thư mục, quy ước đặt tên, env vars, WSR |
| [02-module-structure.md](./02-module-structure.md) | Cách tạo một module mới hoàn chỉnh |
| [03-routing-permissions.md](./03-routing-permissions.md) | Route config, permission, navigation |
| [04-api-services.md](./04-api-services.md) | HttpRequest, query keys, React Query factories, meta options, mock |
| [05-forms.md](./05-forms.md) | react-hook-form, Zod validation, default values, toàn bộ FieldInput components |
| [06-data-table.md](./06-data-table.md) | DataTable server-side, columns, filters |
| [07-i18n.md](./07-i18n.md) | Đa ngôn ngữ với next-intl |
| [08-notifications-loading.md](./08-notifications-loading.md) | notify, appLoadingControl, modal, useConfirm |
| [09-eslint-import-rules.md](./09-eslint-import-rules.md) | Import rules, forbidden imports, thứ tự import |
| [10-code-patterns.md](./10-code-patterns.md) | Các pattern thực tế lấy từ source code, PageContent props |
| [11-auth-and-state.md](./11-auth-and-state.md) | Authentication flow, useMe, useIdentityStore, useAppShellStore, useHasPermissions, storage |
| [12-utils-reference.md](./12-utils-reference.md) | Utils (`getMessage`, `formatDate`, `getFullName`, …), validation rules helpers, field naming convention |

## Quy tắc đọc

- **Sửa tài liệu trong docs.codebase:** đọc EDITING_RULES trước để đảm bảo nội dung đúng phạm vi codebase generic.
- **Tạo module mới:** đọc 02 → 03 → 04 → 05 → 07 → 11
- **Sửa foundation modules (`app-branding`, `app-shell`, `common`, `identity`, `shared-components`, `validation`):** đọc 02 → 07 → 11, và đọc thêm file pattern liên quan nếu chạm route/form/table/API
- **Sửa logic existing module:** đọc file pattern liên quan + 10 + 12
- **Build form / CRUD:** 05 + 10 (Context pattern) + 11 (permission)
- **Build table:** 06 + 04 (ListRequest) + 12 (renderValue)
- **Tích hợp service mới:** 04 (HttpRequest + factory) + 12 (utils)
