# 08 — Notifications, Loading & Modals

## Notifications — notify

**KHÔNG dùng `toast` từ sonner trực tiếp (ESLint báo lỗi):**

```ts
// ❌ FORBIDDEN
import { toast } from 'sonner';

// ✅ ĐÚNG
import { notify } from '@/core/notification';
```

### API của notify

```ts
// Success toast (auto-translate nếu là TranslationsKey)
notify.success('common.notify.create_success');   // → translated text
notify.success('Thêm thành công');                 // Raw string

// Error
notify.error('common.notify.error');
notify.error(error.message);

// Warning / Info
notify.warning('Cảnh báo: ...');
notify.info('Thông tin: ...');

// Loading — trả về ID để dismiss
const id = notify.loading('common.notify.loading');
notify.dismiss(id);

// Custom toast
notify.custom(id => (
  <div>
    <p>Custom content</p>
    <button onClick={() => notify.dismiss(id)}>Đóng</button>
  </div>
), { duration: Infinity });

// Dismiss
notify.dismiss();           // Dismiss all
notify.dismiss(toastId);    // Dismiss specific
```

## Loading Controllers

### App Loading (Spinner overlay)

```ts
import appLoadingControl from '@/core/loading';

const key = appLoadingControl.show();   // Hiện spinner
appLoadingControl.hide(key);            // Ẩn spinner

// Hoặc dùng hook
import { useAppLoading } from '@/core/loading';
useAppLoading(isFetching);  // Auto show/hide theo boolean
```

### Prevent Interactive (semi-transparent overlay, không có spinner)

```ts
import appLoadingControl from '@/core/loading/prevent-interactive';

const key = appLoadingControl.show();
appLoadingControl.hide(key);
```

### Tự động qua Query Meta

```ts
// Mutation defaults: showLoading: true (toast "Đang xử lý...")
const mutation = useEmployeeCreate({
  meta: {
    showLoading: true,         // Toast "Đang xử lý..."
    // showLoading: 'SPINNER'  // Spinner overlay thay vì toast
  },
});
```

## Confirm Dialog

```tsx
import { useTranslations } from 'next-intl';
import { useConfirm } from '@/core/confirmation/confirm-provider';
import EmployeeDeleteConfirmContent from '../employee-delete-confirm-content';
import { useEmployeeDelete } from '../../services/employee.mutation';

function DeleteButton({ employee }: { employee: EmployeePreview }) {
  const t = useTranslations();
  const confirm = useConfirm();
  const deleteMutation = useEmployeeDelete({
    meta: { notifySuccess: 'common.notify.delete_success' },
  });

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: t('employee.deleteConfirm.title'),
      description: t('employee.deleteConfirm.description'),
      content: <EmployeeDeleteConfirmContent employee={employee} />, // ReactNode hiển thị giữa description và buttons
      variant: 'danger',                  // 'default' | 'danger' | 'warning' | 'success'
      confirmText: t('common.control.delete'),
      cancelText: t('common.control.cancel'),
    });

    if (confirmed) deleteMutation.mutate(employee.id);
  };

  return (
    <Button variant="destructive" onClick={handleDelete}>
      {t('common.control.delete')}
    </Button>
  );
}
```

> Prop `content` (ReactNode) cho phép custom UI bên trong modal — ví dụ hiển thị card thông tin entity sắp xóa (avatar, tên, mã) để user xác nhận đúng record.

### Rule: dịch sẵn trước khi pass

`useConfirm` options đều là **plain string**, **KHÔNG** phải `TranslationsKey`:

```ts
type ConfirmOptions = {
  title?: string;
  description?: string;
  content?: ReactNode;     // Custom UI giữa description và buttons (vd: card thông tin entity)
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success';
};
```

→ Phải dùng `t('your.key')` để dịch trước, **không** pass key trực tiếp như `notify.success()`. Pass key chưa dịch sẽ hiển thị raw key.

```ts
// ❌ SAI — sẽ hiển thị raw "employee.deleteConfirm.title"
confirm({ title: 'employee.deleteConfirm.title' });

// ✅ ĐÚNG
confirm({ title: t('employee.deleteConfirm.title') });
```

## App Modal (Dynamic Modal)

```ts
import appModalControl from '@/core/modal';

// Mở modal với AppWrapper (Dialog có title)
appModalControl.open(MyComponent, props, {
  title: 'Tiêu đề modal',
});
```

### ModalBaseProps — bắt buộc cho modal components

```ts
import { ModalBaseProps } from '@/core/common/dynamic-modal';

interface MyModalProps extends ModalBaseProps {
  employeeId: string;
  onSuccess?: () => void;
}

function EmployeeModal({ modalThis, employeeId, onSuccess }: MyModalProps) {
  return (
    <div>
      {/* content */}
      <Button onClick={() => {
        onSuccess?.();
        modalThis?.close();
      }}>
        Lưu
      </Button>
    </div>
  );
}
```

### useAppModalComponentControl — Persistent modal control

```tsx
import appModalControl, { useAppModalComponentControl } from '@/core/modal';

function ParentComponent() {
  const employeeModalControl = useAppModalComponentControl(
    appModalControl,
    EmployeeModal,
    {},                              // initial props
    { title: 'Chi tiết nhân viên' }, // wrapper props (title)
  );

  return (
    <Button onClick={() => employeeModalControl.open({ employeeId: '123' })}>
      Xem chi tiết
    </Button>
  );
}
```

## Pattern: Mutation với auto notifications

**Rule:** Khi mutation cần success/error toast, truyền qua `meta.notifySuccess` / `meta.notifyError`.
Không gọi `notify.success()` trong `onSuccess` hoặc `notify.error()` trong `onError` nếu toast đó là kết quả trực tiếp của mutation.
`onSuccess` / `onError` chỉ nên dùng cho side effect khác như navigate, đóng modal, reset form, invalidate phụ hoặc cập nhật local state.

```ts
// useAppMutation defaults:
// - showLoading: true  → toast "Đang xử lý..."
// - notifySuccess: true → toast "Xử lý thành công"
// - notifyError: true  → toast error message

// Override cho từng mutation:
const mutation = useEmployeeCreate({
  meta: {
    showLoading: 'SPINNER',                       // Spinner thay vì toast
    notifySuccess: 'common.notify.create_success', // Custom success message (TranslationsKey)
    notifyError: false,                            // Tắt error notification
  },
  onSuccess(data) {
    // Chỉ xử lý side effect; toast success đã được xử lý bởi meta.notifySuccess.
    router.push(`/details?id=${data.id}`, { relative: true });
  },
});
```
