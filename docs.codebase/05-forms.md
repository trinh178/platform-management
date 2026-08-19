# 05 — Forms

## Form Setup cơ bản

```tsx
'use client';

import { useForm } from 'react-hook-form';
import z from 'zod';
import {
  useFormValidateResolver,
  createFormValidateResolverWithTranslations,
} from '@/core/form';

// 1. Khai báo type (thường lấy từ types/<entity>.ts)
type EmployeeFormValues = {
  employeeCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
};

// 2. Tạo resolver (tách ra file form-validate-resolver.ts riêng)
export const employeeFormResolver =
  createFormValidateResolverWithTranslations<EmployeeFormValues>(t => ({
    employeeCode: z.string().min(1, t('validation.required')),
    firstName: z.string().min(1, t('validation.required')),
    lastName: z.string().min(1, t('validation.required')),
    dateOfBirth: z.date().optional(),
  }));

// 3. Trong component
function EmployeeForm() {
  const formResolver = useFormValidateResolver(employeeFormResolver);

  const form = useForm<EmployeeFormValues>({
    resolver: formResolver,
    defaultValues: {
      employeeCode: '',
      firstName: '',
      lastName: '',
    },
  });

  const handleSubmit = form.handleSubmit(data => {
    // Submit
  });
}
```

> `createFormValidateResolverWithTranslations` nhận **`strictSchemaFn`** (chỉ khai báo fields, không cần `z.object()`) hoặc **`schemaFn`** (nhận `z.ZodObject` đầy đủ). Dùng `strictSchemaFn` cho hầu hết trường hợp.

## Props `required` và `tooltip` trên FieldInput\*

### `required`

Tất cả `FieldInput*` đều hỗ trợ prop `required`. Khi set `required`, component hiển thị dấu `*` bên cạnh label để báo hiệu field bắt buộc.

**Quy tắc:** Thêm `required` vào field khi validator Zod tương ứng dùng `stringRequired`, `numberRequired`, `dateRequired`, `objectRequired`, hoặc bất kỳ rule không có `.optional()`. `required` chỉ là visual indicator — validation thực sự vẫn do Zod xử lý.

```tsx
<FieldInputText
  label={t('employee.fields.firstName')}
  placeholder={t('employee.placeholder.firstName')}
  required // ← thêm khi validator không optional
  form={form}
  name="firstName"
  mode={fieldMode}
/>
```

### `tooltip`

Tất cả `FieldInput*` đều hỗ trợ prop `tooltip`. Khi set, component hiển thị icon `?` bên cạnh label — hover/click vào sẽ hiện popover giải thích thêm.

**Quy tắc:** Thêm `tooltip` vào field khi label không đủ rõ ràng để user hiểu được ý nghĩa hoặc cách nhập. Các trường hợp nên thêm:

- Field có ràng buộc không hiển nhiên (VD: "Ngưỡng nghiêm trọng phải ≥ Ngưỡng cảnh báo")
- Field liên quan đến thuật ngữ kỹ thuật/nghiệp vụ khó hiểu nếu chỉ nhìn label (VD: "chênh lệch thực tế", "chu kỳ ngắn")
- Field optional nhưng có tác động lớn nếu để trống (VD: `effectiveTo` của một cấu hình có hiệu lực theo thời gian)
- Field có logic tự động ít rõ ràng (VD: `scope` của một cấu hình có thứ tự ưu tiên)

Nội dung tooltip nên đặt trong i18n (`tooltip` key, cùng cấp với `fields`, `placeholder`).

```tsx
<FieldInputNumber
  label={t('settings.threshold.fields.warningPercent')}
  tooltip={t('settings.threshold.tooltip.warningPercent')}
  required
  form={form}
  name="warningPercent"
  mode={fieldMode}
/>
```

```json
// vi.json
{
  "settings": {
    "threshold": {
      "tooltip": {
        "warningPercent": "Khi giá trị thực tế vượt ngưỡng cấu hình quá tỷ lệ này, bản ghi được đánh dấu Cảnh báo. VD: 10 nghĩa là vượt trên 10% so với ngưỡng."
      }
    }
  }
}
```

## Rule bắt buộc khi làm CRUD Form

Khi xây dựng form cho CRUD module, **bắt buộc dùng các component `FieldInput*` trong `src/shared/components/form`** để render field. Không dùng trực tiếp `Input`, `Textarea`, `Select`, `DatePicker`, `AddressPicker`, `Switch`, hoặc component UI gốc trong module CRUD.

Lý do: `FieldInput*` đã chuẩn hóa kết nối với `react-hook-form`, label/error, mode `VIEW`/`EDIT`, inline edit, clear/reset, placeholder, disabled/loading, và layout nút bên phải. Nếu module tự ghép input lẻ, hành vi form sẽ lệch nhau giữa các màn create/details/update.

Với form có nhiều nhóm thông tin, mỗi nhóm phải dùng `SectionPanel` từ
`@/shared/components/layout/section-panel` để giữ style section/panel thống nhất. Không dùng wrapper thủ công
kiểu `border bg-white rounded-md p-4` trong CRUD form.

Khi một section có nhiều **nhóm con** bên trong (ví dụ "General / CCCD / Education" trong basic info), dùng
`SubSection` từ `@/shared/components/layout/sub-section` cho từng nhóm con — KHÔNG dùng `FieldSet` raw +
inline border classnames (`border-dashed border-emerald-700` v.v.). `SubSection` mirror props của
`SectionPanel` (`title`, `description`, `actions`, `contentClassName`) nhưng render nhẹ hơn (dashed border,
no shadow, heading `<h3>` text-primary) để phân cấp visual rõ ràng.

Nếu chưa có loại field phù hợp, **không workaround trong module**. Hãy tạo thêm một `FieldInput*` mới trong `src/shared/components/form`, dùng `FieldInputBase`, thêm ví dụ vào `form-guide`, rồi mới dùng trong CRUD.

Ví dụ đúng:

```tsx
<FieldInputText
  label={t('employee.fields.firstName')}
  form={form}
  name="firstName"
  placeholder={t('employee.placeholder.firstName')}
/>
```

Ví dụ không đúng trong CRUD:

```tsx
<Input
  value={form.watch('firstName')}
  onChange={e => form.setValue('firstName', e.target.value)}
/>
```

## Rule tạo FieldInput mới

Khi cần thêm loại field mới, làm theo checklist này:

1. Tạo UI thuần nếu cần ở `src/shared/components/<name>.tsx`.

   UI thuần không nhận `form`/`name`, chỉ nhận `value`, `onChange`, `disabled`, `readOnly`, `isError`, `placeholder`, và các props hiển thị cần thiết. Ví dụ hiện có: `select.tsx`, `multi-select.tsx`, `date-range-picker.tsx`.

2. Tạo wrapper form ở `src/shared/components/form/field-input-<name>.tsx`.

   Wrapper phải dùng `FieldInputBase` và truyền `RenderComponent`. Không tự dùng `Controller` trong từng field nếu không có lý do đặc biệt.

3. Value shape phải rõ ràng và submit-friendly.

   Ưu tiên lưu primitive hoặc object nhỏ phục vụ API: `string`, `number | undefined`, `boolean`, `string[]`, `{ from?: Date; to?: Date }`. Không lưu object UI nặng như `{ label, value }` nếu API chỉ cần `value`.

4. Clear/reset phải đi qua `FieldInputBase`.

   Field mới cần chọn `clearValue` mặc định phù hợp: text-like về `''`, multi-select về `[]`, boolean về `false`, các field optional về `undefined`. Nếu field không truyền `clearValue` riêng, `FieldInputBase` sẽ preserve nullable shape: field từng có value `null` thì clear về `null`, còn lại clear về `undefined`. RenderComponent không tự vẽ nút clear trừ khi có case đặc biệt và phải dùng `clearButtonPlacement="manual"`; nếu RenderComponent có thao tác xóa trực tiếp trong input, gọi `handleClear()` để đồng bộ behavior với nút clear của base.

5. Nếu RenderComponent có nút riêng, dùng control lane của base.

   Các nút riêng như calendar/dropdown/generate phải nhận `componentControlStyle`, `componentControlClassName`, `componentInputStyle` từ `FieldInputBase`. Thứ tự hiển thị chuẩn là:

   ```txt
   [Nút riêng của RenderComponent] [Clear] [Reset/Edit/Save/Cancel]
   ```

6. Hỗ trợ đầy đủ mode.

   Field mới phải hoạt động đúng với `mode="VIEW"`, `mode="EDIT"`, và inline edit (`mode="EDIT" inlineEdit`). Inline edit phải dùng `currentValue`, `handleValueChange`, `onEditRef` từ render props, không tự commit vào form khi đang edit draft.

7. Chuẩn hóa props phổ biến.

   Nếu field có chỗ nhập/trigger, phải hỗ trợ `placeholder`. Nếu có dropdown/search, thêm `searchPlaceholder`. Nếu có option, đặt tên props giống field hiện có: `options`, `getOptionValue`, `getOptionLabel`, `renderOption`, `loadOptions`, `loadOption`.

8. Cập nhật tài liệu và form-guide.

   Sau khi tạo field mới, thêm example vào `src/modules/form-guide/components/field-input-guide`, thêm i18n `vi/en`, thêm dòng trong catalog, và cập nhật docs này.

## Props chung cho tất cả FieldInput

```ts
{
  label: string;           // Label hiển thị
  form: UseFormReturn;     // Form instance
  name: FieldPath;         // Field path (type-safe)
  mode?: 'VIEW' | 'EDIT'; // default 'EDIT'
  disabled?: boolean;
  className?: string;
  placeholder?: string;   // Placeholder cho các field có render hỗ trợ placeholder
  clearable?: boolean;    // Hiển thị nút clear khi field có value
  clearValue?: unknown;   // Override giá trị khi clear; nếu không truyền, base preserve null -> null, còn lại undefined

  // Inline edit (dùng trong Details page — mode EDIT + inlineEdit)
  inlineEdit?: boolean;
  onInlineSave?: (name, value) => void | Promise<void>;
  loading?: boolean;

  // Callback khi value thay đổi
  onValueChange?: (value, name, form) => void;
}
```

Inline edit dùng draft value nội bộ. Khi `inlineEdit` đang bật, field chỉ commit vào `react-hook-form` sau khi bấm Save và validate thành công; Cancel sẽ bỏ draft và khôi phục giá trị trước khi edit.

`clearable` dùng chung cho toàn bộ FieldInput. Default clear value theo loại field: text/textarea/email/password/masked/numeric/phone-number/time/radio-group/combobox/select-value/constant/country/async-select/tree/generated-text clear về `''`, checkbox-group/multi-combobox/multi-select/async-multi-select/entity-multi-select/entity-async-multi-select và file-upload multiple clear về `[]`, switch clear về `false`. Các field optional không truyền `clearValue` riêng như number/percent/year/currency/date/date-time/date-range/address/entity-select/entity-async-select/avatar/file-upload single clear về `undefined`, nhưng nếu form value từng là `null` thì `FieldInputBase` preserve và clear về `null`. Nếu field cần giá trị reset khác, truyền `clearValue`.

Ở mode `EDIT` thường, khi field dirty, FieldInputBase tự hiện nút reset để gọi `form.resetField(name)` và đưa field về default value hiện tại của react-hook-form.

---

## Toàn bộ FieldInput Components

### FieldInputText — input text thông thường

```tsx
import FieldInputText from '@/shared/components/form/field-input-text';

<FieldInputText
  label={t('employee.fields.firstName')}
  form={form}
  name="firstName"
  placeholder={t('employee.placeholder.firstName')}
/>;
```

---

### FieldInputAlphaText — input chỉ nhận chữ cái (a-z, A-Z, dấu cách)

Wrapper của text input nhưng lọc bỏ chữ số và ký tự đặc biệt khi nhập/paste. Dùng cho field họ tên, tên riêng — tránh user gõ nhầm số vào.

```tsx
import FieldInputAlphaText from '@/shared/components/form/field-input-alpha-text';

<FieldInputAlphaText
  label={t('employee.fields.firstName')}
  form={form}
  name="firstName"
  clearable
/>;
```

Props: `allowSpaces` (default `true`), `allowDiacritics` (default `true` — chấp nhận ký tự có dấu tiếng Việt), `maxLength`. Field type là `string`, `clearValue` mặc định `''`.

---

### FieldInputPersonName — wrapper cho tên người

Wrapper semantic của `FieldInputAlphaText` cho field tên người. Tự bật `allowSpaces`, `allowDiacritics`.

```tsx
import FieldInputPersonName from '@/shared/components/form/field-input-person-name';

<FieldInputPersonName
  label={t('employee.fields.firstName')}
  form={form}
  name="firstName"
/>;
```

---

### FieldInputTextArea — textarea nhiều dòng

```tsx
import FieldInputTextArea from '@/shared/components/form/field-input-textarea';

<FieldInputTextArea
  label={t('employee.fields.note')}
  form={form}
  name="note"
/>;
```

---

### FieldInputJson — textarea nhập JSON

Dùng cho field lưu chuỗi JSON như config, metadata, payload tùy biến. Value là `string`. Khi blur, component tự format lại bằng `JSON.stringify(JSON.parse(...), null, 2)` nếu JSON hợp lệ; nếu sai cú pháp thì giữ nguyên để Zod validation hiển thị lỗi.

```tsx
import FieldInputJson from '@/shared/components/form/field-input-json';

<FieldInputJson
  label={t('config.fields.payload')}
  form={form}
  name="payload" // field type: string
  rows={8}
  clearable
/>;
```

View mode render `<pre>` monospace nếu có value, hiển thị `-` nếu rỗng.

Props thường dùng: `rows` (số dòng textarea, mặc định `6`), `placeholder` (mặc định `{ "key": "value" }`). `clearValue` mặc định là `''`.

---

### FieldInputNumber — input số (value `number | undefined`)

Render bằng text input để kiểm soát tốt format, không dùng spinner native. Field lưu `number | undefined`, hỗ trợ số thập phân, số âm nếu bật, min/max, prefix/suffix đơn vị, format theo locale và không format lại khi user đang gõ.

```tsx
import FieldInputNumber from '@/shared/components/form/field-input-number';

<FieldInputNumber
  label={t('employee.fields.graduationYear')}
  form={form}
  name="graduationYear"
  min={1900}
  max={2100}
  clearable
/>;
```

Props thường dùng:

- `min`, `max`: clamp value khi blur.
- `fractionDigits`: cố định số chữ số thập phân khi format và round khi parse.
- `minFractionDigits`, `maxFractionDigits`: kiểm soát số chữ số thập phân khi format.
- `allowNegative`: cho nhập số âm.
- `prefix`, `suffix`: hiển thị đơn vị hoặc ký hiệu trong `InputGroup`.
- `locale`, `useGrouping`, `decimalSeparator`, `groupSeparator`: tùy chỉnh format/parse theo locale.

Khi value chỉ là chuỗi chữ số cần giữ số 0 đầu, dùng `FieldInputNumeric`, không dùng `FieldInputNumber`.

---

### FieldInputSliderNumber — slider chọn một giá trị trong khoảng (value `number | null | undefined`)

Dùng cho các giá trị number có khoảng giới hạn rõ và user thường điều chỉnh theo mức, ví dụ threshold, score, weight, phần trăm hoàn thành hoặc setting level. Value lưu vào form là `number`; trạng thái rỗng có thể là `undefined` hoặc `null` tùy form/schema.

```tsx
import FieldInputSliderNumber from '@/shared/components/form/field-input-slider-number';

<FieldInputSliderNumber
  label={t('settings.fields.warningThreshold')}
  form={form}
  name="warningThreshold"
  min={0}
  max={100}
  step={5}
  suffix="%"
  showInput
  clearable
/>;
```

Props thường dùng:

- `min`, `max`: bắt buộc, xác định khoảng slider.
- `step`: bước nhảy, default `1`.
- `defaultValue`: giá trị hiển thị khi field đang rỗng; form value vẫn là `undefined` cho đến khi user thay đổi.
- `showInput`: hiển thị ô nhập số phụ bên phải để nhập chính xác.
- `showValue`: hiển thị badge value bên phải khi không bật `showInput`.
- `showBounds`: hiển thị min/max bên dưới.
- `marks`: các mốc hiển thị bên dưới slider.
- `prefix`, `suffix`: hiển thị kèm value, bao gồm cả ô nhập phụ khi bật `showInput`.
- `locale`, `fractionDigits`, `minFractionDigits`, `maxFractionDigits`: format value.
- `formatValue`: custom render value nếu cần format riêng.

`null`, `undefined`, và `''` được xem là empty khi render, không bị normalize thành `0`. Khi empty, text/input hiển thị rỗng nhưng slider vẫn cần vị trí fallback nên dùng `defaultValue ?? min`. Nếu user xóa input phụ, component gọi `handleClear()` của `FieldInputBase`: field nullable đã từng nhận `null` sẽ clear về `null`, còn lại clear về `undefined` trừ khi caller truyền `clearValue` riêng.

---

### FieldInputNumeric — input chỉ nhận chữ số (kiểu `string`, không có spinner)

Khác với `FieldInputNumber`: giữ value là string, dùng `inputMode="numeric"` và tự lọc ký tự không phải chữ số khi nhập/paste. Phù hợp cho mã số, số CCCD, serial, mã pin, số điện thoại dạng text hoặc bất kỳ field nào cần giữ số 0 đầu.

```tsx
import FieldInputNumeric from '@/shared/components/form/field-input-numeric';

<FieldInputNumeric
  label={t('employee.fields.idNumber')}
  form={form}
  name="idNumber"
  maxLength={12}
  clearable
/>;
```

`clearValue` mặc định là `''`. Có thể truyền `maxLength`, `prefix`, `suffix`; nếu có case đặc biệt muốn tự xử lý ký tự nhập vào, đặt `stripNonDigits={false}`.

---

### FieldInputMasked — input text có mask

Dùng cho chuỗi cần hiển thị format cố định như mã số thuế, serial, mã hợp đồng. Mặc định component hiển thị mask nhưng lưu raw string vào form field.

```tsx
import FieldInputMasked from '@/shared/components/form/field-input-masked';

<FieldInputMasked
  label={t('company.fields.taxCode')}
  form={form}
  name="taxCode" // field type: string
  mask="###-###-###"
  placeholder="123-456-789"
  clearable
/>;
```

`maskChar` mặc định là `#`, `replacementPattern` mặc định nhận chữ số. Nếu muốn lưu cả dấu format vào form, truyền `valueMode="formatted"`.

---

### FieldInputPassword — input mật khẩu

Wrapper của text input với type password và nút hiện/ẩn mật khẩu nằm trong control lane của `FieldInputBase`.

```tsx
import FieldInputPassword from '@/shared/components/form/field-input-password';

<FieldInputPassword
  label={t('auth.fields.password')}
  form={form}
  name="password" // field type: string
  inputProps={{ autoComplete: 'new-password' }}
  clearable
/>;
```

`showToggle` mặc định là `true`; truyền `showToggle={false}` nếu không muốn nút hiện/ẩn mật khẩu.

---

### FieldInputPercent — input phần trăm

Dùng cho tỷ lệ, chiết khấu, thuế suất, phần trăm hoàn thành. Value là `number | undefined`, UI tự hiển thị suffix `%`.

```tsx
import FieldInputPercent from '@/shared/components/form/field-input-percent';

<FieldInputPercent
  label={t('contract.fields.discountRate')}
  form={form}
  name="discountRate" // field type: number | undefined
  fractionDigits={2}
  clearable
/>;
```

Props thường dùng:

- `fractionDigits`: số chữ số thập phân cố định khi blur/format.
- `percentSymbol`: ký hiệu hiển thị bên phải, mặc định `%`.

---

### FieldInputYear — input năm

Dùng cho giá trị chỉ có năm như năm tốt nghiệp, năm sản xuất, năm tài chính, năm hợp đồng. Value là `number | undefined`, UI chỉ nhận tối đa 4 chữ số.

```tsx
import FieldInputYear from '@/shared/components/form/field-input-year';

<FieldInputYear
  label={t('employee.fields.graduationYear')}
  form={form}
  name="graduationYear" // field type: number | undefined
  minYear={1900}
  maxYear={2100}
  clearable
/>;
```

`minYear` và `maxYear` là optional; nếu có truyền, field sẽ clamp value khi blur. Dùng `FieldInputYear` thay vì `FieldInputDate` khi API chỉ cần năm, không cần ngày/tháng.

---

### FieldInputEmail — input email

Wrapper của `FieldInputText` với `type="email"` và `inputMode="email"`.

```tsx
import FieldInputEmail from '@/shared/components/form/field-input-email';

<FieldInputEmail
  label={t('employee.fields.contact.email')}
  form={form}
  name="contact.email"
/>;
```

---

### FieldInputPhoneNumber — input số điện thoại

Field riêng cho số điện thoại, lưu value là `string` để không mất số 0 đầu. Component dùng `type="tel"`/`inputMode="tel"`, tự lọc dữ liệu paste về chuỗi số sạch, có thể giữ dấu `+`, giới hạn độ dài, hiển thị prefix mã quốc gia hoặc chọn đầu số từ danh sách.

Khuyến nghị cho CRUD quốc tế: tách mã quốc gia và số điện thoại thành 2 field form (`phoneCountryCode`, `phoneNumber`). Khi submit, transform theo API cần `phoneCountryCode + phoneNumber` hoặc gửi riêng 2 field.

```tsx
import FieldInputPhoneNumber from '@/shared/components/form/field-input-phone-number';

type EmployeeFormValues = {
  contact: {
    phoneCountryCode: string;
    personalPhoneNumber: string;
  };
};

<FieldInputPhoneNumber
  label={t('employee.fields.contact.personalPhoneNumber')}
  form={form}
  name="contact.personalPhoneNumber"
  countryCodeName="contact.phoneCountryCode"
  maxLength={10}
  clearable
/>;
```

Nếu nghiệp vụ chỉ dùng một đầu số cố định, có thể dùng prefix tĩnh:

```tsx
<FieldInputPhoneNumber
  label={t('employee.fields.contact.personalPhoneNumber')}
  form={form}
  name="contact.personalPhoneNumber"
  countryCode="+84"
  maxLength={10}
  clearable
/>
```

Props thường dùng:

- `countryCode`: hiển thị mã quốc gia cố định ở đầu input, ví dụ `+84`.
- `countryCodeName`: field path trong cùng form để lưu mã quốc gia đang chọn. Chỉ khi truyền prop này thì component mới hiển thị select chọn đầu số.
- `countryOptions`: override danh sách mã quốc gia mặc định, ví dụ `{ label: 'VN +84', value: '+84' }`. Không cần truyền nếu dùng danh sách mặc định (`VN +84`, `US +1`, `JP +81`, `KR +82`, `CN +86`, `SG +65`, `TH +66`, `MY +60`, `ID +62`, `PH +63`).
- `maxLength`: giới hạn độ dài chuỗi lưu trong form.
- `preservePlus`: giữ dấu `+` nếu user nhập số quốc tế. Khi dùng `countryCodeName`, mặc định không giữ `+` trong field số điện thoại để value là số nội địa sạch.
- `stripNonPhoneChars`: lọc ký tự không phải số khi nhập/paste, mặc định `true`.
- `formatOnBlur`: chỉ format hiển thị nhẹ theo nhóm khi blur; form value vẫn là chuỗi sạch.
- `prefix`, `suffix`: addon tùy biến nếu không dùng `countryCode`.

---

### FieldInputCurrency — input tiền tệ

Lưu `number | undefined`, hiển thị số đã format theo locale và symbol tiền tệ. Khi focus vào input, field chuyển sang dạng số thô để dễ sửa; khi blur sẽ parse, clamp theo `min/max` nếu có, rồi format lại.

```tsx
import FieldInputCurrency from '@/shared/components/form/field-input-currency';

<FieldInputCurrency
  label={t('finance.fields.amount')}
  form={form}
  name="amount"
  currencySymbol="VND" // optional, default 'VND'
  locale="en-US" // optional, default 'en-US'
  fractionDigits={0}
  min={0}
/>;
```

Props thường dùng:

- `currencySymbol`: symbol hiển thị, mặc định `VND`.
- `symbolPosition`: `'prefix' | 'suffix'`, mặc định `prefix`.
- `fractionDigits`, `minFractionDigits`, `maxFractionDigits`: số chữ số thập phân khi format.
- `allowNegative`: cho nhập số âm.
- `decimalSeparator`, `groupSeparator`: dùng khi cần parse format nhập theo locale khác.

---

### FieldInputDate — date picker

```tsx
import FieldInputDate from '@/shared/components/form/field-input-date';

<FieldInputDate
  label={t('employee.fields.dateOfBirth')}
  form={form}
  name="dateOfBirth"
/>;
```

Có thể truyền `dateDisabled` để disable ngày không được chọn. `clearValue` mặc định là `undefined`.
Các date picker dùng `Calendar` với `captionLayout="dropdown"` có default range năm từ `1900` đến năm hiện tại + `50`. Nếu cần giới hạn khác cho UI thuần, truyền `startMonth`/`endMonth` vào `Calendar`; nếu cần chặn ngày theo nghiệp vụ ở field form, ưu tiên dùng `dateDisabled`.

---

### FieldInputDateTime — date time picker

Dùng cho thời điểm chính xác như lịch hẹn, booking, log sự kiện. Value là `Date | undefined`, có ngày và giờ/phút.

```tsx
import FieldInputDateTime from '@/shared/components/form/field-input-date-time';

<FieldInputDateTime
  label={t('employee.fields.interviewAt')}
  form={form}
  name="interviewAt" // field type: Date | undefined
  clearable
/>;
```

Hỗ trợ `dateDisabled` và `placeholder`; `clearValue` mặc định là `undefined`. Dropdown năm dùng default range chung của `Calendar`: `1900` đến năm hiện tại + `50`.

---

### FieldInputTime — time picker

Dùng cho giá trị chỉ có giờ/phút như ca làm việc, giờ mở cửa. Value mặc định là string dạng `HH:mm`.

```tsx
import FieldInputTime from '@/shared/components/form/field-input-time';

<FieldInputTime
  label={t('employee.fields.startTime')}
  form={form}
  name="startTime" // field type: string
  clearable
/>;
```

`clearValue` mặc định là `''`. Có thể truyền `step` hoặc `inputProps.step` cho độ nhảy giây/phút của native time input.

---

### FieldInputDateRange — date range picker

Dùng cho khoảng thời gian như hợp đồng, báo cáo, filter theo ngày. Value nên là object `{ from?: Date; to?: Date }` hoặc `undefined`.

```tsx
import FieldInputDateRange from '@/shared/components/form/field-input-date-range';

<FieldInputDateRange
  label={t('employee.fields.contractPeriod')}
  form={form}
  name="contractPeriod" // field type: { from?: Date; to?: Date } | undefined
  clearable
/>;
```

Props thường dùng: `dateDisabled`, `numberOfMonths`, `placeholder`, `separator`. `clearValue` mặc định là `undefined`. Dropdown năm dùng default range chung của `Calendar`: `1900` đến năm hiện tại + `50`.

---

### FieldInputSelect — select từ option `{ label, value }`, lưu primitive `value`

Component nhận `options` dạng `{ label, value }`, dùng object để render label, nhưng khi chọn sẽ lưu `option.value` vào field. Dùng cho các field kiểu `string` như country code, constant value, qualification type.

```tsx
import FieldInputSelect from '@/shared/components/form/field-input-select';

<FieldInputSelect
  label={t('employee.fields.qualificationLevel')}
  form={form}
  name="qualificationLevel" // field type: string
  options={qualificationOptions}
  searchable
/>;
```

`clearValue` mặc định là `''`. Nếu value hiện tại chưa nằm trong `options`, có thể truyền `valueLabel` để hiển thị label fallback. Hỗ trợ `searchable`, `searchPlaceholder`, `searchManual`, `onSearchChange`, `debounceTime`, `emptyContent`, `renderOption`, `renderValue`, và `isOptionDisabled`.

---

### FieldInputCombobox — nhập tự do hoặc chọn suggestion

Dùng khi field có danh sách gợi ý nhưng vẫn cho nhập giá trị mới, ví dụ tên dân tộc, tôn giáo, ngành học, loại ghi chú. Component lưu primitive `string`; khi chọn option thì lưu `option.value`, khi nhập tự do thì lưu text đang gõ.

```tsx
import FieldInputCombobox from '@/shared/components/form/field-input-combobox';

<FieldInputCombobox
  label={t('employee.fields.ethnicity')}
  form={form}
  name="ethnicity" // field type: string
  options={[
    { label: 'Kinh', value: 'Kinh' },
    { label: 'Tày', value: 'Tay' },
  ]}
  placeholder={t('employee.placeholder.ethnicity')}
  clearable
/>;
```

Mặc định `allowCustom=true`. Nếu chỉ muốn user search trong option và không nhập ngoài danh sách, đặt `allowCustom={false}`. Có thể dùng `searchManual`, `onSearchChange`, `debounceTime` để nối với remote suggestion.

`clearValue` mặc định là `''`. Mặc định không tự mở popover khi gõ; nếu muốn mở suggestion khi nhập, truyền `openOnInput`. Props thường dùng: `emptyContent`, `renderOption`, `renderValue`, `isOptionDisabled`.

---

### FieldInputMultiCombobox — nhập nhiều giá trị tự do hoặc chọn nhiều suggestion

Dùng khi field có nhiều suggestion nhưng vẫn cho thêm giá trị mới, ví dụ tag, keyword, skill/certification. Component lưu `string[]`; click option để toggle chọn, nhập custom rồi Enter để thêm chip.

```tsx
import FieldInputMultiCombobox from '@/shared/components/form/field-input-multi-combobox';

<FieldInputMultiCombobox
  label={t('employee.fields.skills')}
  form={form}
  name="skills" // field type: string[]
  options={[
    { label: 'TypeScript', value: 'typescript' },
    { label: 'React', value: 'react' },
  ]}
  placeholder={t('employee.placeholder.skills')}
  clearable
/>;
```

`clearValue` mặc định là `[]`. Mặc định `allowCustom=true`, `addOnBlur=true`, không tự mở popover khi gõ. Nếu muốn mở suggestion khi nhập, truyền `openOnInput`.

Props thường dùng: `maxValues`, `searchManual`, `onSearchChange`, `debounceTime`, `emptyContent`, `renderOption`, `renderValue`, `isOptionDisabled`.

---

### FieldInputMultiSelect — select nhiều option `{ label, value }`, lưu `string[]`

Component nhận `options` dạng `{ label, value }`, hiển thị nhiều lựa chọn dạng chip và lưu mảng primitive `value` vào form field. Dùng cho role ids, tag ids, hoặc các nhóm mã chọn nhiều.

```tsx
import FieldInputMultiSelect from '@/shared/components/form/field-input-multi-select';

<FieldInputMultiSelect
  label={t('employee.fields.roles')}
  form={form}
  name="roleIds" // field type: string[]
  options={roleOptions}
  searchable
  clearable
/>;
```

`clearValue` mặc định là `[]`. Nếu form cần giá trị khác khi clear, truyền `clearValue`. Nếu value có id không nằm trong `options`, truyền `valueLabels` để hiển thị label fallback.

---

### FieldInputRadioGroup — chọn một option hiển thị sẵn

Dùng khi số option ít và nên nhìn thấy toàn bộ thay vì mở dropdown. Component lưu primitive string vào form field.

```tsx
import FieldInputRadioGroup from '@/shared/components/form/field-input-radio-group';

<FieldInputRadioGroup
  label={t('employee.fields.gender')}
  form={form}
  name="gender" // field type: string
  options={[
    { label: t('employee.constants.gender.male'), value: 'Male' },
    { label: t('employee.constants.gender.female'), value: 'Female' },
  ]}
  clearable
/>;
```

`clearValue` mặc định là `''`. Dùng `direction="vertical"` nếu label dài hoặc option cần xếp thành cột.

---

### FieldInputCheckboxGroup — chọn nhiều option hiển thị sẵn

Dùng khi số option ít và cần chọn nhiều giá trị. Component lưu `string[]` vào form field, tương tự `FieldInputMultiSelect` nhưng tất cả option được hiển thị sẵn.

```tsx
import FieldInputCheckboxGroup from '@/shared/components/form/field-input-checkbox-group';

<FieldInputCheckboxGroup
  label={t('employee.fields.roles')}
  form={form}
  name="roleIds" // field type: string[]
  options={roleOptions}
  clearable
/>;
```

`clearValue` mặc định là `[]`.

---

### FieldInputAsyncSelect — select load options bất đồng bộ

Dùng cho dropdown cần search remote. Component lưu primitive `option.value` vào form field, giống `FieldInputSelect`; module truyền `loadOptions(keyword)` từ API/service có sẵn, không gọi `fetch` trực tiếp trong component form.

```tsx
import React from 'react';
import FieldInputAsyncSelect from '@/shared/components/form/field-input-async-select';
import employeeApi from '@/modules/employee/services/employee.api';
import { getFullName } from '@/shared/utils';

const loadManagerOptions = React.useCallback(async (keyword: string) => {
  const response = await employeeApi.listPreviews({
    pageIndex: 0,
    pageSize: 20,
    searchTerm: keyword,
  });
  return response.items.map(emp => ({
    label: getFullName(emp.firstName, emp.lastName),
    value: emp.id,
  }));
}, []);

<FieldInputAsyncSelect
  label={t('employee.fields.managerId')}
  form={form}
  name="jobInfo.managerId" // field type: string
  loadOptions={loadManagerOptions}
  loadOption={async id => {
    const emp = await employeeApi.getPreview(id);
    return { label: getFullName(emp.firstName, emp.lastName), value: emp.id };
  }}
  placeholder={t('employee.fields.managerId')}
  searchPlaceholder={t('common.control.search')}
  clearable
/>;
```

`clearValue` mặc định là `''`. `defaultOptions` mặc định là `true` và `loadOnOpen` mặc định là `true`: lần đầu mở dropdown sẽ gọi `loadOptions('')`. Nếu chỉ muốn load sau khi user gõ, đặt `defaultOptions={false}` và có thể dùng `minSearchLength`. Nếu value hiện tại chưa có label và không dùng được `loadOption`, truyền `valueLabel`; dùng `onLoadError` để bắt lỗi load option.

---

### FieldInputAsyncMultiSelect — multi select load options bất đồng bộ

Dùng cho dropdown remote có thể chọn nhiều dòng. Component lưu `string[]` vào form field, tự giữ label của các value đang chọn bằng `loadOption(value)`, và clear mặc định về `[]`.

```tsx
import React from 'react';
import FieldInputAsyncMultiSelect from '@/shared/components/form/field-input-async-multi-select';
import employeeApi from '@/modules/employee/services/employee.api';
import { getFullName } from '@/shared/utils';

const loadEmployeeOptions = React.useCallback(async (keyword: string) => {
  const response = await employeeApi.listPreviews({
    pageIndex: 0,
    pageSize: 20,
    searchTerm: keyword,
  });
  return response.items.map(emp => ({
    label: getFullName(emp.firstName, emp.lastName),
    value: emp.id,
  }));
}, []);

<FieldInputAsyncMultiSelect
  label={t('employee.fields.approverIds')}
  form={form}
  name="approverIds" // field type: string[]
  loadOptions={loadEmployeeOptions}
  loadOption={async id => {
    const emp = await employeeApi.getPreview(id);
    return { label: getFullName(emp.firstName, emp.lastName), value: emp.id };
  }}
  placeholder={t('employee.fields.approverIds')}
  searchPlaceholder={t('common.control.search')}
  clearable
/>;
```

`clearValue` mặc định là `[]`. `defaultOptions`, `loadOnOpen`, `minSearchLength`, `debounceTime`, `emptyContent`, `maxVisibleValues`, `renderOption`, và `renderValue` hoạt động giống các field select hiện có. Nếu value hiện tại chưa có label và không dùng được `loadOption`, truyền `valueLabels`; dùng `onLoadError` để bắt lỗi load option. Module vẫn phải truyền API/service callback từ ngoài vào, không gọi API trực tiếp trong shared field.

---

### FieldInputEntitySelect — chọn entity object

`FieldInputEntitySelect` dùng khi form field lưu nguyên object entity được chọn. Truyền `options` là mảng entity thật, kèm `getOptionValue` và `getOptionLabel` để component biết khóa và label hiển thị. Nếu form chỉ lưu id string như `managerId`, dùng `FieldInputAsyncSelect` hoặc `FieldInputSelect` thay vì component này.

```tsx
import FieldInputEntitySelect from '@/shared/components/form/field-input-entity-select';

type EmployeePreview = {
  id: string;
  employeeCode: string;
  fullName: string;
};

type FormValues = {
  manager?: EmployeePreview;
};

<FieldInputEntitySelect
  label={t('employee.fields.manager')}
  form={form}
  name="manager" // field type: EmployeePreview | undefined
  options={employeeOptions}
  getOptionValue={employee => employee.id}
  getOptionLabel={employee => `${employee.employeeCode} - ${employee.fullName}`}
  renderOption={employee => (
    <span>
      {employee.employeeCode} - {employee.fullName}
    </span>
  )}
  searchable
  clearable
/>;
```

`clearValue` mặc định là `undefined`. Component hỗ trợ `searchable`, `searchManual`, `onSearchChange`, `debounceTime`, `emptyContent`, `renderOption`, `renderValue`, và `isOptionDisabled` giống `FieldInputSelect`, nhưng value commit vào form là entity object.

---

### FieldInputEntityMultiSelect — chọn nhiều entity object

`FieldInputEntityMultiSelect` dùng khi form field lưu mảng object entity được chọn. Truyền `options` là mảng entity thật, kèm `getOptionValue` và `getOptionLabel`. Nếu form chỉ lưu `string[]` id như `approverIds` hoặc `assigneeIds`, dùng `FieldInputAsyncMultiSelect` hoặc `FieldInputMultiSelect` thay vì component này.

```tsx
import FieldInputEntityMultiSelect from '@/shared/components/form/field-input-entity-multi-select';

type EmployeePreview = {
  id: string;
  employeeCode: string;
  fullName: string;
};

type FormValues = {
  approvers: EmployeePreview[];
};

<FieldInputEntityMultiSelect
  label={t('employee.fields.approvers')}
  form={form}
  name="approvers" // field type: EmployeePreview[]
  options={employeeOptions}
  getOptionValue={employee => employee.id}
  getOptionLabel={employee => `${employee.employeeCode} - ${employee.fullName}`}
  renderOption={employee => (
    <span>
      {employee.employeeCode} - {employee.fullName}
    </span>
  )}
  searchable
  clearable
/>;
```

`clearValue` mặc định là `[]`. Component hỗ trợ `searchable`, `searchManual`, `onSearchChange`, `debounceTime`, `emptyContent`, `maxVisibleValues`, `renderOption`, `renderValue`, và `isOptionDisabled` giống `FieldInputMultiSelect`, nhưng value commit vào form là mảng entity object.

---

### FieldInputEntityAsyncSelect — chọn entity object từ remote search

`FieldInputEntityAsyncSelect` dùng khi options cần load bất đồng bộ theo keyword và form field lưu nguyên object entity được chọn. `loadOptions(keyword)` và `loadOption(value)` phải trả về entity object, không phải `{ label, value }`.

```tsx
import React from 'react';
import FieldInputEntityAsyncSelect from '@/shared/components/form/field-input-entity-async-select';

type EmployeePreview = {
  id: string;
  employeeCode: string;
  fullName: string;
};

type FormValues = {
  manager?: EmployeePreview;
};

const loadEmployeeOptions = React.useCallback(async (keyword: string) => {
  const response = await employeeApi.listPreviews({
    pageIndex: 0,
    pageSize: 20,
    searchTerm: keyword,
  });
  return response.items;
}, []);

<FieldInputEntityAsyncSelect
  label={t('employee.fields.manager')}
  form={form}
  name="manager" // field type: EmployeePreview | undefined
  loadOptions={loadEmployeeOptions}
  loadOption={id => employeeApi.getPreview(id)}
  getOptionValue={employee => employee.id}
  getOptionLabel={employee => `${employee.employeeCode} - ${employee.fullName}`}
  searchPlaceholder={t('common.control.search')}
  clearable
/>;
```

`clearValue` mặc định là `undefined`. `defaultOptions`, `loadOnOpen`, `minSearchLength`, `debounceTime`, `emptyContent`, `renderOption`, `renderValue`, và `isOptionDisabled` hoạt động giống các field select async khác.

---

### FieldInputEntityAsyncMultiSelect — chọn nhiều entity object từ remote search

`FieldInputEntityAsyncMultiSelect` dùng khi options cần load bất đồng bộ theo keyword và form field lưu mảng entity object được chọn.

```tsx
import React from 'react';
import FieldInputEntityAsyncMultiSelect from '@/shared/components/form/field-input-entity-async-multi-select';

type EmployeePreview = {
  id: string;
  employeeCode: string;
  fullName: string;
};

type FormValues = {
  approvers: EmployeePreview[];
};

const loadEmployeeOptions = React.useCallback(async (keyword: string) => {
  const response = await employeeApi.listPreviews({
    pageIndex: 0,
    pageSize: 20,
    searchTerm: keyword,
  });
  return response.items;
}, []);

<FieldInputEntityAsyncMultiSelect
  label={t('employee.fields.approvers')}
  form={form}
  name="approvers" // field type: EmployeePreview[]
  loadOptions={loadEmployeeOptions}
  loadOption={id => employeeApi.getPreview(id)}
  getOptionValue={employee => employee.id}
  getOptionLabel={employee => `${employee.employeeCode} - ${employee.fullName}`}
  searchPlaceholder={t('common.control.search')}
  clearable
/>;
```

`clearValue` mặc định là `[]`. `defaultOptions`, `loadOnOpen`, `minSearchLength`, `debounceTime`, `emptyContent`, `maxVisibleValues`, `renderOption`, `renderValue`, và `isOptionDisabled` hoạt động giống các field select async khác.

---

### FieldInputConstant — select từ CONST\_\* array (tự translate label)

Dùng với các `CONST_*` arrays — tự động handle `TranslationsKey` label.

```tsx
import FieldInputConstant from '@/shared/components/form/field-input-constant';
import { CONST_GENDER } from '../../constants/employee';

<FieldInputConstant
  label={t('employee.fields.gender')}
  form={form}
  name="gender"
  constOptions={CONST_GENDER}
/>;
```

Wrapper của `FieldInputSelect`, nên value lưu là primitive `value` và `clearValue` mặc định là `''`.

---

### FieldInputTreeSelect — select dạng cây (hierarchical, options static)

```tsx
import FieldInputTreeSelect from '@/shared/components/form/field-input-tree-select';

<FieldInputTreeSelect
  label={t('employee.fields.organizationUnit')}
  form={form}
  name="jobInfo.organizationUnitCode"
  options={[
    {
      label: 'Ban Giám đốc',
      value: 'BOD',
      children: [
        { label: 'Phòng Nhân sự', value: 'HR' },
        { label: 'Phòng Vận hành', value: 'OPS' },
      ],
    },
  ]}
/>;
```

Value lưu là `string`. `clearValue` mặc định là `''`. Props thường dùng: `searchable`, `searchPlaceholder`, `expandAll`, `placeholder`.

---

### FieldInputTreeEntitySelect — select dạng cây từ entity object

Khác `FieldInputTreeSelect` (dùng `{ label, value }[]`): component này nhận mảng entity object thật, dùng `getOptionValue`/`getOptionLabel`/`getOptionChildren` để build tree, và **lưu nguyên entity object được chọn vào form field**. Phù hợp khi form cần giữ full object để tham chiếu (VD: org unit object để load job positions phụ thuộc).

```tsx
import FieldInputTreeEntitySelect from '@/shared/components/form/field-input-tree-entity-select';

type OrgUnit = {
  id: string;
  name: string;
  children?: OrgUnit[];
};

type FormValues = {
  organizationUnit?: OrgUnit;
};

<FieldInputTreeEntitySelect
  label={t('employee.fields.organizationUnit')}
  form={form}
  name="jobInfo.organizationUnit" // field type: OrgUnit | undefined
  options={orgUnits} // OrgUnit[] (root nodes, children nested bên trong)
  getOptionValue={ou => ou.id}
  getOptionLabel={ou => ou.name}
  getOptionChildren={ou => ou.children}
  searchable
  clearable
  onValueChange={() => form.setValue('jobInfo.jobPosition', undefined)}
/>;
```

`clearValue` mặc định `undefined`. Props thường dùng: `searchable`, `searchPlaceholder`, `expandAll`, `placeholder`.

---

### FieldInputSwitch — toggle boolean

```tsx
import FieldInputSwitch from '@/shared/components/form/field-input-switch';

<FieldInputSwitch
  label={t('employee.fields.isActive')}
  form={form}
  name="isActive"
/>;
```

Value lưu là boolean. `clearValue` mặc định là `false`; truyền `switchProps` nếu cần cấu hình thêm native switch.

---

### FieldInputAddress — địa chỉ Việt Nam (tỉnh/huyện/xã)

```tsx
import FieldInputAddress from '@/shared/components/form/field-input-address';

// Field type: { provinceCode: string; districtCode: string; wardCode: string }
<FieldInputAddress
  label={t('employee.fields.contact.permanentAddress')}
  form={form}
  name="contact.permanentAddress"
/>;
```

Value là object địa chỉ nhẹ; `clearValue` mặc định là `undefined`. Có thể truyền `inputProps` của `AddressPicker`, còn `placeholder` nên truyền trực tiếp ở FieldInput.

---

### FieldInputCountry — select quốc gia (có search)

Wrapper của `FieldInputSelect` với danh sách quốc gia có sẵn từ `countries.json`. Tự động có `searchable`.

```tsx
import FieldInputCountry from '@/shared/components/form/field-input-country';

<FieldInputCountry
  label={t('employee.fields.nationality')}
  form={form}
  name="nationality" // field type: string
/>;
```

Wrapper của `FieldInputSelect`, tự truyền danh sách `countries` và `searchable`. `clearValue` mặc định là `''`.

---

### FieldInputGeneratedText — text với nút auto-generate

```tsx
import FieldInputGeneratedText from '@/shared/components/form/field-input-generated-text';

<FieldInputGeneratedText
  label={t('employee.fields.employeeCode')}
  form={form}
  name="employeeCode"
  getGeneratedText={() =>
    generateEmployeeCode.refetch().then(r => r.data?.employeeCode)
  }
  autoGenerateIfEmpty
/>;
```

`clearValue` mặc định là `''`. Props thường dùng: `getGeneratedText`, `autoGenerateIfEmpty`, `disableInput`, `inputProps`. Nút Generate là nút riêng của RenderComponent và đứng trước Clear/Reset/Edit/Save theo control lane.

---

### FieldInputAvatar — upload một ảnh đại diện

Dùng cho ảnh đại diện user, nhân viên, tài xế, khách hàng. Value nên là metadata nhẹ giống file upload single: `{ id?, name, size?, type?, url?, file? } | undefined`. Ảnh có sẵn dùng `url` để preview; ảnh mới chọn sẽ có `file: File` để module upload khi submit hoặc upload trước submit rồi thay bằng id/url từ API.

```tsx
import FieldInputAvatar, {
  FieldInputAvatarValue,
} from '@/shared/components/form/field-input-avatar';

type EmployeeFormValues = {
  avatar?: FieldInputAvatarValue;
};

<FieldInputAvatar
  label={t('employee.fields.avatar')}
  form={form}
  name="avatar" // field type: FieldInputAvatarValue | undefined
  fallback={form.watch('firstName')?.[0]}
  maxSize={2 * 1024 * 1024}
  clearable
/>;
```

`clearValue` mặc định là `undefined`. Props thường dùng:

- `accept`: loại file ảnh được chọn, mặc định `image/*`.
- `maxSize`: bỏ qua ảnh vượt quá dung lượng.
- `fallback`: nội dung fallback khi chưa có ảnh.
- `previewAlt`: alt text cho ảnh preview.
- `browseText`: text cho nút/chỗ chọn ảnh.
- `size`: kích thước avatar `'sm' | 'default' | 'lg'`, mặc định `lg`.

RenderComponent có nút camera riêng nên nút này luôn đứng trước Clear/Reset/Edit/Save theo control lane của `FieldInputBase`.

---

### FieldInputFileUpload — upload một hoặc nhiều file

Dùng cho field đính kèm như CCCD scan, bằng cấp, hợp đồng, biên bản. Value nên là metadata nhẹ; file mới chọn sẽ có thêm `file: File` để module upload khi submit hoặc upload trước submit rồi thay bằng id/url từ API.

```tsx
import FieldInputFileUpload, {
  FieldInputFileUploadValue,
} from '@/shared/components/form/field-input-file-upload';

type EmployeeFormValues = {
  idScan?: FieldInputFileUploadValue;
  documents: FieldInputFileUploadValue[];
};

<FieldInputFileUpload
  label={t('employee.fields.idScan')}
  form={form}
  name="idScan" // field type: FieldInputFileUploadValue | undefined
  accept=".pdf,.jpg,.jpeg,.png"
  maxSize={5 * 1024 * 1024}
  clearable
/>;

<FieldInputFileUpload
  label={t('employee.fields.documents')}
  form={form}
  name="documents" // field type: FieldInputFileUploadValue[]
  multiple
  maxFiles={5}
  accept=".pdf,.jpg,.jpeg,.png"
  clearable
/>;
```

`clearValue` mặc định là `undefined` ở single mode và `[]` khi `multiple`. Props thường dùng: `accept`, `browseText`, `emptyText`, `formatFileSize`, `maxFiles`, `maxSize`, `maxVisibleFiles`, `multiple`, `placeholder`. RenderComponent có nút upload riêng nên nút upload luôn đứng trước Clear/Reset/Edit/Save theo control lane của `FieldInputBase`.

---

### FieldInputEntityTable — bảng entity có thể chỉnh sửa

Dùng khi form field lưu danh sách row entity dạng `TRow[]`, ví dụ thành viên team, người duyệt, dịch vụ đính kèm.

**Cơ chế:**

- **Thêm:** Component tích hợp sẵn search dropdown bên dưới bảng. User tìm kiếm entity, chọn → full `TRow` object được append vào value. Entity đã thêm sẽ bị lọc khỏi dropdown (không thể thêm trùng).
- **Xóa:** Mỗi row có nút Trash2 tự động (chỉ hiển thị ở EDIT mode).
- **Clear:** Nút `×` xóa toàn bộ rows, clear về `[]`.

```tsx
import FieldInputEntityTable from '@/shared/components/form/field-input-entity-table';

type ApproverRow = { id: string; fullName: string; jobPosition: string };

type EmployeeApproverFormValues = {
  approvers: ApproverRow[];
};

const loadEmployeeOptions = React.useCallback(async (keyword: string) => {
  const res = await employeeApi.listPreviews({
    searchTerm: keyword,
    pageSize: 20,
  });
  return res.items.map(e => ({
    id: e.id,
    fullName: getFullName(e.firstName, e.lastName),
    jobPosition: e.jobInfo?.jobPosition.name ?? '',
  }));
}, []);

<FieldInputEntityTable<
  ApproverRow,
  EmployeeApproverFormValues,
  unknown,
  EmployeeApproverFormValues,
  'approvers',
  ApproverRow[]
>
  label={t('employee.fields.approvers')}
  form={form}
  name="approvers"
  columns={[
    {
      key: 'fullName',
      header: t('employee.fields.fullName'),
      render: row => row.fullName,
    },
    {
      key: 'jobPosition',
      header: t('employee.fields.jobPosition'),
      render: row => row.jobPosition,
    },
  ]}
  loadOptions={loadEmployeeOptions}
  getRowValue={row => row.id}
  getRowLabel={row => row.fullName}
  searchPlaceholder={t('common.control.search')}
  clearable
/>;
```

`clearValue` mặc định là `[]`. Props thường dùng:

- `columns`: định nghĩa cột cho `DataTablePlain`, không cần thêm cột xóa.
- `loadOptions(keyword)`: load danh sách entity có thể chọn. Trả về `TRow[]` — object được lưu thẳng vào form value.
- `getRowValue(row)`: lấy unique id từ row, dùng để chặn trùng và làm row key.
- `getRowLabel(row)`: label hiển thị trong search dropdown.
- `defaultOptions`: pre-populate dropdown (`true` = auto-load lần đầu mở, array = options cố định).
- `loadOnOpen`: load khi dropdown mở lần đầu (mặc định `true`).
- `minSearchLength`: số ký tự tối thiểu trước khi gọi `loadOptions` (mặc định `0`).
- `debounceTime`: debounce (ms) sau khi user gõ.
- `searchPlaceholder`: placeholder trong search input của dropdown.
- `emptyState`: nội dung khi chưa có row trong bảng.
- `isFetching`: hiện skeleton khi load data ban đầu.
- `footer`: ReactNode truyền vào `<TableFooter>` (thường là row tổng).
- `onRemoveRow`: callback sau khi một row bị xóa.

Ở mode VIEW hoặc khi `disabled`, cột xóa và search dropdown không hiển thị. Inline edit (`inlineEdit`) hoạt động đúng — thêm/xóa row trong quá trình edit được lưu vào draft, chỉ commit vào form sau khi bấm Save.

---

### FieldInputArrayTable — bảng con có thể chỉnh sửa qua dialog

Dùng khi form field lưu danh sách row object `TRow[]` mà mỗi row cần form riêng để tạo/sửa. Khác với `FieldInputEntityTable` (thêm bằng search dropdown), `FieldInputArrayTable` mở dialog CRUD cho từng row — phù hợp khi row có nhiều trường nhập liệu và cần validate riêng.

**Cơ chế:**

- **Thêm:** Nút Add mở dialog ở mode CREATE. Row form được reset về `createDefaultRow()`.
- **Sửa:** Nút Pencil trên mỗi row mở dialog ở mode UPDATE. Row form được reset về dữ liệu row hiện tại.
- **Xóa:** Nút Trash2 mở dialog ở mode DELETE để xác nhận. Không validate form, chỉ cần bấm xác nhận.
- **Clear:** `clearValue` mặc định là `[]`.

```tsx
import FieldInputArrayTable from '@/shared/components/form/field-input-array-table';
import FieldInputText from '@/shared/components/form/field-input-text';

type QualificationRow = { name: string; issuedBy: string; issuedDate: string };

type EmployeeFormValues = {
  qualifications: QualificationRow[];
};

<FieldInputArrayTable<
  QualificationRow,
  EmployeeFormValues,
  unknown,
  EmployeeFormValues,
  'qualifications',
  QualificationRow[]
>
  label={t('employee.fields.qualifications')}
  form={form}
  name="qualifications"
  columns={[
    {
      key: 'name',
      header: t('qualification.col.name'),
      render: row => row.name,
    },
    {
      key: 'issuedBy',
      header: t('qualification.col.issuedBy'),
      render: row => row.issuedBy,
    },
  ]}
  createDefaultRow={() => ({ name: '', issuedBy: '', issuedDate: '' })}
  renderEditor={({ form: rowForm, mode }) => (
    <div className="flex flex-col gap-4">
      <FieldInputText
        label={t('qualification.col.name')}
        form={rowForm}
        name="name"
        mode={mode}
      />
      <FieldInputText
        label={t('qualification.col.issuedBy')}
        form={rowForm}
        name="issuedBy"
        mode={mode}
      />
    </div>
  )}
/>;
```

Props thường dùng:

- `columns`: định nghĩa cột `DataTablePlain`. Cột action (edit/delete) tự thêm ở EDIT mode.
- `createDefaultRow()`: trả về row trống khi mở dialog CREATE.
- `renderEditor({ form, mode, disabled })`: render nội dung dialog. Dùng `FieldInput*` với `form` được cung cấp.
- `rowFormOptions`: `UseFormProps<TRow>` cho row form (thường là `resolver` validate).
- `getRowKey(row, index)`: key ổn định cho mỗi row, mặc định dùng index.
- `getDialogTitle(mode, row)`: tiêu đề dialog tùy chỉnh theo mode.
- `getDeleteDescription(row)`: mô tả xác nhận xóa.
- `addLabel`: label cho nút Add.
- `validateRow(row, mode, index)`: async hook validate trước khi commit row vào mảng. Trả `false` để hủy commit.
- `onAddRow`, `onUpdateRow`, `onRemoveRow`: callback sau khi commit.
- `emptyState`: nội dung hiển thị khi bảng rỗng.
- `isFetching`: skeleton khi load data ban đầu.
- `footer`: ReactNode trong `<TableFooter>`.

Ở mode VIEW hoặc khi `disabled`, nút Add và cột action (edit/delete) không hiển thị. Inline edit (`inlineEdit`) hoạt động đúng — thêm/sửa/xóa row trong lúc edit chỉ commit vào form sau khi bấm Save.

---

## Mode VIEW vs EDIT (Details page)

```tsx
// Details page ở UPDATE mode — hiển thị như read-only, có thể inline-edit từng field
<FieldInputText
  label={t('employee.fields.firstName')}
  form={form}
  name="firstName"
  mode="EDIT" // Bắt buộc để inlineEdit hoạt động
  inlineEdit={true} // Chưa bấm edit thì field read-only, hover hiện nút edit
  onInlineSave={(name, value) => {
    updateMutation.mutate({ id, [name]: value });
  }}
  loading={updateMutation.isPending}
/>
```

Details page có thể dùng một trong ba capability edit:

| Capability          | Field mode                                                    | Cách save                                   |
| ------------------- | ------------------------------------------------------------- | ------------------------------------------- |
| `INLINE_ONLY`       | `mode="EDIT"` + `inlineEdit` khi user có quyền update         | `onInlineSave` từng field hoặc từng group   |
| `GLOBAL_ONLY`       | `mode="EDIT"` sau khi vào global edit, không bật `inlineEdit` | `<form onSubmit>` save toàn form            |
| `INLINE_AND_GLOBAL` | Inline: `inlineEdit`; global: tắt `inlineEdit`                | Inline save hoặc global submit tùy sub-mode |

```tsx
const isInlineEnabled =
  canUpdate && supportsInlineEdit && editMode === 'INLINE';
const isGlobalUpdate = mode === 'UPDATE' && editMode === 'GLOBAL';
const fieldMode = isInlineEnabled || isGlobalUpdate ? 'EDIT' : 'VIEW';

<FieldInputText
  label={t('entity.fields.name')}
  form={form}
  name="name"
  mode={fieldMode}
  inlineEdit={isInlineEnabled}
  onInlineSave={isInlineEnabled ? handleUpdate : undefined}
  loading={isInlineEnabled && updateMutation.isPending}
/>;
```

Details page mặc định luôn mở `READ`. Inline edit là một capability riêng của field/group: nếu page hỗ trợ inline edit và user có quyền update, field có thể nhận `mode="EDIT" inlineEdit` ngay trong details view để nút edit từng field/group có sẵn, không cần header **Sửa** chỉ để mở khóa inline edit.

Với page `INLINE_ONLY`, không hiển thị header **Sửa** để chuyển toàn trang sang edit. User có quyền update thì các field/group inline edit đã có sẵn; từng field/group tự quản lý Edit/Save/Cancel qua `inlineEdit` hoặc `FieldGroupInlineEdit`.

Khi page hỗ trợ cả inline và global edit, inline edit có thể có sẵn theo mặc định. Header vẫn hiển thị một nút **Sửa** để vào global edit; không cần nút "Sửa từng trường" vì inline edit đã là khả năng sẵn có của từng field/group.

Khi page chỉ hỗ trợ global edit, nút **Sửa** chuyển `READ` sang `UPDATE`; lúc này field nhận `mode="EDIT"` và không bật `inlineEdit`; Save/Cancel trên header xử lý toàn form.

## FieldGroupInlineEdit — group nhiều field cùng commit

Khi muốn nhiều field cùng được edit/save trong một group (vd địa chỉ thường trú gồm tỉnh/huyện/xã), dùng `FieldGroupInlineEdit` thay vì `inlineEdit` riêng từng field. Group hiển thị nút Edit chung, mở edit cho toàn bộ field con, commit/cancel cùng lúc.

```tsx
import FieldGroupInlineEdit from '@/shared/components/form/field-group-inline-edit';
import FieldInputText from '@/shared/components/form/field-input-text';
import FieldInputDate from '@/shared/components/form/field-input-date';

<FieldGroupInlineEdit
  form={form}
  names={['idNumber', 'idDateOfIssue', 'idPlaceOfIssue']} // các field thuộc group
  title={t('employee.sections.basic.id')} // optional — render SubSection bọc ngoài
  mode={fieldMode} // 'VIEW' | 'EDIT'
  inlineEdit={isInlineEnabled} // true → khóa VIEW cho đến khi bấm Edit
  loading={updateMutation.isPending}
  clearable // hiện nút × xóa toàn bộ fields về undefined
  onSave={getValue => {
    // getValue(name) trả về giá trị hiện tại của field trong form
    updateMutation.mutate({
      id,
      idNumber: getValue('idNumber'),
      idDateOfIssue: getValue('idDateOfIssue'),
      idPlaceOfIssue: getValue('idPlaceOfIssue'),
    });
  }}
  onClear={() => {
    // gọi API clear khi bấm × (các field đã được set về undefined trước đó)
    updateMutation.mutate({
      id,
      idNumber: null,
      idDateOfIssue: null,
      idPlaceOfIssue: null,
    });
  }}
>
  {({ fieldMode }) => (
    // fieldMode: 'VIEW' | 'EDIT' — truyền xuống từng FieldInput
    <div className="grid grid-cols-3 gap-4">
      <FieldInputText
        label={t('employee.fields.idNumber')}
        form={form}
        name="idNumber"
        mode={fieldMode}
      />
      <FieldInputDate
        label={t('employee.fields.idDateOfIssue')}
        form={form}
        name="idDateOfIssue"
        mode={fieldMode}
      />
      <FieldInputText
        label={t('employee.fields.idPlaceOfIssue')}
        form={form}
        name="idPlaceOfIssue"
        mode={fieldMode}
      />
    </div>
  )}
</FieldGroupInlineEdit>;
```

### Props FieldGroupInlineEdit

| Prop               | Type                                  | Mô tả                                                                    |
| ------------------ | ------------------------------------- | ------------------------------------------------------------------------ |
| `form`             | `UseFormReturn`                       | Form instance                                                            |
| `names`            | `FieldPath[]`                         | Danh sách field thuộc group — snapshot khi Edit, restore khi Cancel      |
| `title`            | `React.ReactNode`                     | Nếu set, component tự bọc nội dung trong `SubSection` với tiêu đề này    |
| `description`      | `React.ReactNode`                     | Mô tả ngắn trong SubSection header                                       |
| `mode`             | `'VIEW' \| 'EDIT'`                    | Mode ngoài truyền vào — mặc định `'EDIT'`                                |
| `inlineEdit`       | `boolean`                             | Khi `true` (và `mode='EDIT'`), khóa VIEW cho đến khi user bấm nút Pencil |
| `loading`          | `boolean`                             | Disable nút trong khi đang save                                          |
| `clearable`        | `boolean`                             | Hiện nút × để set toàn bộ fields về `undefined`                          |
| `resetable`        | `boolean`                             | Hiện nút ↺ để reset toàn bộ fields về `defaultValues`                    |
| `onSave`           | `(getValue) => void \| Promise<void>` | `getValue(name)` trả về giá trị field tại thời điểm save                 |
| `onClear`          | `() => void \| Promise<void>`         | Gọi sau khi fields đã được set về `undefined`                            |
| `onReset`          | `() => void \| Promise<void>`         | Gọi sau khi fields đã được reset về `defaultValues`                      |
| `children`         | `(props: { fieldMode }) => ReactNode` | Render prop — `fieldMode` là `'VIEW'` hoặc `'EDIT'`                      |
| `className`        | `string`                              | Tailwind override cho wrapper                                            |
| `contentClassName` | `string`                              | Tailwind override cho vùng content                                       |

> **Lưu ý quan trọng:** `onSave` nhận **hàm `getValue(name)`** chứ không phải object values. Dùng `getValue('fieldName')` để đọc từng field khi cần — lý do: đảm bảo đọc đúng giá trị đã validate tại thời điểm save, tránh closure cũ.

Khi `fieldMode === 'EDIT'`, mỗi field con tự hiển thị input. Khi `fieldMode === 'VIEW'`, hiển thị value đã format. Group quản lý draft chung — chỉ commit khi user bấm Save trên header của group.

## CRUD Component Pattern (thực tế từ employee-crud)

```tsx
// src/modules/employee/components/employee-crud/index.tsx
'use client';

import React from 'react';
import { unflatten } from 'flat';
import {
  FieldPath,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import routePaths from '../../route-paths';
import {
  useEmployeeCreate,
  useEmployeeDelete,
  useEmployeeUpdate,
} from '../../services/employee.mutation';
import { useEmployeeDetails } from '../../services/employee.queries';
import { Employee } from '../../types/employee';
import ContentForm from './content-form';
import ContentHeader from './content-header';
import {
  EmployeeCRUDContext,
  EmployeeCRUDContextProps,
  defaultValue,
} from './context';
import formValidateResolver from './form-validate-resolver';
import transformCreateData from './transform-create-data';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useFormValidateResolver } from '@/core/form';
import { usePageContentContext } from '@/core/layout/page-content-context';
import { notify } from '@/core/notification';
import { useAppRouter } from '@/core/router/next';
import { CRUDMode } from '@/shared/types/crud';

interface EmployeeCRUDProps {
  defaultMode: CRUDMode; // 'CREATE' | 'READ' | 'UPDATE'
  id?: string;
}

export default function EmployeeCRUD({ defaultMode, id }: EmployeeCRUDProps) {
  const router = useAppRouter();
  const [mode, setMode] = React.useState<CRUDMode>(defaultMode);
  const canUpdate = useHasPermissions('HRM_EM.EMPLOYEE.EMPLOYEE.UPDATE');

  const resolver = useFormValidateResolver(formValidateResolver);
  const form = useForm<Employee>({ resolver, reValidateMode: 'onSubmit' });

  // CREATE
  const create = useEmployeeCreate({
    meta: {
      showLoading: 'SPINNER',
      notifySuccess: 'common.notify.create_success',
    },
  });

  // READ
  const read = useEmployeeDetails(id!, { enabled: !!id });

  // UPDATE (inline-edit field-level)
  const update = useEmployeeUpdate({
    meta: { notifySuccess: 'common.notify.update_success' },
  });
  const [editingFieldName, setEditingFieldName] = React.useState<
    FieldPath<Employee> | undefined
  >(undefined);

  // DELETE
  const remove = useEmployeeDelete({
    meta: { notifySuccess: 'common.notify.delete_success' },
    onSuccess() {
      router.push(routePaths.employees);
    },
  });

  // Field-level update — flat path → nested object qua `unflatten` từ thư viện `flat`
  const handleUpdate: EmployeeCRUDContextProps['update'] = React.useCallback(
    (name, value, payload) => {
      if (!read.data?.id) return;
      setEditingFieldName(name);
      update.mutate(
        payload
          ? { id: read.data.id, ...payload }
          : unflatten({ id: read.data.id, [name]: value }),
        { onSettled: () => setEditingFieldName(undefined) },
      );
    },
    [read.data, update],
  );

  // Form submit: CREATE hoặc global edit nếu module có hỗ trợ
  const onSubmit: SubmitHandler<Employee> = React.useCallback(
    data => {
      if (mode === 'CREATE') {
        create.mutate(transformCreateData(data));
        return;
      }

      // Nếu details page hỗ trợ global edit:
      // if (mode === 'UPDATE' && editMode === 'GLOBAL') {
      //   update.mutate(transformUpdateData(data));
      // }
    },
    [create, mode],
  );
  const onInvalid: SubmitErrorHandler<Employee> = React.useCallback(e => {
    console.error(e);
    notify.error('validation.form_invalid');
  }, []);

  // Reset form mỗi khi data từ server thay đổi
  React.useEffect(() => {
    form.reset(read?.data);
  }, [form, read?.data]);

  // Hiển thị page-level loading khi đang fetch details
  const pageLoading =
    mode !== 'CREATE' && !!id && (read.isPending || !read.data);
  const { setLoading } = usePageContentContext();
  React.useEffect(() => {
    setLoading(pageLoading);
    return () => setLoading(false);
  }, [pageLoading, setLoading]);

  const inlineEdit = mode !== 'CREATE' && !!read.data?.id && canUpdate;

  return (
    <EmployeeCRUDContext.Provider
      value={{
        ...defaultValue,
        mode,
        setMode,
        inlineEdit,
        form,
        data: read.data,
        createLoading: create.isPending,
        readLoading: read.isFetching,
        updateLoading: update.isPending,
        deleteLoading: remove.isPending,
        update: handleUpdate,
        editingFieldName,
        remove: () => read.data?.id && remove.mutate(read.data.id),
      }}
    >
      {!pageLoading && (
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
          <ContentHeader />
          <ContentForm />
        </form>
      )}
    </EmployeeCRUDContext.Provider>
  );
}
```

> **Điểm chính:** dùng React Context (`EmployeeCRUDContext`) để chia sẻ `form`, `mode`, `inlineEdit`, `data`, `update`, `remove` xuống các sub-section thay vì prop drilling. Mỗi section dùng `useEmployeeCRUDContext()`.
>
> **Inline-edit với flat path:** field name dạng `contact.permanentAddress.provinceCode` được biến thành nested object qua `unflatten` (từ thư viện `flat`) trước khi gọi `update.mutate({ id, ...nested })`.

## Zod Validation Examples

### Pattern 1: Dùng validation rules helpers (bắt buộc ưu tiên)

Khi viết validation cho form, **bắt buộc ưu tiên dùng helpers có sẵn** từ
[`@/modules/foundation/validation/rules`](src/modules/foundation/validation/rules.ts)
cho các rule phổ biến — tránh viết lặp lại `z.string().min(1, t('validation.required'))`,
`z.date(t('validation.required'))`, `z.number().min(...)`, v.v.

Nếu gặp một rule phổ biến nhưng chưa có helper, **không viết lặp trong từng module**. Hãy tạo helper mới trong
`@/modules/foundation/validation/rules`, đặt tên rõ nghĩa, dùng chung i18n key phù hợp, cập nhật
[12-utils-reference.md#validation-rules-helpers](./12-utils-reference.md#validation-rules-helpers),
rồi import helper đó vào form resolver.

```ts
import { createFormValidateResolverWithTranslations } from '@/core/form';
import {
  stringRequired,
  numberRequired,
  dateRequired,
  emailFormat,
} from '@/modules/foundation/validation/rules';
import { Employee } from '../../types/employee';

export const formValidateResolver =
  createFormValidateResolverWithTranslations<Employee>(t => ({
    employeeCode: stringRequired(t),
    firstName: stringRequired(t),
    lastName: stringRequired(t),
    gender: stringRequired(t),
    dateOfBirth: dateRequired(t),
    graduationYear: numberRequired(t).optional(),
  }));
```

Danh sách helpers đầy đủ: xem [docs/tech/frontend/web-app/12-utils-reference.md#validation-rules-helpers](./12-utils-reference.md#validation-rules-helpers).

### Pattern 2: Zod trực tiếp (khi cần rule custom)

Chỉ viết Zod trực tiếp trong resolver khi rule thật sự đặc thù cho field/module đó, ví dụ regex riêng,
`.refine()`, `.superRefine()`, rule phụ thuộc nhiều field, hoặc logic nghiệp vụ không nên gom thành helper dùng chung.
Nếu cùng một custom rule xuất hiện từ lần thứ hai, cân nhắc đưa vào `@/modules/foundation/validation/rules`.

```ts
import z from 'zod';
import { createFormValidateResolverWithTranslations } from '@/core/form';

export const formValidateResolver =
  createFormValidateResolverWithTranslations<EmployeeFormValues>(t => ({
    firstName: z
      .string()
      .min(1, t('validation.required'))
      .max(50, t('validation.maxLength', { max: 50 })),
    graduationYear: z
      .number()
      .min(1900, t('validation.min', { min: 1900 }))
      .optional(),
    // Regex pattern
    employeeCode: z
      .string()
      .regex(/^EMP-\d{3}$/, t('validation.invalid_format')),
  }));
```

## Default Values Pattern

`useForm` default values phải khớp với form values type. Lưu ý:

### Date — luôn để `undefined`, không phải `null`

```ts
const form = useForm<Employee>({
  resolver,
  defaultValues: {
    dateOfBirth: undefined, // ✅ Date picker hiểu undefined
    // dateOfBirth: null,     // ❌ Date type không nhận null
  },
});
```

### Nested object — khởi tạo struct rỗng

```ts
const form = useForm<Employee>({
  resolver,
  defaultValues: {
    contact: {
      personalPhoneNumber: '',
      permanentAddress: {
        provinceCode: '',
        districtCode: '',
        wardCode: '',
      },
    },
  },
});
```

### Reset sau khi fetch (Details page)

CRUD components dùng pattern này — fetch xong gọi `form.reset(data)`:

```tsx
const read = useEmployeeDetails(id!, { enabled: !!id });

React.useEffect(() => {
  form.reset(read?.data); // Reset toàn bộ form với data từ server
}, [form, read?.data]);
```

`form.reset(data)` đặt cả `defaultValues` lẫn `values` → `form.formState.isDirty` sẽ chính xác.

### Không set defaultValues — dùng khi data tải từ server

Khi form data hoàn toàn từ server và mode khởi tạo là `READ`/`UPDATE`, có thể bỏ `defaultValues` và để form trống tới khi `form.reset(data)`:

```tsx
const form = useForm<Employee>({
  resolver,
  reValidateMode: 'onSubmit',
  // defaultValues bỏ — fetch xong reset (pattern thực tế trong employee-crud)
});
```

## Transform Submit Data

### Clear intent khi update

Với update form, phải phân biệt rõ 2 ý nghĩa:

- Không truyền field: giữ nguyên giá trị hiện có trên server.
- Truyền `null`: user chủ động clear field optional.

Khi field optional có `clearable` và API hỗ trợ clear bằng `null`, `transform-update-data.ts` phải map giá trị clear (`''`, `undefined`, hoặc `null`) thành `null` thay vì xóa key. `FieldInputBase` đã preserve nullable shape khi field từng có value `null`, nhưng transform update vẫn phải explicit theo API contract vì create/update thường có rule omit khác nhau. Rule này đặc biệt quan trọng với relation/select, date, number và các FieldInput clear về `undefined`; `JSON.stringify` sẽ omit field `undefined`, khiến backend thường hiểu là "không đổi".

Create form vẫn có thể omit optional field khi để trống, vì create không có giá trị cũ trên server cần clear.

Với global update submit, nếu payload gửi nguyên form data và chỉ cần chuyển một số field nullable từ `undefined` sang `null`, dùng helper `withNullForUndefined` từ `@/shared/utils` thay vì viết lặp `field: data.field ?? null` cho từng form. Helper này giữ nguyên các field khác, chỉ set `null` cho các key được liệt kê khi giá trị hiện tại là `undefined`.

```tsx
import { withNullForUndefined } from '@/shared/utils';

update.mutate(
  withNullForUndefined(
    { ...data, id: read.data.id },
    [
      'organizationUnitId',
      'effectiveTo',
      'note',
      'optionalLimit',
    ] as const,
  ),
);
```

Chỉ liệt kê các field mà API contract cho phép clear bằng `null`. Không dùng helper này cho field required, field boolean có default `false`, hoặc field array mà empty shape đúng là `[]`.

Khi data form khác với shape API request (vd phải bỏ field tạm, format date), tách logic vào `transform-create-data.ts`:

```ts
// src/modules/employee/components/employee-crud/transform-create-data.ts
import type { Employee } from '../../types/employee';
import type { CreateEmployeeRequest } from '../../services/employee.api-types';

export default function transformCreateData(
  data: Employee,
): CreateEmployeeRequest {
  // Bỏ id, fullName (derived), flatten address nếu API yêu cầu
  const { id, fullName, contact, ...rest } = data;
  return {
    ...rest,
    contact: contact && {
      ...contact,
      permanentProvinceCode: contact.permanentAddress?.provinceCode,
      permanentDistrictCode: contact.permanentAddress?.districtCode,
      permanentWardCode: contact.permanentAddress?.wardCode,
    },
  } as CreateEmployeeRequest;
}
```
