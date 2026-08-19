# Changelog Tài Liệu Codebase

File này ghi lại các lần cập nhật `docs.codebase`: rule, convention và pattern codebase dùng chung.

## Cách Ghi Changelog

- Dùng ngày theo format `YYYY-MM-DD`.
- Ghi ngắn gọn thay đổi về pattern/code generation rule.
- Mỗi entry nên có mục `Files` liệt kê các file trong `docs.codebase` đã tạo hoặc cập nhật.
- Nếu cập nhật docs do thay đổi source code, thêm mục `Related Source Files` để trace các file source thuộc codebase generic hoặc module mẫu `employee`.
- Chỉ ghi nội dung generic có thể tái sử dụng giữa nhiều domain/module.
- Không ghi business rule, endpoint contract cụ thể, actor, permission hoặc behavior riêng của một dự án.

## 2026-07-31

### App Shell

- Ghi nhận cập nhật style thống nhất cho các fallback/status pages nền tảng và
  copy phân biệt trạng thái authenticated/unauthenticated ở màn không có route khả
  dụng.
- Ghi nhận `useAppSignOut` hỗ trợ truyền option cho NextAuth sign out để fallback
  page có thể chỉ định callback URL sau khi đăng xuất.

### Files

- `docs.codebase/CHANGELOG.md`

### Related Source Files

- `src/modules/foundation/app-shell/components/NoAccessibleRoutes.tsx`
- `src/modules/foundation/app-shell/components/NoPermission.tsx`
- `src/modules/foundation/app-shell/components/NotFound.tsx`
- `src/modules/foundation/app-shell/i18n/en.json`
- `src/modules/foundation/app-shell/i18n/vi.json`
- `src/modules/foundation/identity/components/NoAuthentication.tsx`
- `src/core/auth/signOut.ts`

## 2026-07-22

### Forms

- Bổ sung rule clear value cho `FieldInputBase`: field không truyền `clearValue` riêng sẽ preserve nullable shape (`null` -> `null`, còn lại `undefined`), còn các field có empty shape riêng vẫn override bằng `''`, `[]`, hoặc `false`.
- Cập nhật tài liệu `FieldInputSliderNumber`: `null`, `undefined`, và `''` là empty value khi render; xóa input phụ phải đi qua `handleClear()` để đồng bộ với clear button của base.
- Nhắc lại rule transform update: nullable clear shape ở UI không thay thế việc map clear intent theo API contract trong `transform-update-data.ts`.
- Bổ sung hướng dẫn dùng `withNullForUndefined` cho global update submit khi cần chuyển các field nullable đã clear từ `undefined` sang `null`.

### Files

- `docs.codebase/05-forms.md`
- `docs.codebase/CHANGELOG.md`

### Related Source Files

- `src/shared/components/form/field-input-base.tsx`
- `src/shared/components/form/field-input-slider-number.tsx`
- `src/shared/utils/nullish.ts`

## 2026-07-17

### Forms

- Bo sung tai lieu cho component `FieldInputSliderNumber` trong danh sach FieldInput dung chung: value shape, vi du su dung, va cac props thuong dung.

### Files

- `docs.codebase/05-forms.md`
- `docs.codebase/CHANGELOG.md`

### Related Source Files

- `src/shared/components/form/field-input-slider-number.tsx`
- `src/shared/components/ui/slider.tsx`
- `src/modules/form-guide/components/field-input-guide/index.tsx`
- `src/modules/form-guide/i18n/en.json`
- `src/modules/form-guide/i18n/vi.json`

## 2026-07-16

### App Shell

- Bo sung `useAppShellStore.appHeaderVisible` va cac action `showAppHeader` / `hideAppHeader` / `setAppHeaderVisible`; app-shell layout phai co nut khoi phuc khi header dang an.

### Files

- `docs.codebase/11-auth-and-state.md`
- `docs.codebase/CHANGELOG.md`

### Related Source Files

- `src/modules/foundation/app-shell/stores/app-shell.store.ts`
- `src/modules/foundation/app-shell/stores/app-shell.types.ts`
- `src/modules/foundation/app-shell/components/layout/index.tsx`
- `src/modules/foundation/app-shell/components/layout/app-header.tsx`

## 2026-07-15

### App Shell

- Bổ sung pattern sidebar controlled state: `SidebarProvider` bind với `useAppShellStore.sidebarOpen`, các page/component dùng `openSidebar` / `closeSidebar` thay vì thao tác DOM hoặc sidebar context nội bộ.
- Bổ sung lưu ý remount widget/sidebar child bằng `key` theo trạng thái expanded/collapsed khi component nhúng không update ổn định sau mount.
- Chuẩn hóa `PageContent` mặc định dùng `flex-1 min-h-0` để fill phần còn lại của app shell/main, tránh tự tính `calc(100vh - header)` trong từng page.

### DataTable

- Bổ sung `DataTableServer.topRowsRender` để render summary/tổng hợp ngay dưới table header trong cùng table layout, dùng khi summary cần hiển thị trước data rows.

- Mo rong `helpers.getPinnedCellProps` cho summary/footer rows: cho phep truyen `style` opaque cho pinned cell de tranh lo text cot khong pin khi scroll ngang qua row co background trong suot.

### Files

- `docs.codebase/06-data-table.md`
- `docs.codebase/10-code-patterns.md`
- `docs.codebase/11-auth-and-state.md`
- `docs.codebase/CHANGELOG.md`

### Related Source Files

- `src/core/layout/page-content.tsx`
- `src/shared/components/data-table/server/index.tsx`
- `src/shared/components/data-table/shared/data-table-table.tsx`
- `src/modules/foundation/app-shell/components/layout/index.tsx`
- `src/modules/foundation/app-shell/components/layout/app-sidebar.tsx`

## 2026-07-09

### Routing

- Bổ sung rule cho `useAppRouter`: `relative` và `params` là option của wrapper, phải được xử lý trước khi gọi router native của Next.js.
- Bổ sung rule query-only navigation: chỉ đổi query string trên cùng pathname không được start `nprogress`; helper so route phải bỏ qua query string và hash.
- Bổ sung rule cho `AppLink`: dùng `onNavigate` cho side effect navigation, giữ `onClick` cho caller, không start `nprogress` nếu navigation bị `preventDefault()`, và hỗ trợ `UrlObject` đúng cách.

### Files

- `docs.codebase/03-routing-permissions.md`
- `docs.codebase/CHANGELOG.md`

### Related Source Files

- `src/core/router/next.tsx`
- `src/shared/utils/path-tools.ts`

## 2026-07-07

### Forms

- Ghi rõ default range năm của các date picker dùng `Calendar` dropdown: từ `1900` đến năm hiện tại + `50`; hướng dẫn dùng `dateDisabled` cho rule chặn ngày theo form.

### DataTable

- Bổ sung `footerRender` cho `DataTableServer` để render footer row tổng cộng/summary theo các cột đang hiển thị.

### Files

- `docs.codebase/05-forms.md`
- `docs.codebase/06-data-table.md`
- `docs.codebase/CHANGELOG.md`

### Related Source Files

- `src/shared/components/ui/calendar.tsx`
- `src/shared/components/data-table/server/index.tsx`
- `src/shared/components/data-table/shared/data-table-table.tsx`

## 2026-07-02

### Forms

- Chuẩn hóa rule details page: `INLINE_ONLY` không cần header **Sửa** để mở khóa inline edit; inline edit có sẵn tại từng field/group khi user có quyền update.
- Làm rõ `GLOBAL_ONLY` mới dùng header **Sửa** để vào global edit; `INLINE_AND_GLOBAL` có inline edit sẵn và dùng **Sửa** để chuyển sang global edit.

### Files

- `docs.codebase/05-forms.md`
- `docs.codebase/02-module-structure.md`
- `docs.codebase/10-code-patterns.md`
- `docs.codebase/11-auth-and-state.md`
- `docs.codebase/CHANGELOG.md`

### Related Source Files

- `src/modules/employee/pages/employees-details.page.tsx`
- `src/modules/employee/components/employee-crud/context.tsx`
- `src/modules/employee/components/employee-crud/index.tsx`
- `src/modules/employee/components/employee-crud/content-header.tsx`
- `src/modules/employee/components/employee-crud/sections/employee-basic.tsx`
- `src/modules/employee/components/employee-crud/sections/employee-contact.tsx`
- `src/modules/employee/components/employee-crud/sections/employee-job-info.tsx`
- `src/modules/employee/components/employee-crud/sections/employee-qualifications/index.tsx`
- `src/modules/employee/components/employee-crud/sections/employee-documents/actions.tsx`
- `src/modules/employee/components/employee-crud/sections/employee-documents/columns.tsx`

## 2026-06-26

### Forms

- Bổ sung rule transform update: field optional có `clearable` phải gửi `null` khi user clear nếu API dùng `null` làm clear intent; không `delete` key vì omit field thường có nghĩa là giữ nguyên giá trị server.

- Bổ sung rule cho details page `INLINE_ONLY`: sau khi chuyển từ `READ` sang inline `UPDATE`, header phải có action rõ ràng để quay lại `READ` mà không submit form. Superseded by `2026-07-02`: `INLINE_ONLY` không cần header **Sửa** để mở khóa inline edit.
- Cập nhật ví dụ header actions để `UPDATE + inline` có nút **Thoát chỉnh sửa** bên cạnh các action save theo từng field. Superseded by `2026-07-02` cho case `INLINE_ONLY`.

### Files

- `docs.codebase/05-forms.md`
- `docs.codebase/10-code-patterns.md`
- `docs.codebase/CHANGELOG.md`

## 2026-06-23

### Docs

- Thêm rule bắt buộc cập nhật `docs.codebase/CHANGELOG.md` mỗi lần tạo hoặc sửa file trong `docs.codebase`.
- Entry changelog phải có ngày, nội dung thay đổi ngắn gọn và mục `Files` liệt kê các file đã tạo hoặc cập nhật.
- Bổ sung quy ước `Related Source Files` để trace các file source liên quan khi docs được cập nhật theo thay đổi source code.
- Giới hạn `Related Source Files` chỉ liệt kê file source thuộc codebase generic hoặc module mẫu `employee`; bỏ qua file nghiệp vụ hoặc module cụ thể của một dự án.
- Loại bỏ cách gọi tên module theo dự án cụ thể trong rule `Related Source Files` để `docs.codebase` giữ tính tái sử dụng giữa nhiều dự án.
- Chuẩn hóa các ví dụ còn dính thuật ngữ nghiệp vụ dự án trong docs form, data table và API service sang ví dụ generic.

### DataTable

- Thêm rule: cell trong DataTable mở trang chi tiết phải dùng `AppLink`, không dùng `Button + router.push`, để browser hỗ trợ chuột phải `Open link`, mở tab mới và copy link.
- Cập nhật ví dụ custom cell trong `06-data-table.md` sang `AppLink`.

### Files

- `docs.codebase/06-data-table.md`
- `docs.codebase/04-api-services.md`
- `docs.codebase/05-forms.md`
- `docs.codebase/CHANGELOG.md`
- `docs.codebase/EDITING_RULES.md`
- `docs.codebase/README.md`

### Related Source Files

- `src/modules/employee/components/employee-data-table/columns.tsx`

## 2026-06-22

### DataTable

- Thêm `initialListRequest?: ListRequest` cho `DataTableServer` docs để đồng bộ state khởi tạo của pagination/filter/sort với request mặc định.
- Bổ sung hướng dẫn default sort/filter khi bảng cần hiển thị đúng icon sort/filter ngay lần render đầu.

### Files

- `docs.codebase/06-data-table.md`

### Related Source Files

- `src/shared/components/data-table/server/index.tsx`
- `src/modules/datatable-guide/components/datatable-guide/index.tsx`
- `src/modules/datatable-guide/components/datatable-guide/sample-data.ts`
