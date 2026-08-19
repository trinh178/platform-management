# Platform Management Web

Quản lý tập trung ứng dụng, dịch vụ và cấu hình nền tảng trong hệ thống HVA Nexus.

## Chạy local

Nếu cần private package `@hva-nexus/*`, tạo `.npmrc` từ file mẫu và điền token:

```powershell
Copy-Item .npmrc.example .npmrc
```

Cài dependencies:

```powershell
npm ci
```

Tạo env local:

```powershell
Copy-Item .env.example .env
```

Chạy app:

```powershell
npm run dev
```

Mở `http://localhost:3000`.

Muốn đổi port:

```powershell
npm run dev -- -p 3001
```

## Scripts thường dùng

```powershell
npm run dev
npm run build
npm run lint
npm run type-check
```

## Tài liệu chi tiết

Trước khi code hoặc sửa logic, đọc tài liệu trong:

- `docs.codebase/`: tài liệu kỹ thuật của source như cấu trúc module, routing, API service, form, table, i18n, auth, state và coding conventions.
- `docs.business/`: tài liệu nghiệp vụ như domain, permission, entity, API contract và quy tắc business của Platform Management.
