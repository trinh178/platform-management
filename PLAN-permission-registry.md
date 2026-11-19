# Kế hoạch: PLM quản lý danh mục quyền, IAM đồng bộ read-only

> Trạng thái: **Đã thực hiện xong phần code ở cả 5 repo (chưa commit, chưa deploy).** Cập nhật: 18/11/2026.
> Ngoài phạm vi: dữ liệu seed của IAM, các vấn đề bảo mật trong `PermissionController`, và việc deploy (do bạn tự làm).

## 1. Quyết định đã chốt

| # | Quyết định |
| --- | --- |
| D1 | **AppCode** là mã app frontend hiển thị trong HVA Nexus. **ServiceCode** là mã service backend. |
| D2 | Mã quyền có dạng `<ServiceCode>.<Domain>.<Resource>.<Action>`. |
| D3 | **PLM là nơi duy nhất quản lý danh mục quyền** (Service → Domain → Resource → Action). Ở PLM được thêm, sửa (kể cả sửa mã), xoá, import và export thoải mái, tương tự tính năng permission hiện có của IAM. |
| D4 | **IAM chỉ đồng bộ từ PLM**, không thêm, sửa hay xoá permission nào. Danh mục quyền ở IAM luôn giống PLM 100% sau mỗi lần đồng bộ. |
| D5 | Không quan tâm việc mã quyền đang được dùng trong code các service. Không khoá mã, không giữ quyền cũ: quyền nào bị xoá ở PLM thì bị xoá ở IAM khi đồng bộ, kèm luôn các gán role của quyền đó. |
| D6 | Action không bắt buộc thuộc danh sách chung, chỉ cần đúng định dạng `UPPER_SNAKE_CASE`. Chưa dùng tên/mô tả cho action. IAM gán `Name = Code`. |
| D7 | Đổi tên `AppCode` thành `ServiceCode` trong IAM (cột DB, entity, DTO, endpoint, iam-web). Ngoài iam-web không có repo nào khác gọi các endpoint này. |
| D8 | AppSwitcher lấy danh sách app từ PLM `GET /me/apps`. User thấy App khi có ít nhất một permission thuộc một **Service Primary** của App (mapping App-Service có `role = Primary`), hoặc user có `*`. App không có Service Primary thì mọi user đã đăng nhập đều thấy. |
| D9 | Mã `HRM.EM.*` trong IAM là dữ liệu cũ, không còn ai dùng: hrm-em-api không kiểm tra quyền, hrm-em-web dùng `HRM_EM.*`, còn web-portal chỉ khai báo hằng số mà không dùng. Các mã này sẽ bị xoá khi đồng bộ lần đầu. |
| D10 | IAM vẫn **gán permission cho role bình thường** (màn hình Role và chi tiết permission). Chỉ danh mục permission là read-only. |
| D11 | Đồng bộ **chỉ chạy khi bấm nút** trên iam-web. Nút gọi `POST /permissions/sync`, không có job tự động. |
| D12 | PLM cho phép **xoá Service/Domain/Resource kèm toàn bộ dữ liệu con** (có hộp xác nhận). Riêng Service đang được gán cho App thì vẫn chặn: phải gỡ mapping trước. |
| D13 | Thêm quyền `PLM.REGISTRY.PERMISSION.VIEW`, `PLM.REGISTRY.PERMISSION.IMPORT`, `PLM.REGISTRY.PERMISSION.EXPORT`, và thêm action `IMPORT`/`EXPORT` vào danh sách action chuẩn của PLM. |
| D14 | Import/export ở PLM **chỉ dùng định dạng Code list TXT** (mỗi dòng một mã), cùng định dạng với file "Code list" mà iam-web đang export. Không làm Full CSV và Compact CSV. Chi tiết ở mục 2.4. |
| D15 | **Không làm trang mới.** Import/Export đặt trên thanh công cụ của trang "Cấu trúc service". Panel Resource hiển thị các mã quyền sinh ra. Danh sách mã dạng phẳng tra ở màn permission của IAM (sau khi đồng bộ) hoặc qua Export. |

## 2. Cơ chế đồng bộ

### 2.1 Định danh: mỗi permission ở IAM gắn với một Action ở PLM

- PLM lưu Action thành bảng con của Resource, **mỗi Action có `id` riêng**.
- Permission ở IAM lưu thêm cột **`RegistryActionId`** (id của Action bên PLM) và đồng bộ theo khoá này, không theo `Code`.
- Nhờ vậy, **đổi mã Service/Domain/Resource ở PLM thì IAM chỉ cập nhật lại `Code` của chính bản ghi đó**, giữ nguyên các role đã gán.
- Riêng đổi mã của **Action** thì được tính là xoá action cũ, thêm action mới. Kết quả là role đã gán cho action cũ bị mất (chấp nhận theo D5).

### 2.2 Khi bấm "Đồng bộ từ PLM" trên iam-web

1. IAM gọi PLM `GET /registry/permission-catalog` để lấy **toàn bộ** danh mục.
2. Đối chiếu theo `RegistryActionId`:
   - Có ở PLM mà chưa có ở IAM → **tạo** permission.
   - Có ở cả hai → **cập nhật** `Code`, `ServiceCode`, `Domain`, `Resource`, `Action`, `Name`.
   - Có ở IAM mà không còn ở PLM → **xoá** permission và các gán role của nó.
3. Hiển thị kết quả: số permission đã tạo, cập nhật, xoá.

Chốt an toàn duy nhất: **nếu không gọi được PLM hoặc PLM trả về danh mục rỗng thì huỷ đồng bộ**. Mục đích là tránh việc PLM lỗi làm IAM xoá sạch permission.

### 2.3 Lần đồng bộ đầu tiên

Permission hiện có trong IAM chưa có `RegistryActionId`. Lần đồng bộ đầu, nếu một permission chưa có id thì IAM **khớp theo `Code`** và gán id cho nó, nhờ đó giữ được các role đã gán. Các lần sau chỉ khớp theo id.

Trình tự để không mất role đã gán:

1. Trên iam-web hiện tại (chưa nâng cấp), **export** danh mục từng app theo định dạng **Code list TXT**.
2. **Import các file đó vào PLM**. Các mã sai định dạng, như `HRM.EM.Overview.View`, bị báo lỗi ở bước xem trước; bỏ các dòng đó khỏi file rồi import lại.
3. Sau khi deploy IAM bản mới, bấm "Đồng bộ từ PLM".

### 2.4 Import/export ở PLM (chỉ Code list TXT)

| Thành phần | Cách làm |
| --- | --- |
| Định dạng file | `.txt`, **mỗi dòng một mã** `<ServiceCode>.<Domain>.<Resource>.<Action>`. Bỏ qua dòng trống và khoảng trắng đầu/cuối dòng. Giống định dạng "Code list" của iam-web. |
| File mẫu | Tải về được file `.txt` mẫu. |
| Import, bước xem trước | Chọn file, hộp thoại hiện từng dòng kèm lỗi: không đủ 4 đoạn, sai `UPPER_SNAKE_CASE`, trùng trong file. Mã đã tồn tại không tính là lỗi, chỉ được đánh dấu "đã có, bỏ qua". Có lỗi thì không cho import. |
| Import, cách ghi | **Chỉ thêm, không xoá và không sửa gì.** Mã chưa có thì tạo Service/Domain/Resource/Action còn thiếu, với `name` = mã và `status` = Active. File chỉ có mã nên không có gì để "Upsert", vì vậy không có lựa chọn chế độ. |
| Phạm vi | Một file có thể chứa nhiều Service. |
| Export | Chọn một Service hoặc tất cả, xuất ra `.txt`, mỗi dòng một mã, sắp xếp theo mã. |
| Quyền | `PLM.REGISTRY.PERMISSION.IMPORT` / `.EXPORT` (D13). |

Backend PLM **kiểm tra lại toàn bộ** chứ không chỉ dựa vào bước kiểm tra ở giao diện, và trả báo cáo lỗi theo từng dòng.

## 3. Cần xác nhận

Không còn mục nào. Các câu hỏi Q1–Q6 đã được chốt thành D10–D15.

## 4. Thay đổi theo từng repo

### 4.1 `platform-management-web` / `docs.business`

- [ ] `README.md`:
  - Đổi pattern mã quyền thành `<ServiceCode>.<Domain>.<Resource>.<Action>`.
  - Ghi rõ AppCode khác ServiceCode.
  - Ghi PLM là nơi duy nhất quản lý danh mục quyền, IAM đồng bộ read-only.
- [ ] `domains/registry/domain.yaml`:
  - Entity `ResourceAction` (`id`, `resourceId`, `action`), unique `(resourceId, action)`.
  - `AppServiceMapping.role` (`Primary` | `Dependency`).
  - Flow: `get_permission_catalog`, `import_permissions`, `export_permissions`, `list_resource_options`, `update_app_service_mapping_role`; cập nhật `assign_service_to_app` thêm `role`.
  - Rule: `my_apps_filtered_by_app_permission` (D8); `iam_mirrors_registry_permissions` (D4, D5); `delete_cascades_children` thay cho `delete_requires_no_dependents` (D12).
  - Feature: Import/Export đặt ở trang "Cấu trúc service" (D15).
- [ ] `shared/permissions.yaml`, `shared/enums.yaml`, `shared/actor-permissions.yaml`: action `IMPORT`/`EXPORT`, resource `PERMISSION` (D13), enum `app_service_role`.
- [ ] `external-services.yaml`: IAM gọi PLM `permission-catalog`.

### 4.2 `platform-management-api`

- [ ] Migration `004`:
  - Bảng `registry_resource_actions` (`id`, `resource_id` FK, `action`, audit), unique `(resource_id, action)`, CHECK định dạng.
  - `registry_app_service_mappings.role` với backfill `Primary` khi `app_code = service_code`.
  - Seed action cho 9 resource của PLM.
- [ ] Resource:
  - Request/response có `actions: string[]`. Khi cập nhật, PLM so sánh với danh sách cũ để thêm/xoá action, action không đổi giữ nguyên `id`.
  - Thêm `GET /registry/resources/options?domainId=&keyword=`.
- [ ] Xoá kèm dữ liệu con cho Service/Domain/Resource (D12). Endpoint `DELETE` trả kèm số lượng đã xoá; thêm `GET .../{id}/delete-impact` để hộp xác nhận hiển thị trước số lượng sẽ bị xoá.
- [ ] Danh mục quyền:
  - `GET /registry/permission-catalog?serviceCode=`: không truyền thì trả toàn bộ. Mỗi phần tử gồm `{ id (action id), code, serviceCode, domainCode, resourceCode, action }`. IAM dùng API này để đồng bộ, và export cũng lấy dữ liệu từ đây. Quyền: `PLM.REGISTRY.PERMISSION.VIEW`.
  - `POST /registry/permissions/import`: nhận file `.txt` (multipart), mỗi dòng một mã (mục 2.4). Kiểm tra lại toàn bộ, tạo Service/Domain/Resource/Action còn thiếu trong một transaction, chạy lặp không sinh trùng. Trả `{ created: { services, domains, resources, actions }, skipped, errors: [{ line, code, reason }] }`. Có lỗi thì không ghi gì.
  - `GET /registry/permissions/export?serviceCode=`: trả file `.txt` (`text/plain`, có `Content-Disposition`), mỗi dòng một mã, sắp xếp theo mã. Không truyền `serviceCode` thì xuất tất cả.
- [ ] Mapping: `role` khi gán, `PUT /registry/app-service-mappings/{id}` để đổi role, filter và sort theo `role`.
- [ ] `GET /me/apps`: lọc theo Service Primary (D8).
- [ ] Cập nhật test, swagger, README.

### 4.3 `platform-management-web`

- [ ] Form và panel Resource (Service Structure): nhập `actions` dạng tag, có gợi ý nhanh `CREATE/VIEW/UPDATE/DELETE`. Panel hiển thị các mã quyền được sinh ra.
- [ ] **Import/Export Code list TXT** (mục 2.4), tham khảo `permission-catalog-actions.tsx` của iam-web nhưng chỉ giữ phần TXT:
  - Nút Export: chọn Service đang xem hoặc tất cả, tải file `.txt`.
  - Nút tải file mẫu `.txt`.
  - Nút Import: chọn file `.txt`, hộp thoại xem trước có lỗi theo dòng và số mã sẽ thêm/bỏ qua, rồi import và hiển thị báo cáo.
  - Vị trí đặt: thanh công cụ trang "Cấu trúc service" (D15).
- [ ] Xoá kèm dữ liệu con: hộp xác nhận ghi rõ số lượng Domain/Resource/Action sẽ bị xoá.
- [ ] App-Service Mapping: chọn và đổi `role`, hiển thị `role` ở các section liên kết.
- [ ] Mock, types, i18n, permissions (D13), `openapi.yaml`.

### 4.4 `iam-service`

- [ ] Migration:
  - Đổi tên cột `AppCode` → `ServiceCode` (D7), backfill = đoạn 1 của `Code`.
  - Thêm cột `RegistryActionId` (nullable, unique).
- [ ] **Bỏ** các endpoint `POST /permissions`, `PUT /permissions/{id}`, `DELETE /permissions/{id}`, `DELETE /permissions/apps/{appCode}`, `POST /permissions/import`.
- [ ] Giữ endpoint đọc, đổi tên theo D7: `GET /permissions`, `GET /permissions/{id}`, `GET /permissions/role/{roleId}`, `GET /permissions/services` (trước là `/apps`). Filter `appCode` đổi thành `serviceCode`.
- [ ] Thêm `PUT /permissions/{id}/roles` để gán/gỡ role (D10). Gán từ màn hình Role giữ nguyên.
- [ ] Thêm `POST /permissions/sync` (D11): làm theo mục 2.2 và 2.3, chạy trong một transaction, trả `{ created, updated, deleted }`.
- [ ] Client PLM: cấu hình `Plm:BaseUrl`, forward token của người bấm, có timeout.

### 4.5 `iam-web`

- [ ] Đổi `appCode` → `serviceCode` trong types, API, query keys, filter, grouped view, mock, i18n. Label đổi thành "Service".
- [ ] Màn hình permission thành **chỉ xem**:
  - Bỏ form tạo/sửa, nút xoá, nút xoá theo app, và import.
  - Thêm nút **"Đồng bộ từ PLM"**: hộp xác nhận, rồi hiển thị kết quả tạo/cập nhật/xoá.
  - Chi tiết permission chỉ cho sửa danh sách role.

## 5. Thứ tự thực hiện

1. Mình: `docs.business` (4.1), `platform-management-api` (4.2), `platform-management-web` (4.3). **Bạn deploy** PLM.
2. **Bạn export** danh mục từng app trên iam-web, rồi **import** vào PLM (mục 2.3).
3. Mình: `iam-service` (4.4), `iam-web` (4.5). **Bạn deploy hai repo này cùng lúc**, vì việc đổi tên field không tương thích ngược.
4. Bạn bấm "Đồng bộ từ PLM" lần đầu trên iam-web.

Bước 4 chỉ làm sau bước 2. Nếu đồng bộ khi PLM chưa có dữ liệu thì bị huỷ (chốt an toàn ở 2.2). Nếu PLM mới có một phần dữ liệu thì phần còn thiếu sẽ bị xoá khỏi IAM.

## 6. Rủi ro (đã chấp nhận theo D5)

- Xoá hoặc đổi mã Action ở PLM, rồi đồng bộ, thì user mất quyền tương ứng ngay. Role đã gán cho Action cũ cũng không được giữ lại.
- Đổi mã Service/Domain/Resource ở PLM thì mã quyền trong IAM đổi theo, nhưng code các service vẫn kiểm tra mã cũ. Việc giữ hai bên khớp nhau là việc của người quản trị.
- Người bấm đồng bộ cần quyền xem danh mục quyền của PLM (`PLM.REGISTRY.PERMISSION.VIEW`).

## 7. Tiêu chí hoàn thành

- [ ] PLM: thêm, sửa, xoá Action theo Resource; import/export danh mục quyền; `permission-catalog` trả đủ dữ liệu.
- [ ] IAM: không còn API nào tạo, sửa hay xoá permission; iam-web không còn form tạo/sửa.
- [ ] Đồng bộ: sau khi bấm, danh mục quyền ở IAM khớp 100% với PLM. Đổi mã Resource ở PLM rồi đồng bộ thì role đã gán vẫn giữ nguyên.
- [ ] PLM lỗi hoặc trả danh mục rỗng thì đồng bộ bị huỷ, IAM không thay đổi.
- [ ] IAM không còn `appCode`.
- [ ] `/me/apps` lọc đúng theo Service Primary.

## 8. Phụ lục: hợp đồng API (nguồn chuẩn cho mọi repo)

Định dạng mã quyền: regex `^[A-Z][A-Z0-9_]*(\.[A-Z][A-Z0-9_]*){3}$`. Action: `^[A-Z][A-Z0-9_]*$`.
Qua gateway, các API PLM có prefix `/plm` (ví dụ `https://apigateway.hvanexus.trinhpb.site/plm/registry/permission-catalog`).

### 8.1 PLM — Resource / Action

- `ResourceResponse` có thêm `actions: string[]` (sắp xếp tăng dần).
- `POST /registry/resources` body có thêm `actions?: string[]`.
- `PUT /registry/resources/{id}` body có thêm `actions?: string[]` — nếu có thì **thay toàn bộ** danh sách (action giữ nguyên thì giữ `id`).
- `GET /registry/resources/options?domainId=&keyword=` → `[{ id, resourceCode, name, domainId }]` (quyền `PLM.REGISTRY.RESOURCE.VIEW`).

### 8.2 PLM — App-Service Mapping

- `MappingResponse` có thêm `role: "Primary" | "Dependency"`.
- `POST /registry/app-service-mappings` body `{ appId, serviceId, role? }` (mặc định `Dependency`).
- `PUT /registry/app-service-mappings/{id}` body `{ role }` → `MappingResponse` (quyền `PLM.REGISTRY.APP_SERVICE_MAPPING.ASSIGN`).
- List hỗ trợ filter/sort field `role`.

### 8.3 PLM — Xoá kèm dữ liệu con

- `GET /registry/services/{id}/delete-impact` → `{ domains, resources, actions, mappings }`.
- `GET /registry/domains/{id}/delete-impact` → `{ resources, actions }`.
- `GET /registry/resources/{id}/delete-impact` → `{ actions }`.
- Quyền: quyền DELETE tương ứng. `DELETE` Service còn mapping → 409 `SERVICE_HAS_MAPPINGS`; còn lại xoá kèm dữ liệu con, trả 204.

### 8.4 PLM — Danh mục quyền

- `GET /registry/permission-catalog?serviceCode=` (quyền `PLM.REGISTRY.PERMISSION.VIEW`) →
  `[{ "id": "<uuid action>", "code": "FTM.DRIVER.DRIVER.VIEW", "serviceCode": "FTM", "domainCode": "DRIVER", "resourceCode": "DRIVER", "action": "VIEW" }]`, sắp xếp theo `code`.
- `POST /registry/permissions/import` (quyền `PLM.REGISTRY.PERMISSION.IMPORT`), multipart field `file` (`.txt`, tối đa 1 MB) → luôn 200:
  `{ "applied": true, "created": { "services": 0, "domains": 0, "resources": 0, "actions": 0 }, "skipped": 0, "errors": [{ "line": 3, "code": "...", "reason": "INVALID_FORMAT | DUPLICATE_IN_FILE" }] }`.
  Có lỗi thì `applied = false` và không ghi gì. File không có mã nào → 400 `FILE_REQUIRED`.
- `GET /registry/permissions/export?serviceCode=` (quyền `PLM.REGISTRY.PERMISSION.EXPORT`) → `text/plain; charset=utf-8`, `Content-Disposition: attachment; filename="permissions-<serviceCode|all>.txt"`, mỗi dòng một mã.

### 8.5 IAM

- `PermissionResponse`: `appCode` → `serviceCode`, thêm `registryActionId: uuid | null`.
- `PermissionsByRoleIdResponse`: `appCode` → `serviceCode`.
- `GET /permissions/services` → `[{ serviceCode, permissionCount }]` (thay `/permissions/apps`).
- Filter/sort field `appCode` → `serviceCode`.
- `PUT /permissions/{id}/roles` body `{ roleIds: uuid[] }` → 200.
- `POST /permissions/sync` → 200 `{ created, updated, deleted }`. PLM lỗi → 502 `PLM_UNAVAILABLE`; danh mục rỗng → 400 `PLM_CATALOG_EMPTY`. Permission tạo từ đồng bộ: `Name = Code`, `Description = ""`.
- Bỏ: `POST /permissions`, `PUT /permissions/{id}`, `DELETE /permissions/{id}`, `DELETE /permissions/apps/{appCode}`, `POST /permissions/import`.
- Cấu hình: `Plm:BaseUrl` (vd `https://apigateway.hvanexus.trinhpb.site/plm`), gọi `GET {Plm:BaseUrl}/registry/permission-catalog` với header `Authorization` của người bấm.
