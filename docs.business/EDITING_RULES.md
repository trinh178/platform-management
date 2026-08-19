# Quy Tắc Chỉnh Sửa `platform-management/docs`

`platform-management/docs` lưu kiến thức nghiệp vụ của Platform Management (PLM) trong HVA Nexus. Tài liệu trong thư mục này phải mô tả hệ thống ở góc nhìn business: sản phẩm làm gì, ai được làm, dữ liệu nghiệp vụ nào tồn tại, rule nào chi phối hành vi, và domain nào sở hữu phần nào.

Không dùng thư mục này để mô tả cách code được tổ chức hoặc triển khai.

## 1. Trước Khi Sửa

- Đọc `README.md` trước. Đây là nơi nắm overview, domain structure, conventions và source of truth hiện tại.
- Nếu sửa một domain cụ thể, đọc `domains/<domain>/domain.yaml` của domain đó trước.
- Nếu thay đổi chạm cross-domain (REGISTRY ảnh hưởng SETTINGS hoặc ngược lại), đọc cả hai domain trước khi sửa.
- Nếu sửa actor, permission, enum, reference, sitemap, entity dùng chung hoặc convention, đọc file tương ứng trong `shared/`.
- Nếu sửa tích hợp service ngoài (IAM, Asset Service), đọc thêm `external-services.yaml` và flow đang phụ thuộc service đó.
- Nếu thay đổi liên quan tới nội dung gốc, đối chiếu lại `platform-management/_raw-docs/draft.md` để không lệch business intent ban đầu.

## 2. Nguyên Tắc Chung

- Viết theo ngôn ngữ nghiệp vụ trước, kỹ thuật sau.
- Tuân theo convention hiện có của repo trước; chỉ dùng rule generic này để lấp khoảng trống khi chưa có quy định cụ thể.
- Mỗi nội dung phải có domain sở hữu rõ ràng (REGISTRY hoặc SETTINGS).
- Một rule nghiệp vụ chỉ nên có một source of truth; file tóm tắt hoặc file tham khảo phải trỏ về nguồn chính.
- Khi sửa rule/flow/entity, cập nhật các tài liệu liên quan trong cùng thay đổi để tránh lệch.
- Không ghi giả định mơ hồ. Nếu business chưa quyết định, ghi rõ là `TBD` hoặc mở câu hỏi cần xác nhận.
- Không nhúng chi tiết source code, tên file implementation, tên component/hook/service hoặc pattern framework.
- Nhớ ranh giới cốt lõi của PLM: chỉ lưu **metadata/cấu hình platform**, không bao giờ lưu business data thực tế của service khác (xem README.md mục 8 - Responsibility Boundary).

## 3. Phạm Vi Của `platform-management/docs`

Nên ghi:

- Domain, scope, ownership, includes/excludes.
- Actor, permission, vai trò hành động trong flow.
- Entity nghiệp vụ, field nghiệp vụ, constraint dữ liệu.
- Flow nghiệp vụ, trigger, input/output ở mức khái niệm.
- Rule validation, rule tính toán, state transition, policy cross-domain.
- Feature ở mức khả năng sản phẩm: page/action/system.
- Enum, reference type, sitemap hoặc navigation ở mức nghiệp vụ.
- External dependency ở mức business: hệ thống phụ thuộc service nào, dữ liệu gì được trao đổi, vì sao cần tích hợp.

Không ghi:

- Tên UI component, page component, hook, store, query key, service class, mock file, test file.
- Pattern frontend/backend, cấu trúc thư mục source, form/table implementation, caching, state management, i18n implementation.
- Database table, migration, repository, queue worker, internal job, adapter hoặc SDK implementation.
- DTO/API schema chi tiết của API nội bộ; nếu dự án có tài liệu API riêng (`docs.api`), ghi ở đó thay vì business docs.
- Copy UI, layout, icon, màu sắc hoặc quyết định presentation thuần kỹ thuật.

## 4. Ranh Giới Với Tài Liệu Khác

- `platform-management/docs`: nghiệp vụ, domain ownership, entity/flow/rule/permission ở mức business.
- `docs.api` (nếu có): endpoint, request/response, status code, error code, DTO/schema chi tiết.
- `docs.codebase` (nếu có): module code, pattern triển khai, component, hook, service, mock, form/table, testing.

Business flow có thể map sang API bằng `method` và `path` nếu cần liên kết, nhưng không nên bung chi tiết request/response như API spec. Input/output trong business docs chỉ nên là tên field/khái niệm nghiệp vụ hoặc contract chung.

External service docs (`external-services.yaml`) có thể mô tả request/response ở mức đủ hiểu tích hợp giữa hệ thống, nhưng không mô tả adapter code, SDK, retry, caching hoặc implementation nội bộ.

## 5. Cấu Trúc Domain

- Domain hiện có (`REGISTRY`, `SETTINGS`) đã thống nhất baseline gồm `name`, `description`, `scope`, `entities`, `flows`, `rules`, `features`, `permissions`. Domain mới nếu phát sinh phải theo đúng baseline này.
- Không tự ý đổi tên section, cách đặt key hoặc thứ tự chính.
- Không bắt buộc mọi domain đều có đầy đủ tất cả section, nhưng section đã có phải nhất quán với domain còn lại.

## 6. Entity Và Contract Nghiệp Vụ

- Entity là contract nghiệp vụ, không mặc định là database table.
- Field chỉ nên xuất hiện nếu có ý nghĩa business, được nhập/xem/tính/lưu/đối chiếu theo nghiệp vụ.
- Field response-only/nested/reference (ví dụ `app: object(AppPreview)?`) phải ghi rõ là dữ liệu tham chiếu hoặc object chỉ để đọc.
- Constraint nội bộ entity đặt gần entity (`entities.<EntityName>.constraints`).
- Rule cross-entity hoặc rule liên quan flow/state/calculation đặt trong `rules` cấp domain.
- Entity audit dùng cờ `audit: true` theo `shared/conventions.yaml#audit_fields_ref` - không liệt kê tay từng audit field trong từng entity.
- Entity singleton (Settings) phải ghi rõ constraint dạng "single `<Entity>` record" và không được có flow create/delete.

## 7. Flow, Feature, Permission

- Flow phải mô tả hành vi nghiệp vụ, không mô tả cách function/service chạy.
- Flow cần xác định actor chính, permission cần có và output kỳ vọng.
- Flow list/search/filter phải dùng contract list chung trong `shared/conventions.yaml#list_contracts`.
- Feature `page` nên khai báo route nghiệp vụ nếu route là một phần của product surface.
- Feature `action` chỉ khai báo route khi route đó có ý nghĩa ở mức sản phẩm.
- Permission phải theo pattern `PLM.<Domain>.<Resource>.<Action>` và dùng action chuẩn trong `shared/permissions.yaml`.
- Actor permission mapping gán trực tiếp permission cho actor trong `shared/actor-permissions.yaml`, tránh tạo role trung gian.

## 8. Shared Business Files

- `actors.yaml`: danh sách actor nghiệp vụ.
- `permissions.yaml`: pattern permission và action chuẩn.
- `actor-permissions.yaml`: mapping actor với permission.
- `enums.yaml`: enum và value set dùng trong nhiều domain.
- `entities.yaml`: entity/shape dùng chung (preview shape, audit fields, asset ref).
- `references.yaml`: loại reference cross-domain/cross-service được phép dùng.
- `sitemap.yaml`: base path ở mức nghiệp vụ.
- `conventions.yaml`: quy ước chung như casing, định dạng code Registry, list contract, file upload.

Không đưa định nghĩa dùng riêng một domain vào `shared/` nếu chưa có nhu cầu dùng chung thật sự.

## 9. External Services

Khi ghi service ngoài trong `external-services.yaml`:

- Ghi mục đích nghiệp vụ của service.
- Ghi caller ở mức hệ thống/người dùng nếu cần.
- Ghi dữ liệu trao đổi quan trọng và mapping business.
- Ghi rủi ro/giới hạn nghiệp vụ nếu service lỗi, thiếu cấu hình hoặc trả dữ liệu không đủ.
- Không lưu credential bí mật trực tiếp trong docs hoặc repo; chỉ ghi tên env var, secret store hoặc mô tả phi bí mật.
- Không mô tả implementation adapter, package SDK, retry code, cache code hoặc file source.

## 10. Tài Liệu Tóm Tắt Và Tham Khảo

- File tóm tắt chỉ phục vụ tra cứu nhanh, không thay thế rule nguồn.
- Phải ghi rõ file nào là source of truth nếu có nhiều file liên quan.
- Khi rule nguồn đổi, cập nhật file tóm tắt trong cùng thay đổi.
- Nếu file tóm tắt mâu thuẫn với source of truth, source of truth (`domain.yaml`) thắng.

## 11. Naming Và Format

- Entity: `PascalCase` số ít.
- Flow: `snake_case`, thường là `verb_object`.
- Feature: `snake_case`, unique trong phạm vi dự án.
- Enum name: `snake_case`.
- Permission key: `PLM.<Domain>.<Resource>.<Action>`.
- Route/path: kebab-case.
- Field contract: `camelCase`.
- Code Registry (`appCode`, `serviceCode`, `domainCode`, `resourceCode`): `UPPER_SNAKE_CASE`.

Giữ YAML/Markdown gọn, dễ diff:

- Mỗi bullet chỉ nói một ý.
- YAML phải parse được, indentation ổn định và không trộn tab/space.
- Giữ key ordering theo convention hoặc domain còn lại đã có.
- Comment chỉ dùng để giải thích ý nghiệp vụ khó hiểu.
- Không thêm ví dụ dài nếu rule đã đủ rõ.

## 12. Khi Nào Cần Cập Nhật

Cập nhật `platform-management/docs` khi thay đổi ảnh hưởng tới:

- Product capability hoặc scope domain (REGISTRY/SETTINGS).
- Entity field, constraint, enum value, reference type.
- Flow, actor, permission hoặc state transition.
- Rule validation, calculation, warning hoặc policy cross-domain.
- External dependency (IAM, Asset Service) hoặc dữ liệu trao đổi.
- Route/feature/navigation ở mức sản phẩm.

Không cần cập nhật nếu thay đổi chỉ là refactor code, đổi component, đổi hook, tối ưu cache, đổi style UI, đổi test implementation hoặc đổi mock mà không làm đổi nghiệp vụ.

## 13. Checklist Trước Khi Hoàn Tất

- Đã đọc `README.md`, domain spec và shared conventions liên quan chưa?
- Nội dung mới có thật sự là nghiệp vụ không?
- Domain sở hữu (REGISTRY hay SETTINGS) đã đúng chưa?
- Có trùng hoặc mâu thuẫn với source of truth khác không (đặc biệt GeneralSetting vs LocalizationSetting)?
- Entity, flow, feature, permission có khớp nhau không?
- Enum/shared/reference mới đã được khai báo đúng nơi chưa?
- Rule tính toán/cảnh báo/state transition có đủ condition và effect/on_violation chưa?
- Entity singleton có bị vô tình thêm flow create/delete không?
- YAML/Markdown có parse/hiển thị ổn và theo format hiện có không?
- Có vô tình ghi chi tiết code/API/database/UI implementation không?
- Có ghi secret hoặc trỏ tới file secret trong docs/repo không?

## 14. Ví Dụ Ngắn

- "appCode phải duy nhất toàn platform và theo UPPER_SNAKE_CASE" thuộc `platform-management/docs`.
- "Endpoint trả HTTP 409 khi appCode bị trùng" thuộc `docs.api`.
- "Form dropdown chọn Service dùng debounce 300ms" thuộc `docs.codebase`.
- "Nếu BrandingSetting.logoAssetId để trống, UI dùng OrganizationSetting.logoAssetId" thuộc `platform-management/docs`.
