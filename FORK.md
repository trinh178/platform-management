# Fork Guide — Tạo app mới từ codebase này

Tài liệu này liệt kê tất cả các vị trí cần cập nhật khi _new-app/clone codebase sang một app mới.

## Cách dùng với AI

Để AI tự động apply toàn bộ thay đổi khi fork, làm theo 2 bước:

**Bước 1 — Chuẩn bị `_new-app/` folder:**

1. Mở `_new-app/config.json` và điền thông tin app mới vào tất cả các trường.
2. Thay 3 file asset trong `_new-app/assets/`:
   - `app-icon.png` — icon app mới (hiện là icon WATS mẫu)
   - `logo.png` — logo app mới (hiện là logo WATS mẫu)
   - `favicon.ico` — favicon app mới (hiện là favicon WATS mẫu)

**Bước 2 — Yêu cầu AI apply:**
> Đọc `FORK.md` và `_new-app/config.json`, sau đó apply toàn bộ checklist trong FORK.md (ngoại trừ GitHub Actions Variables). Dùng assets trong `_new-app/assets/` để thay thế vào đúng vị trí.

Sau khi AI apply xong, nhớ đồng bộ **GitHub Actions Variables** thủ công trong Settings của repo theo `.env.example`.

---

## `_new-app/config.json` — Cấu trúc

```json
{
  "projectIdentity": {
    "packageName": "...",        // → package.json "name"
    "ci": {
      "workflowName": "...",     // → ci.dev.yml "name"
      "IMAGE_NAME": "...",       // → ci.dev.yml IMAGE_NAME
      "RUNTIME_ENV_FILE": "..."  // → ci.dev.yml RUNTIME_ENV_FILE
    }
  },
  "appBranding": {
    "vi": { "name": "...", "description": "...", "shortName": "...", "iconAlt": "..." },
    "en": { "name": "...", "description": "...", "shortName": "...", "iconAlt": "..." },
    "themeHue": 264              // → theme.css: đổi tất cả hue OKLCH (0–360)
  },
  "env": {
    "NEXT_PUBLIC_APP_KEY": "..."         // → .env.example
  }
}
```

## `_new-app/assets/` — Assets mẫu

| File | Copy đến |
| --- | --- |
| `_new-app/assets/app-icon.png` | `src/assets/icons/app-icon.png` |
| `_new-app/assets/logo.png` | `src/assets/images/logo.png` |
| `_new-app/assets/favicon.ico` | `src/app/favicon.ico` |

> Nếu đổi tên file icon/logo, cập nhật thêm import trong `src/modules/foundation/app-branding/app-config.ts`.

---

## 1. Project Identity

| File | Trường | Ví dụ hiện tại |
| --- | --- | --- |
| `package.json` | `name` | `wats-web` |
| `.github/workflows/ci.dev.yml` | `name` (workflow) | `Build and Deploy WATS Web` |
| `.github/workflows/ci.dev.yml` | `IMAGE_NAME` | `hvanexus_wats_web` |
| `.github/workflows/ci.dev.yml` | `RUNTIME_ENV_FILE` | `/home/hvanexus-infras/frontend/wats-web/.env` |

## 2. App Branding (tên, mô tả, màu, icon, logo)

Tất cả nằm trong `src/modules/foundation/app-branding/`.

### Text

`src/modules/foundation/app-branding/i18n/vi.json` và `en.json`:

```json
{
  "app": {
    "name": "Quy trình & Công việc",
    "description": "Quản lý tập trung quy trình, phê duyệt và công việc.",
    "shortName": "WATS",
    "iconAlt": "Quy trình & Công việc icon"
  }
}
```

- `name` — tên đầy đủ, dùng làm `<title>` browser tab và sidebar.
- `description` — tagline ngắn, dùng làm `<meta description>` và panel phải của login page.
- `shortName` — tên viết tắt, hiển thị trên login page.
- `iconAlt` — alt text cho icon.

### Icon & Logo

`src/modules/foundation/app-branding/app-config.ts` — trỏ sang file asset tương ứng:

```ts
import appIcon from '@/assets/icons/app-icon.png';
import logo from '@/assets/images/logo.png';
```

Thay 2 file ảnh trong `src/assets/`:

| File | Dùng cho |
| --- | --- |
| `src/assets/icons/app-icon.png` | Icon trong sidebar, login page, AppSwitcher widget |
| `src/assets/images/logo.png` | Logo (nếu app có dùng) |
| `src/app/favicon.ico` | Favicon browser tab |

### Màu chủ đạo

`src/modules/foundation/app-branding/theme.css` — toàn bộ màu dùng OKLCH.
Đổi hue (số cuối trong `oklch(L C H)`) đồng loạt cho cả `:root` và `.dark`:

```css
/* Hiện tại dùng indigo hue 264 — đổi sang hue mới (0–360) */
--primary: oklch(0.511 0.254 264);
--sidebar: oklch(0.2 0.08 264);
--app-icon-gradient-from: oklch(0.36 0.18 264);
/* ... tất cả các biến có hue 264 */
```

> Gợi ý: dùng Find & Replace `264` → hue mới trong file này để đổi đồng loạt.

## 3. Environment Variables

`.env.example` — cập nhật các giá trị app-specific:

| Var | Mô tả |
| --- | --- |
| `NEXT_PUBLIC_APP_KEY` | Định danh app trong AppSwitcher widget (vd: `wats`, `fleet-management`) |

Sau khi cập nhật `.env.example`, đồng bộ lại **GitHub Actions Variables** trong Settings của repo.

## 4. Login Page Text (identity i18n)

`src/modules/foundation/identity/i18n/vi.json` và `en.json` — phần `identity.auth`:

| Key | Nội dung |
| --- | --- |
| `sign_in_subtitle` | Template `"Đăng nhập vào {appName}"` — `{appName}` tự lấy từ `app.name` trong `app-branding`, **không cần sửa khi fork** |

> `sign_in_subtitle` dùng interpolation nên tự cập nhật theo `app.name`. Chỉ cần sửa nếu muốn đổi cấu trúc câu.

## 5. README

`README.md` — cập nhật tất cả nội dung app-specific:

| Vị trí | Cách cập nhật |
| --- | --- |
| Title `# ...` | Tên web app mới, đồng bộ với app đang fork (vd: `Asset Service Web`) |
| Dòng mô tả ngay dưới title | Lấy từ `_new-app/config.json` → `appBranding.vi.description` |
| Mô tả `docs.business/` | Đổi tên service/domain cho đúng app mới, đồng bộ với tài liệu trong `docs.business/` |

## Checklist tổng hợp

- [ ] `_new-app/config.json` — điền thông tin app mới
- [ ] `_new-app/assets/app-icon.png` — thay file icon mới
- [ ] `_new-app/assets/logo.png` — thay file logo mới
- [ ] `_new-app/assets/favicon.ico` — thay file favicon mới
- [ ] `package.json` — `name`
- [ ] `.github/workflows/ci.dev.yml` — `name`, `IMAGE_NAME`, `RUNTIME_ENV_FILE`
- [ ] `.env.example` — `NEXT_PUBLIC_APP_KEY`, service gateway paths
- [ ] GitHub Actions Variables — đồng bộ với `.env.example` _(thủ công)_
- [ ] `src/app/favicon.ico` — copy từ `_new-app/assets/favicon.ico`
- [ ] `src/assets/icons/app-icon.png` — copy từ `_new-app/assets/app-icon.png`
- [ ] `src/assets/images/logo.png` — copy từ `_new-app/assets/logo.png`
- [ ] `src/modules/foundation/app-branding/app-config.ts` — cập nhật import nếu đổi tên file ảnh
- [ ] `src/modules/foundation/app-branding/theme.css` — đổi hue màu
- [ ] `src/modules/foundation/app-branding/i18n/vi.json` — `name`, `description`, `shortName`, `iconAlt`
- [ ] `src/modules/foundation/app-branding/i18n/en.json` — tương tự
- [ ] `README.md` — cập nhật title, mô tả ngắn và các chỗ nhắc tới tên service/domain
