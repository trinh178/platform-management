# Quy Tắc Chỉnh Sửa - Codebase

## Phạm Vi

`docs.codebase` chứa rule generate code và rule triển khai dùng chung cho các dự án dùng cùng codebase.

Dùng folder này để ghi:

- Module structure, routing, permission wiring và naming convention.
- API service pattern, query/mutation pattern, mock API pattern và cách dùng shared utility.
- Form, table, i18n, notification, loading, auth, state và import rule.
- Convention kỹ thuật có thể tái dùng giữa nhiều dự án.

## Không Thuộc Phạm Vi

Không ghi các nội dung sau vào `docs.codebase`:

- Business rule riêng của một dự án, domain entity, actor hoặc business flow.
- Endpoint contract cụ thể của một dự án, trừ ví dụ ngắn để minh họa rule generic.
- Backend database hoặc service internals.
- UI copy hoặc feature behavior thuộc business requirement.

## Khi Nào Cần Cập Nhật

Cập nhật `docs.codebase` khi thay đổi ảnh hưởng tới:

- Cách code nên được generate hoặc tổ chức trong repository.
- Pattern frontend có thể tái dùng, helper, factory hoặc rule dùng shared component.
- Convention mock implementation hoặc API service generic.
- Bất kỳ rule nào AI cần tuân theo khi tạo hoặc sửa source code.

## Quy Tắc Chỉnh Sửa

- Mỗi lần tạo hoặc sửa file trong `docs.codebase`, bắt buộc cập nhật `docs.codebase/CHANGELOG.md` trong cùng thay đổi. Entry changelog phải có ngày, nội dung thay đổi ngắn gọn và mục `Files` liệt kê các file `docs.codebase` đã tạo hoặc cập nhật. Nếu cập nhật docs để phản ánh thay đổi source code, chỉ thêm mục `Related Source Files` cho các file source thuộc codebase generic hoặc module mẫu `employee`; không liệt kê file thuộc nghiệp vụ hoặc module cụ thể của một dự án.
- Chỉ thêm hoặc sửa nội dung trong `docs.codebase` khi nội dung đó là rule/pattern triển khai có thể tái dùng.
- Nếu thay đổi nói về nghiệp vụ, hành vi sản phẩm, actor, permission hoặc domain của một dự án cụ thể, không ghi vào `docs.codebase`.
- Nếu thay đổi nói về endpoint path, request, response hoặc API contract cụ thể của một dự án, không ghi vào `docs.codebase`.
- Nếu cần dùng ví dụ, giữ ví dụ ở mức generic hoặc ẩn danh; không nhúng tên dự án, domain nghiệp vụ hoặc endpoint cụ thể.
- Nếu nội dung không thuộc phạm vi codebase generic, không ghi vào `docs.codebase`.

## Ví Dụ

- "List API nên dùng pattern `ListRequest` và `ListResponse`" thuộc folder này.
- "Dùng `buildMockListResponse` cho mock list route" thuộc folder này.
- `GET /<resource>/options` không thuộc folder này nếu đó là endpoint cụ thể của một dự án.
- "Một rule tính toán nghiệp vụ riêng của dự án" không thuộc folder này.
