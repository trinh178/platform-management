// Action: UPPER_SNAKE_CASE, không bắt buộc thuộc danh sách chung (D6).
export const RESOURCE_ACTION_PATTERN = /^[A-Z][A-Z0-9_]*$/;

// Gợi ý nhanh khi nhập actions cho Resource.
export const RESOURCE_ACTION_SUGGESTIONS = [
  'CREATE',
  'VIEW',
  'UPDATE',
  'DELETE',
] as const;
