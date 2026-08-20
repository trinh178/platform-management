// Trạng thái lựa chọn hiện tại trong cây Service → Domain → Resource.
// `id` có giá trị = xem/sửa entity đã tồn tại; `id` rỗng = đang tạo mới
// (serviceId/domainId khi đó là parent được chọn sẵn từ nút "+" trên cây).
export type StructureSelection =
  | { kind: 'service'; id?: string }
  | { kind: 'domain'; id?: string; serviceId?: string }
  | { kind: 'resource'; id?: string; domainId?: string }
  | null;
