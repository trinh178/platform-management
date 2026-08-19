# 12 — Utils & Conventions Reference

## Import location

```ts
import {
  // Error / message
  getMessage,

  // URL / path
  joinURL,
  joinPath,

  // Format
  formatDate,
  renderValue,

  // Name
  getFullName,
} from '@/shared/utils';

// Path utilities (direct import)
import { comparePathname } from '@/shared/utils/path-tools';
```

---

## Error / Message

### `getMessage(data, default?)`

Extract message từ Error object, HttpRequestError, hoặc plain value.

```ts
// HttpRequestError → server message
catch (err) {
  notify.error(getMessage(err) || 'common.notify.error');
}

// Plain
getMessage({ message: 'Bad' });    // 'Bad'
getMessage('Hello');                // 'Hello'
getMessage(null, 'Unknown');       // 'Unknown'
```

`useAppQuery` / `useAppMutation` đã tự dùng `getMessage` cho `notifyError` — chỉ cần dùng thủ công trong custom error handler.

---

## URL / Path

### `joinURL(base, path)`

Join base URL + path đúng chuẩn, tự handle trailing slashes.

```ts
joinURL('https://api.example.com/', '/users');  // 'https://api.example.com/users'
joinURL('https://api.example.com', 'users');     // 'https://api.example.com/users'
```

Dùng khi compose backend URL trong `HttpRequest` config.

### `joinPath(a, b)`

Join 2 path segments. **Khác `joinURL`** ở chỗ không validate URL.

```ts
joinPath('/employees', '/details');   // '/employees/details'
joinPath('/employees/', '/details');  // '/employees/details'
```

Dùng cho relative route navigation.

---

## Format

### `formatDate(date, format?)`

Format date với moment.js. Default format từ `defaultFormatDate` (xem [date.ts](src/shared/constants/date.ts)).

```ts
formatDate(new Date());                    // 'DD/MM/YYYY'
formatDate(date, 'YYYY-MM-DD HH:mm');     // Custom format
formatDate(undefined);                     // '-'
```

### `renderValue(value)`

Generic value renderer cho table cell — handle string/number/Date/boolean/array/object/null/undefined. Trả `'-'` cho empty.

```ts
renderValue(0);                    // '0'
renderValue('');                   // '-'
renderValue(null);                 // '-'
renderValue(new Date());           // formatted date
renderValue(true);                 // 'Yes'
renderValue([1, 2, 3]);            // '1, 2, 3'
renderValue({ name: 'a' });        // '{"name":"a"}'
```

Dùng trong column cell khi không biết trước type.

---

## Name Composition

### `getFullName(entity)` hoặc `getFullName(firstName, lastName?)`

Compose full name theo định dạng VN: `"<lastName> <firstName>"`. Hai overload:

```ts
// Overload 1: nhận object có { firstName?, lastName? }
getFullName({ firstName: 'Anh', lastName: 'Nguyễn Văn' });  // 'Nguyễn Văn Anh'

// Overload 2: nhận 2 string riêng
getFullName('Anh', 'Nguyễn Văn');                            // 'Nguyễn Văn Anh'

// Empty → '-' (placeholder)
getFullName('', '');                                          // '-'
getFullName({ firstName: undefined, lastName: undefined });   // '-'
```

Áp dụng cho entity có schema `firstName`/`lastName` (vd `Employee`, `EmployeePreview`). Dùng trong:

- `transformSuccessResponse` của `employee.api.ts` (compose `fullName` từ BE response chỉ trả first/last).
- `FullNameCell` của data-table.
- Avatar fallback (lấy ký tự đầu).

---

## Validation Rules Helpers

Có sẵn trong [`@/modules/foundation/validation/rules`](src/modules/foundation/validation/rules.ts).
Khi viết form resolver, **ưu tiên dùng helper trong module validation** thay vì viết Zod schema tay từng field.
Nếu rule phổ biến chưa có helper, tạo helper mới ở file này để dùng chung trước khi dùng trong module:

```ts
import {
  stringRequired,
  numberRequired,
  dateRequired,
  emailFormat,
  guidRequired,
  objectRequired,
  stringMinLength,
  stringMaxLength,
  numberMin,
  numberMax,
} from '@/modules/foundation/validation/rules';
import { createFormValidateResolverWithTranslations } from '@/core/form';

export const formValidateResolver = createFormValidateResolverWithTranslations<MyType>(
  t => ({
    code: stringRequired(t),
    name: stringRequired(t),
    age: numberRequired(t),
    email: emailFormat(t).optional(),
    birthDate: dateRequired(t),
    parentId: guidRequired(t),
    metadata: objectRequired(t),

    // Param helpers
    bio: stringMaxLength(t, 500).optional(),
    salary: numberMin(t, 0).optional(),

    // Optional — chain .optional()
    nickname: stringRequired(t).optional(),
  }),
);
```

| Helper                       | Zod base            | Default error key                 |
| ---------------------------- | ------------------- | --------------------------------- |
| `stringRequired(t)`          | `z.string().min(1)` | `validation.required`             |
| `numberRequired(t)`          | `z.number()`        | `validation.required`             |
| `dateRequired(t)`            | `z.date()`          | `validation.required`             |
| `emailFormat(t)`             | `z.email()`         | `validation.email_format_invalid` |
| `guidRequired(t)`            | `z.uuid()`          | `validation.required`             |
| `objectRequired(t)`          | `z.looseObject({})` | `validation.required`             |
| `stringMinLength(t, min)`    | `z.string().min(n)` | `validation.minLength`            |
| `stringMaxLength(t, max)`    | `z.string().max(n)` | `validation.maxLength`            |
| `numberMin(t, min)`          | `z.number().min(n)` | `validation.min`                  |
| `numberMax(t, max)`          | `z.number().max(n)` | `validation.max`                  |

Quy tắc thêm helper mới:

- Đặt helper ở `@/modules/foundation/validation/rules`, không tạo helper validation riêng trong từng module nếu rule có thể dùng lại.
- Helper nhận `t: TranslationsFn` làm tham số đầu tiên để thống nhất i18n message.
- Dùng i18n key chung trong `validation.*` khi phù hợp; nếu cần key mới, thêm vào i18n của `foundation/validation`.
- Cập nhật bảng helper ở docs này sau khi thêm helper mới.

Chỉ tự viết Zod trực tiếp khi cần rule custom thật sự đặc thù (regex riêng, `.refine()`, `.superRefine()`, rule phụ thuộc nhiều field, hoặc logic nghiệp vụ cục bộ). Nếu cùng một rule lặp lại ở nhiều form, đưa rule đó về helper dùng chung.

---

## Field Naming Convention

**Rule:** Field names trong type / form / API call **phải khớp với response API của backend**. Không tự convert `snake_case` ↔ `camelCase`.

Tất cả module hiện có trong asset-service-web đều dùng `camelCase`:

| Module   | Service | Convention  | Ví dụ                                      |
| -------- | ------- | ----------- | ------------------------------------------ |
| Employee | HRM_EM  | `camelCase` | `employeeCode`, `firstName`, `dateOfBirth` |
| Asset    | AST     | `camelCase` | `assetCode`, `assetName`, `purchaseDate`   |
| Identity | IAM     | `camelCase` | `accessToken`, `refreshToken`              |

→ Khi build module mới, **check backend response** quyết định naming. Không tự "chuẩn hóa" — luôn match BE.

---

## Path Tools

```ts
import { comparePathname } from '@/shared/utils/path-tools';

// So sánh 2 pathname (ignore trailing slash)
comparePathname('/employees', '/employees/');  // true
```

---

## CRUD Helpers

```ts
import { getCRUDActionLabel, getCRUDDialogTitle } from '@/shared/utils';
import { useTranslations } from 'next-intl';
```

### `getCRUDActionLabel(t, mode, options?)`

Trả về label hành động theo `CRUDMode` — dùng để hiển thị trên header dialog hoặc nút submit.

```ts
const t = useTranslations();

getCRUDActionLabel(t, 'CREATE');            // 'Thêm'
getCRUDActionLabel(t, 'CREATE', { createAction: 'create' }); // 'Tạo'
getCRUDActionLabel(t, 'READ');             // 'Xem'
getCRUDActionLabel(t, 'READ', { readAction: 'details' });    // 'Chi tiết'
getCRUDActionLabel(t, 'UPDATE');           // 'Sửa'
getCRUDActionLabel(t, 'DELETE');           // 'Xóa'
```

| Option | Giá trị | Label |
| --- | --- | --- |
| `createAction` | `'add'` (default) | `common.control.add` |
| `createAction` | `'create'` | `common.control.create` |
| `readAction` | `'view'` (default) | `common.control.view` |
| `readAction` | `'details'` | `common.control.details` |

### `getCRUDDialogTitle(t, mode, entityLabel?, options?)`

Compose tiêu đề dialog từ action label + tên entity — dùng trong `getDialogTitle` của `FieldInputArrayTable`.

```ts
getCRUDDialogTitle(t, 'CREATE', 'Bằng cấp');  // 'Thêm Bằng cấp'
getCRUDDialogTitle(t, 'UPDATE', 'Bằng cấp');  // 'Sửa Bằng cấp'
getCRUDDialogTitle(t, 'DELETE', 'Bằng cấp');  // 'Xóa Bằng cấp'
getCRUDDialogTitle(t, 'CREATE');               // 'Thêm' (không có entity label)
```

---

## Temp ID Helpers

Dùng cho các row trong `FieldInputArrayTable` / `FieldInputEntityTable` được thêm mới phía client và chưa có ID thật từ server.

```ts
import { createTempId, isTempId, removeTempId } from '@/shared/utils';
```

### `createTempId(prefix?)`

Tạo ID tạm với prefix — format `<prefix>-<uuid>`. Default prefix là `'tmp'`.

```ts
createTempId();            // 'tmp-3f2a1c...'
createTempId('qual');      // 'qual-3f2a1c...'
```

### `isTempId(id?, prefix?)`

Kiểm tra ID có phải temp ID không.

```ts
isTempId('tmp-3f2a1c...');   // true
isTempId('abc-001');          // false
isTempId(undefined);          // false
```

### `removeTempId(data, prefix?)`

Bỏ trường `id` khỏi object nếu đang là temp ID — dùng trước khi gọi API create để không gửi ID giả lên server.

```ts
const row = { id: 'tmp-3f2a1c...', name: 'Bằng cấp A', issuedBy: 'ĐHBK' };
removeTempId(row);
// → { name: 'Bằng cấp A', issuedBy: 'ĐHBK' }  (id bị xóa vì là temp)

const realRow = { id: 'server-id-001', name: 'Bằng cấp B' };
removeTempId(realRow);
// → { id: 'server-id-001', name: 'Bằng cấp B' }  (giữ nguyên)
```

**Pattern thực tế trong transform submit data:**

```ts
// src/modules/employee/components/employee-crud/transform-create-data.ts
import { removeTempId } from '@/shared/utils';

qualifications: data.qualifications?.map(q => removeTempId(q)),
```

---

## Tree Helpers

```ts
import { findTreeNode } from '@/shared/utils';
```

### `findTreeNode(nodes, predicate, getChildren)`

Tìm kiếm DFS trong cây — trả về node đầu tiên thỏa `predicate`, hoặc `undefined` nếu không tìm thấy.

```ts
const tree = [
  {
    code: 'BOD',
    name: 'Ban Giám đốc',
    children: [
      { code: 'HR', name: 'Phòng Nhân sự', children: [] },
      { code: 'OPS', name: 'Phòng Vận hành', children: [] },
    ],
  },
];

const found = findTreeNode(
  tree,
  node => node.code === 'HR',
  node => node.children,
);
// → { code: 'HR', name: 'Phòng Nhân sự', children: [] }
```

Dùng khi cần resolve label từ code trong tree (vd: tìm org-unit theo code để hiển thị tên trong form).

---

## Constants Helpers

```ts
import { ConstantBase, constGet, useConstWithTranslations } from '@/core/constants';

// ConstantBase<ValueType> — type cho CONST_* array
export const CONST_X: ConstantBase<XType>[] = [...];

// constGet — lấy field từ constant theo value (non-React)
constGet(CONST_VEHICLE_STATUS, 'Active', 'label');  // TranslationsKey

// useConstWithTranslations — translate label cho dùng trong Select/dropdown
const options = useConstWithTranslations(CONST_VEHICLE_STATUS);
// → [{ value: 'Active', label: 'Đang hoạt động' }, ...]
```

---

## Default Constants

```ts
import { defaultListRequest } from '@/shared/constants/pagination';
// { pageIndex: 0, pageSize: 10 }

import { defaultFormatDate } from '@/shared/constants/date';
// 'DD/MM/YYYY' (hoặc tương tự — check source)
```
