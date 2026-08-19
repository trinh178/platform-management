# 04 — API Services

## HttpRequest Instances có sẵn

```ts
// IAM service (authentication, users, permissions)
import iamHttpRequest from '@/core/network/iam-http-request';

// HRM Employee Management service (employee, organization-unit, ...)
import hrmemHttpRequest from '@/core/network/hrmem-http-request';

// Asset service (asset, ...)
import astHttpRequest from '@/core/network/ast-http-request';
```

**KHÔNG dùng `fetch` trực tiếp** — ESLint rule `no-restricted-globals` sẽ báo lỗi.

## Service Registry — config base URL tập trung

Base URL của mọi service được resolve qua `src/core/network/service-registry.ts`, **không** tự build trong từng `*-http-request.ts`. Registry là nơi duy nhất khai báo prefix gateway và (tùy chọn) `directUrl` để bypass gateway khi dev local.

```ts
// src/core/network/service-registry.ts
const SERVICE_REGISTRY = {
  ast: {
    prefix: process.env.NEXT_PUBLIC_APIGATEWAY_AST!,
    directUrl: process.env.AST_DIRECT_URL,
  },
  iam: {
    prefix: process.env.NEXT_PUBLIC_APIGATEWAY_IAM!,
    directUrl: process.env.IAM_DIRECT_URL,
  },
  hrmem: {
    prefix: process.env.NEXT_PUBLIC_APIGATEWAY_HRM_EM!,
    directUrl: process.env.HRMEM_DIRECT_URL,
  },
} as const satisfies Record<string, ServiceEntry>;
```

- `resolveServiceBaseUrl(key)` — dùng trong `*-http-request.ts`. Server-side: nếu có `directUrl` → trỏ thẳng; ngược lại `joinURL(APIGATEWAY_BASE_URL, prefix)`. Client-side: luôn `joinURL(NEXT_PUBLIC_APIPROXY_BASE_URL, prefix)` (qua proxy).
- `resolveProxyBackendUrl(pathSegments, search)` — dùng trong proxy route. Nếu segment đầu khớp service có `directUrl` → forward thẳng (bỏ prefix); ngược lại forward tới gateway.

### Bypass gateway khi dev (directUrl)

Set env var `<SERVICE>_DIRECT_URL` (server-only, không `NEXT_PUBLIC_`) để trỏ thẳng vào service đang chạy local — áp dụng cho cả SSR (gọi thẳng) lẫn client (proxy forward thẳng, bỏ prefix gateway). Để trống = đi qua gateway như bình thường.

```env
# .env — chỉ dev
HRMEM_DIRECT_URL=http://localhost:8080/
```

## Tạo HttpRequest Instance mới (cho service mới)

Ví dụ thực tế: `hrmem` — service mà module `employee` dùng (xem [API File Pattern](#api-file-pattern-thực-tế-từ-employeeapits)).

**1. Thêm entry vào `service-registry.ts`:**

`hrmem` đã có sẵn entry (xem [Service Registry](#service-registry--config-base-url-tập-trung) ở trên). Khi thêm service hoàn toàn mới, thêm một entry tương tự:

```ts
const SERVICE_REGISTRY = {
  // ...
  hrmem: {
    prefix: process.env.NEXT_PUBLIC_APIGATEWAY_HRM_EM!,
    directUrl: process.env.HRMEM_DIRECT_URL,
  },
} as const satisfies Record<string, ServiceEntry>;
```

**2. Tạo file trong `src/core/network/`:**

```ts
// src/core/network/hrmem-http-request.ts
import { HttpRequest, HttpRequestError } from './http-request';
import { iamAuthenticationHandler } from './iam-authentication-handler';
import { iamUnauthorizedHandler } from './iam-unauthorized-handler';
import { resolveServiceBaseUrl } from './service-registry';

export interface HrmEmServerError {
  code: string;
  message: string;
}

export type HrmEmHttpRequestError = HttpRequestError<HrmEmServerError>;

const hrmemHttpRequest = new HttpRequest<HrmEmServerError>({
  baseUrl: resolveServiceBaseUrl('hrmem'),
  headers: {
    'Content-Type': 'application/json',
  },
  // Inject Authorization từ session khi chạy SSR (client đã có proxy lo)
  requestInterceptor: iamAuthenticationHandler,
  // 401 → sign out + redirect (chỉ chạy client-side)
  responseInterceptor: iamUnauthorizedHandler,
});

export default hrmemHttpRequest;

// Mock (nếu cần)
if (
  process.env.NEXT_PUBLIC_MOCK_API === 'true' &&
  typeof window === 'undefined'
) {
  import('@/mock/hrmem');
}
```

**Lưu ý:**

- Khai báo env var `NEXT_PUBLIC_APIGATEWAY_HRM_EM` (và optional `HRMEM_DIRECT_URL`) trong `.env.example` và `env.d.ts`.
- Không tự build `baseUrl` bằng `joinURL` + `typeof window` nữa — dùng `resolveServiceBaseUrl(key)`.
- Cả `requestInterceptor` và `responseInterceptor` truyền thẳng function reference (signature đã khớp), không bọc arrow.
- Bỏ `transformSuccessResponse` no-op ở cấp instance — transform đặt ở từng API call khi cần (vd `employee.api.ts`).

## Checklist tạo HttpRequest service mới

Khi tích hợp một backend service mới, làm theo thứ tự này:

1. Khai báo env:
   - `.env.example`: thêm `NEXT_PUBLIC_APIGATEWAY_<SERVICE>=<service-path>` (và optional `<SERVICE>_DIRECT_URL` cho dev).
   - `env.d.ts`: thêm type cho env mới (`<SERVICE>_DIRECT_URL` để optional).
2. Thêm entry vào `src/core/network/service-registry.ts` (`prefix` + `directUrl`).
3. Tạo `src/core/network/<service>-http-request.ts`:
   - Khai báo `<Service>ServerError`.
   - Export `<Service>HttpRequestError`.
   - Tạo `new HttpRequest<<Service>ServerError>()`.
   - Dùng `baseUrl: resolveServiceBaseUrl('<service>')`.
   - Gắn `requestInterceptor: iamAuthenticationHandler` (auth SSR) + `responseInterceptor: iamUnauthorizedHandler` nếu service dùng chung auth flow IAM.
4. Nếu service cần mock:
   - Tạo folder `src/mock/<service>/<entity>/` (modular theo entity — xem section [Mock API](#mock-api)).
   - Import mock ở cuối `src/core/network/<service>-http-request.ts` khi `NEXT_PUBLIC_MOCK_API=true`.
   - Thêm `import './<service>-http-request';` vào `src/core/network/inject-mock.ts`.
5. Tạo React Query factory:
   - Tạo `src/core/query/factories/<service>.ts`.
   - Dùng đúng `<Service>HttpRequestError`.
   - Export file mới trong `src/core/query/factories/index.ts`.
6. Tạo module API files:
   - `src/modules/<module>/services/<entity>.api.ts` dùng đúng `<service>HttpRequest`.
   - `src/modules/<module>/services/<entity>.api-types.ts` định nghĩa Request/Response types.
   - `src/modules/<module>/services/<entity>.query-keys.ts`.
   - `src/modules/<module>/services/<entity>.queries.ts` dùng đúng `createUseQuery<Service>()`.
   - `src/modules/<module>/services/<entity>.mutation.ts` dùng đúng `createUseMutation<Service>()`.
7. Với list API, luôn transform pagination:
   - Request lên backend: `pageIndex + 1`.
   - Response về client: `pageIndex - 1`.
   - Inject lại `searchTerm`/`filters`/`sorts` vào response để DataTable restore state khi remount.

**Rule:** `HttpRequest` instance, error type, query factory và mutation factory phải thuộc cùng một service.

## API File Pattern (thực tế từ employee.api.ts)

API types tách ra file riêng `<entity>.api-types.ts` — để dễ dùng lại trong mutations/queries hook và mock:

```ts
// src/modules/employee/services/employee.api-types.ts
import type { DeepPartial } from 'react-hook-form';
import type { Employee, EmployeePreview } from '../types/employee';
import type { ListRequest, ListResponse } from '@/shared/types/pagination';

export type ListEmployeesRequest = ListRequest;
export type ListEmployeesResponse = ListResponse<EmployeePreview>;

export type CreateEmployeeRequest = Omit<Employee, 'id'>;
export type CreateEmployeeResponse = EmployeePreview;

export type EmployeeDetailsRequest = Employee['id'];
export type EmployeeDetailsResponse = Employee;

export type UpdateEmployeeRequest = Pick<Employee, 'id'> & DeepPartial<Employee>;
export type RemoveEmployeeRequest = Employee['id'];

export type GenerateEmployeeCodeResponse = { employeeCode: string };
```

```ts
// src/modules/employee/services/employee.api.ts
import type {
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  EmployeeDetailsRequest,
  EmployeeDetailsResponse,
  GenerateEmployeeCodeResponse,
  ListEmployeesRequest,
  ListEmployeesResponse,
  RemoveEmployeeRequest,
  UpdateEmployeeRequest,
} from './employee.api-types';
import hrmemHttpRequest from '@/core/network/hrmem-http-request';
import { getFullName } from '@/shared/utils';

const employeeApi = {
  list,
  create,
  details,
  update,
  remove,
  generateEmployeeCode,
};
export default employeeApi;

function list(data: ListEmployeesRequest) {
  return hrmemHttpRequest.request<ListEmployeesResponse>({
    method: 'GET',
    url: '/profiles/employees',
    params: {
      ...data,
      pageIndex: (data.pageIndex ?? 0) + 1, // Client 0-based → API 1-based
    },
    transformSuccessResponse(response) {
      // Compose fullName (BE chỉ trả firstName/lastName riêng)
      response.items = response.items.map(e => ({
        ...e,
        fullName: getFullName(e.firstName, e.lastName),
      }));
      response.pageIndex -= 1; // API 1-based → Client 0-based
      // Inject lại client-side state để DataTable restore khi remount từ cache
      if (data.searchTerm) response.searchTerm = data.searchTerm;
      if (data.filters) response.filters = data.filters;
      if (data.sorts) response.sorts = data.sorts;
      return response;
    },
  });
}

function transformEmployeeResponse(response: EmployeeDetailsResponse) {
  response.fullName = getFullName(response.firstName, response.lastName);
  // Convert string → Date cho từng date field
  response.dateOfBirth = new Date(response.dateOfBirth);
  response.idDateOfIssue =
    response.idDateOfIssue && new Date(response.idDateOfIssue);
  response.idDateOfExpiry =
    response.idDateOfExpiry && new Date(response.idDateOfExpiry);
  return response;
}

function details(id: EmployeeDetailsRequest) {
  return hrmemHttpRequest.request<EmployeeDetailsResponse>({
    method: 'GET',
    url: `/profiles/employee/${id}`,
    transformSuccessResponse: transformEmployeeResponse,
  });
}

function create(data: CreateEmployeeRequest) {
  return hrmemHttpRequest.request<CreateEmployeeResponse>({
    method: 'POST',
    url: '/profiles/employee',
    data,
    transformSuccessResponse(response) {
      response.fullName = getFullName(response.firstName, response.lastName);
      return response;
    },
  });
}

function update(data: UpdateEmployeeRequest) {
  return hrmemHttpRequest.request({
    method: 'PUT',
    url: `/profiles/employee/${data.id}`,
    data,
  });
}

function remove(id: RemoveEmployeeRequest) {
  return hrmemHttpRequest.request({
    method: 'DELETE',
    url: `/profiles/employee/${id}`,
  });
}

function generateEmployeeCode() {
  return hrmemHttpRequest.request<GenerateEmployeeCodeResponse>({
    method: 'GET',
    url: '/profiles/employee/generate-employee-code',
  });
}
```

> **Rule:** API functions trả về **data đã transform**, không trả về raw response. `transformSuccessResponse` chạy ngay trong `request<T>()` và type của hàm khớp với `T` (vd `ListResponse<EmployeePreview>`).

### Date field transform

JSON không có kiểu `Date`; backend/API thường trả date/datetime dưới dạng ISO string. Nếu field trong module type được khai báo là `Date`, service **bắt buộc** convert field đó trong `transformSuccessResponse` trước khi trả dữ liệu cho UI.

Áp dụng cho mọi response shape:

- List item (`response.items`)
- Details response
- Create/update/action response
- Nested objects hoặc nested arrays có field `Date`

```ts
function transformEmployeeResponse(response: EmployeeDetailsResponse) {
  if (response.dateOfBirth) {
    response.dateOfBirth = new Date(response.dateOfBirth);
  }
  if (response.contracts) {
    response.contracts = response.contracts.map(contract => ({
      ...contract,
      startDate: new Date(contract.startDate),
      endDate: contract.endDate && new Date(contract.endDate),
    }));
  }
  return response;
}
```

Không dựa vào type annotation `Date` để giả định runtime đã là `Date`: `HttpRequest` chỉ gọi `response.json()`, không có global date reviver. Mock store cũng nên giữ ISO string khi mô phỏng API; conversion nằm ở service layer.

### AuditFields date transform

Backend/API trả `createdOnUtc` và `modifiedOnUtc` dưới dạng ISO string (`date-time`). Frontend entity type dùng `Date`, nên mọi API response chứa `AuditFields` phải convert ở service layer bằng helper trong `@/shared/utils`:

```ts
import { transformAuditFields, transformAuditFieldsList } from '@/shared/utils';

function list(data: ListEmployeesRequest) {
  return hrmemHttpRequest.request<ListEmployeesResponse>({
    method: 'GET',
    url: '/profiles/employees',
    params: {
      ...data,
      pageIndex: (data.pageIndex ?? 0) + 1,
    },
    transformSuccessResponse(response) {
      response.pageIndex -= 1;
      response.items = transformAuditFieldsList(response.items);
      return response;
    },
  });
}

function details(id: EmployeeDetailsRequest) {
  return hrmemHttpRequest.request<EmployeeDetailsResponse>({
    method: 'GET',
    url: `/profiles/employee/${id}`,
    transformSuccessResponse: transformAuditFields,
  });
}
```

Nếu response có nested audit objects (vd `Employee.documents`) thì phải gọi `transformAuditFieldsList` cho các mảng con trong cùng `transformSuccessResponse`. Mock store có thể giữ ISO string để mô phỏng API, nhưng dữ liệu rời khỏi service phải là `Date`.

### Resolve audit user an toàn

Khi UI cần resolve `createdBy` / `modifiedBy` thành thông tin hiển thị, phải chuẩn hóa danh sách user ID trước khi tạo query key hoặc gọi API:

- Loại `undefined`, `null`, chuỗi rỗng và giá trị đặc biệt `'system'` không phân biệt chữ hoa/thường (`system`, `System`, `SYSTEM`, ...).
- Loại ID trùng và sort để query key ổn định, không tạo cache entry khác nhau chỉ vì thứ tự rows thay đổi.
- Query phải dùng `enabled: normalizedUserIds.length > 0` để không gọi API khi không có user hợp lệ.
- API function cũng phải guard mảng rỗng và chuẩn hóa lại dữ liệu. Đây là lớp bảo vệ cho các caller không đi qua React Query.

```ts
export const useUsersByIds = createUseQueryHrmEm<readonly EmployeeUserId[]>()(
  userIds => {
    const normalizedUserIds = normalizeEmployeeUserIds(userIds);
    return {
      queryKey: userKeys.byIds(normalizedUserIds),
      queryFn: () => userApi.getByIds(normalizedUserIds),
      enabled: normalizedUserIds.length > 0,
    };
  },
);

function getByIds(userIds: readonly EmployeeUserId[]) {
  const normalizedUserIds = normalizeEmployeeUserIds(userIds);
  if (normalizedUserIds.length === 0) return Promise.resolve([]);
  return httpRequest.request({
    method: 'GET',
    url: '/<users-by-ids>',
    params: { userIds: normalizedUserIds.join(',') },
  });
}
```

> `'system'` là audit actor đặc biệt để hiển thị trực tiếp trên UI, không phải user ID cần resolve qua API. So sánh giá trị này không phân biệt chữ hoa/thường.

## Query Keys Pattern (thực tế từ employee.query-keys.ts)

```ts
// src/modules/employee/services/employee.query-keys.ts
import { ListRequest } from '@/shared/types/pagination';

const employeeKeys = {
  all: ['employee'],
  list: (params?: ListRequest) =>
    params
      ? (['employee', 'list', params] as const)
      : (['employee', 'list'] as const),
  details: (id?: string) => ['employee', 'details', id] as const,
  me: ['employee', 'details', 'me'] as const,
  generateEmployeeCode: ['employee', 'generate-employee-code'] as const,
};

export default employeeKeys;
```

> **Quy ước:** `all` để invalidate toàn bộ; `list(params?)` hỗ trợ cả gọi không tham số (invalidate mọi list) và có tham số (cache theo từng request); `details(id?)` cũng cho phép `id?` để invalidate theo id hoặc tất cả details.

## Queries Pattern — KHÔNG dùng `useQuery` trực tiếp

> **Rule:** Component/page/section ưu tiên dùng React Query hooks trong `*.queries.ts` / `*.mutation.ts`, không gọi trực tiếp `*.api.ts` để fetch/mutate dữ liệu nghiệp vụ. API functions chỉ nên được gọi bên trong `queryFn`, `mutationFn`, service helper, hoặc các callback load option đặc thù của FieldInput async select. Nếu một component cần dữ liệu phụ theo event/state (vd chọn xe rồi lấy phân công tài xế), tạo/tận dụng query hook sẵn có với `enabled`, `queryKey` phù hợp và xử lý side effect bằng `useEffect`.

```ts
// src/modules/employee/services/employee.queries.ts

// ❌ FORBIDDEN
import { useQuery } from '@tanstack/react-query';

// ✅ ĐÚNG — dùng factories (mỗi service có factory riêng: Iam, HrmEm, Ast)
import employeeApi from './employee.api';
import employeeKeys from './employee.query-keys';
import { createUseQueryHrmEm } from '@/core/query/factories';
import { ListRequest } from '@/shared/types/pagination';

export const useEmployees = createUseQueryHrmEm<ListRequest>()(listRequest => ({
  queryKey: employeeKeys.list(listRequest),
  queryFn: () => employeeApi.list(listRequest),
}));

export const useEmployeeDetails = createUseQueryHrmEm<string>()(id => ({
  queryKey: employeeKeys.details(id),
  queryFn: () => employeeApi.details(id),
}));

// Query không có params (TRequest = undefined ngầm định, callback không nhận arg)
export const useGenerateEmployeeCode = createUseQueryHrmEm()(() => ({
  queryKey: employeeKeys.generateEmployeeCode,
  queryFn: employeeApi.generateEmployeeCode,
  staleTime: 0, // Luôn refetch khi gọi
}));
```

### `.query` — fetchQuery tích hợp React Query cache

Mỗi hook được tạo bởi `createUseQueryHrmEm` đều có sẵn method `.query(queryClient, data)` để gọi `queryClient.fetchQuery` với cùng `queryKey`/`queryFn`. Dùng khi cần fetch trong callback/event handler thay vì render — đặc biệt cho `loadOptions` của async FieldInput.

```ts
// ✅ ĐÚNG — dùng .query trong loadOptions, tận dụng React Query cache
const queryClient = useQueryClient();

<FieldInputAsyncSelect
  loadOptions={(keyword) =>
    useEmployeeSearch.query(queryClient, { keyword })
  }
/>

// ❌ SAI — gọi api trực tiếp, không có cache
<FieldInputAsyncSelect
  loadOptions={(keyword) => employeeApi.search(keyword)}
/>
```

> **Rule:** Không tạo export `queryXxx` riêng cho cùng endpoint — dùng `.query` trực tiếp từ hook đã có.

## Mutations Pattern — KHÔNG dùng `useMutation` trực tiếp

```ts
// src/modules/employee/services/employee.mutation.ts

// ❌ FORBIDDEN
import { useMutation } from '@tanstack/react-query';

// ✅ ĐÚNG
import employeeApi from './employee.api';
import employeeKeys from './employee.query-keys';
import { createUseMutationHrmEm } from '@/core/query/factories';
import queryClient from '@/core/query/query-client';

export const useEmployeeCreate = createUseMutationHrmEm({
  mutationFn: employeeApi.create,
  onSuccess() {
    queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
  },
});

export const useEmployeeUpdate = createUseMutationHrmEm({
  mutationFn: employeeApi.update,
  onSuccess(_, variables) {
    queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
    queryClient.invalidateQueries({
      queryKey: employeeKeys.details(variables.id),
    });
  },
});

export const useEmployeeDelete = createUseMutationHrmEm({
  mutationFn: employeeApi.remove,
  onSuccess(_, id) {
    // setQueryData(undefined) để clear details cache ngay (tránh refetch 404)
    queryClient.setQueryData(employeeKeys.details(id), undefined);
    queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
  },
});
```

### Chọn đúng factory theo HttpRequest

Factory phải khớp với `HttpRequest` instance của API file:

| HttpRequest instance | Query factory         | Mutation factory         |
| -------------------- | --------------------- | ------------------------ |
| `iamHttpRequest`     | `createUseQueryIam`   | `createUseMutationIam`   |
| `hrmemHttpRequest`   | `createUseQueryHrmEm` | `createUseMutationHrmEm` |
| `astHttpRequest`     | `createUseQueryAst`   | `createUseMutationAst`   |

```ts
import {
  createUseMutationIam,
  createUseQueryIam,
} from '@/core/query/factories';

// users.api.ts/auth.api.ts dùng iamHttpRequest
export const useMe = createUseQueryIam<undefined>()(() => ({
  queryKey: usersKeys.me,
  queryFn: usersApi.me,
}));

export const useSignIn = createUseMutationIam({
  mutationFn: authApi.signin,
});
```

```ts
import {
  createUseMutationHrmEm,
  createUseQueryHrmEm,
} from '@/core/query/factories';

// employee.api.ts/organization-unit.api.ts dùng hrmemHttpRequest
export const useEmployees = createUseQueryHrmEm<ListRequest>()(listRequest => ({
  queryKey: employeeKeys.list(listRequest),
  queryFn: () => employeeApi.list(listRequest),
}));

export const useEmployeeCreate = createUseMutationHrmEm({
  mutationFn: employeeApi.create,
  onSuccess() {
    queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
  },
});
```

Không dùng nhầm factory giữa các service. Ví dụ `employee.api.ts` dùng
`hrmemHttpRequest` thì mutation phải dùng `createUseMutationHrmEm`, không dùng
`createUseMutationIam` — lý do: error type runtime sẽ không khớp.

## Query Meta Options

### Defaults

| Hook                           | Default meta                                                    |
| ------------------------------ | --------------------------------------------------------------- |
| `useAppQuery` (qua factory)    | `notifyError: true`                                             |
| `useAppMutation` (qua factory) | `notifySuccess: true`, `notifyError: true`, `showLoading: true` |

### Meta options reference

| Option          | Type                                   | Mô tả                                                                                                                                    |
| --------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `notifyError`   | `true \| false \| string`              | `true` = dùng `getMessage(error)`; `string` = TranslationsKey hoặc raw message để hiển thị                                               |
| `notifySuccess` | `true \| false \| string`              | `true` = dùng key `'common.notify.success'`; `string` = TranslationsKey custom                                                           |
| `showLoading`   | `true \| false \| 'SPINNER' \| string` | `true` = toast "Đang xử lý..."; `'SPINNER'` = spinner overlay full-screen; `string` = toast với custom loading message (TranslationsKey) |

**Rule:** Với mutation, dùng `meta.notifySuccess` / `meta.notifyError` cho toast success/error. Không gọi `notify.success()` trong `onSuccess` hoặc `notify.error()` trong `onError` chỉ để báo kết quả mutation; các callback này dành cho side effect như navigate, đóng modal, reset form hoặc cập nhật state.

### Examples

```ts
// Tắt error notification
const query = useEmployees(params, {
  meta: { notifyError: false },
});

// Giữ data cũ khi fetching (pagination)
const employees = useEmployees(listRequest, {
  placeholderData: previousData => previousData,
});

// Custom error message
const query = useEmployeeDetails(id, {
  meta: { notifyError: 'employee.notify.fetch_failed' },
});

// Mutation với custom success + spinner overlay
const create = useEmployeeCreate({
  meta: {
    showLoading: 'SPINNER', // Spinner full-screen, không cho click
    notifySuccess: 'common.notify.create_success',
  },
  onSuccess(data) {
    // Toast success đã được xử lý bởi meta.notifySuccess.
    router.push('/employees/details', { params: { id: data.id } });
  },
});

// Mutation với custom loading toast message
const checkAnomaly = useEmployeeCheckAnomaly({
  meta: { showLoading: 'employee.notify.analyzing' }, // Toast "Đang phân tích..."
});
```

## Thêm factory cho service mới

Mỗi service có factory riêng trong `src/core/query/factories/`. Ví dụ `hrmem` (pattern áp dụng cho mọi service mới):

```ts
// src/core/query/factories/hrmem.ts
import type { UseMutationOptions } from '@tanstack/react-query';
import type { HrmEmHttpRequestError } from '@/core/network/hrmem-http-request';
import { createUseMutation, createUseQuery } from './base';

export function createUseQueryHrmEm<TRequest>() {
  return createUseQuery<HrmEmHttpRequestError>()<TRequest>();
}

export function createUseMutationHrmEm<TRequest, TResponse>(
  options: UseMutationOptions<TResponse, HrmEmHttpRequestError, TRequest>,
) {
  return createUseMutation<HrmEmHttpRequestError>()<TRequest, TResponse>(
    options,
  );
}
```

> **Lưu ý:** `createUseQuery` trong `base.ts` tự động attach `.query(queryClient, data)` vào mọi hook được tạo ra — không cần export thêm `createQueryXxx` riêng cho service mới.

Sau đó export trong barrel:

```ts
// src/core/query/factories/index.ts
export * from './hrmem';
```

**Rule:** Mỗi service có factory riêng vì error type khác nhau (`IamServerError`, `HrmEmServerError`, `AstServerError`, …). Dùng nhầm factory → response error transform sai khi runtime.

## ListRequest & ListResponse (shared/types/pagination.ts)

```ts
type FilterOperator =
  | 'Equal'
  | 'NotEqual'
  | 'GreaterThan'
  | 'GreaterThanOrEqual'
  | 'LessThan'
  | 'LessThanOrEqual'
  | 'Contains'
  | 'StartsWith'
  | 'EndsWith'
  | 'In'
  | 'NotIn'
  | 'Between'
  | 'IsNull'
  | 'IsNotNull';

// operator bỏ trống mặc định 'Equal'; value cho operator đơn, values cho In/NotIn/Between
type FilterCondition = {
  field: string;
  operator?: FilterOperator;
  value?: string;
  values?: string[];
};

// direction bỏ trống mặc định 'Descending'
type SortDirection = 'Ascending' | 'Descending';
type SortCondition = { field: string; direction?: SortDirection };

type ListRequest = {
  pageIndex: number; // 0-based (client), API nhận 1-based
  pageSize: number;
  searchTerm?: string;
  filters?: FilterCondition[]; // [{ field: 'gender', value: 'Male' }]
  sorts?: SortCondition[];
};

// ListResponseData: đúng những gì server trả về.
// hasNextPage/hasPreviousPage gắn [JsonIgnore] phía server nên KHÔNG có trong JSON.
type ListResponseData<T> = {
  items: T[];
  pageIndex: number; // 0-based sau transform
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

// ListResponse: ListResponseData + searchTerm/filters/sorts được inject bởi
// transformSuccessResponse — KHÔNG đến từ server.
// Mục đích: DataTable đọc từ cached response để restore filter/sort state khi remount.
type ListResponse<T> = ListResponseData<T> & {
  searchTerm?: string;
  filters?: FilterCondition[];
  sorts?: SortCondition[];
};
```

### Rule pagination quan trọng

**Client luôn dùng `pageIndex` 0-based** (TanStack Table convention).  
**Backend luôn nhận/trả `pageIndex` 1-based.**

→ Mọi list API **phải** transform trong `transformSuccessResponse`:

- Trừ `pageIndex` về 0-based
- Copy lại `filters` (và `searchTerm`, `sorts` nếu có) từ request vào response để DataTable restore state

```ts
function list(data: ListEmployeesRequest) {
  return hrmemHttpRequest.request<ListEmployeesResponse>({
    method: 'GET',
    url: '/profiles/employees',
    params: {
      ...data,
      pageIndex: (data.pageIndex ?? 0) + 1, // ➕ Client 0-based → API 1-based
    },
    transformSuccessResponse(response) {
      response.pageIndex -= 1; // ➖ API 1-based → Client 0-based
      // Inject lại client-side state để DataTable restore khi remount từ cache
      if (data.searchTerm) response.searchTerm = data.searchTerm;
      if (data.filters) response.filters = data.filters;
      if (data.sorts) response.sorts = data.sorts;
      return response;
    },
  });
}
```

Bỏ qua transform → off-by-one toàn bộ pagination.

### Rule request cho list API

Với CRUD/table list API, request type phải dùng lại `ListRequest`:

```ts
export type ListEmployeesRequest = ListRequest;
```

Không tạo field top-level riêng như `relatedEntityId`, `status`, `fromDate`, `toDate` nếu field đó là điều kiện lọc của table. Truyền các điều kiện này qua `filters`:

```ts
{
  pageIndex: 0,
  pageSize: 10,
  filters: [
    { field: 'relatedEntityId', value: relatedEntityId },
    { field: 'status', value: 'Saved' },
  ],
  sorts: [{ field: 'createdAt', direction: 'Descending' }],
}
```

Chỉ dùng request type mở rộng khi API nghiệp vụ thật có input ngoài ý nghĩa table list, ví dụ `DashboardPeriodFilter & ListRequest` cho dashboard period.

## Mock API

### Tại sao mock chạy server-side?

Mọi request từ browser đều đi qua proxy `src/app/api/proxy/[...path]/route.ts` (xem [API Proxy Architecture](#api-proxy-architecture)). Proxy chạy trên Next.js server, dùng `appfetchInstance.fetch()` để forward request. Vì vậy:

- **Mock inject phải ở phía server** thì proxy mới thấy được.
- Inject ở client-side sẽ vô tác dụng (client không tự gọi backend).
- Check `typeof window === 'undefined'` đảm bảo mock import chỉ chạy ở Node runtime, không bị bundle vào client bundle.

### Cơ chế hoạt động

Khi `NEXT_PUBLIC_MOCK_API=true`, mỗi `HttpRequest` instance tự import file mock của mình ở cuối file, **chỉ chạy server-side** (`typeof window === 'undefined'`). Mock được inject vào `appfetchInstance` singleton — khi `appfetchInstance.fetch()` được gọi (bởi proxy), nó tìm route khớp và trả mock response thay vì gọi fetch thật.

```text
NEXT_PUBLIC_MOCK_API=true
       │
       ▼
hrmem-http-request.ts
  └─ import('@/mock/hrmem')   ← chỉ chạy trên server
         │
         ▼
  Barrel hrmem/index.ts
  └─ import './employee'      ← entity sub-folder
         └─ import './routes' ← addMockRoute(...) cho từng endpoint
         │
         ▼
  appfetchInstance (singleton)
         │
         ▼
  HttpRequest#fetch() → khớp route → trả mock Response
```

### Cấu trúc folder mock — modular theo entity

Mock của mỗi service được tổ chức thành **folder theo entity** (không phải một flat file). Mỗi entity có 5 file:

```text
src/mock/hrmem/                  # service folder
├── index.ts                     # Barrel: import './employee', './organization-unit', ...
└── employee/                    # entity folder
    ├── index.ts                 # export type & store, import './routes' (side effect)
    ├── mock-types.ts            # Type mở rộng — kế thừa từ Employee, thêm field mock-only
    ├── stores.ts                # In-memory array (employeeStore, documentStore, ...)
    ├── helpers.ts               # buildEmployeeDetails, mergeEmployee, search/filter predicates, ...
    └── routes.ts                # addMockRoute(...) cho mỗi endpoint
```

> **Lý do tách:** mock CRUD đầy đủ (list/details/create/update/delete) đụng tới state chung (store). Tách helpers/stores/routes giúp dễ test, dễ replace từng phần, và list builder logic không nhồi vào route handler.

### Bước 1 — Tạo entity mock folder

`stores.ts` — in-memory data, mutate trực tiếp khi handler ghi:

```ts
// src/mock/hrmem/employee/stores.ts
import type { EmployeeMock } from './mock-types';

export const employeeStore: EmployeeMock[] = [
  {
    id: 'fbed7e14-dc85-4ac6-9a2b-db4cc349d771',
    employeeCode: 'EMP-001',
    firstName: 'Vũ',
    lastName: 'Phạm Quang',
    // ...
  },
  // ...
];
```

`helpers.ts` — pure functions build details/preview và predicate riêng của entity:

```ts
// src/mock/hrmem/employee/helpers.ts
import type { EmployeeMock } from './mock-types';

export function buildEmployeePreview(e: EmployeeMock) {
  return {
    id: e.id,
    employeeCode: e.employeeCode,
    firstName: e.firstName,
    lastName: e.lastName,
    // ...
  };
}

export function searchEmployee(e: EmployeeMock, searchTerm: string) {
  return [e.employeeCode, e.firstName, e.lastName]
    .filter(Boolean)
    .some(value => value!.toLowerCase().includes(searchTerm));
}

export function filterEmployee(
  e: EmployeeMock,
  filter: { field: string; value: string },
) {
  if (filter.field === 'gender') return e.gender === filter.value;
  if (filter.field === 'status') return e.status === filter.value;
  return true;
}
```

`routes.ts` — khai báo route, gọi helpers:

```ts
// src/mock/hrmem/employee/routes.ts
import { v4 as uuidv4 } from 'uuid';
import {
  buildEmployeePreview,
  filterEmployee,
  searchEmployee,
} from './helpers';
import { employeeStore } from './stores';
import { appfetch } from '@/core/network/appfetch';
import hrmemHttpRequest from '@/core/network/hrmem-http-request';
import {
  buildMockListResponse,
  extractIdFromUrl,
  generateCodeFromStore,
  parseBody,
  toUrl,
} from '@/core/network/mock-utils';

// ─── GET /profiles/employee/generate-employee-code ───────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/generate-employee-code$/,
  method: 'GET',
  handler: () =>
    appfetch.json({
      employeeCode: generateCodeFromStore(
        employeeStore as unknown as Record<string, unknown>[],
        'employeeCode',
        'EMP-',
        3,
      ),
    }),
});

// ─── GET /profiles/employees (list with query) ───────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employees(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const sp = new URL(toUrl(input)).searchParams;
    return appfetch.json(
      buildMockListResponse({
        sp,
        items: employeeStore,
        search: searchEmployee,
        filter: filterEmployee,
        mapItem: buildEmployeePreview,
        defaultSort: [{ field: 'employeeCode', direction: 'Ascending' }],
      }),
    );
  },
});

// ─── GET /profiles/employee/:id ──────────────────────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/[^/?]+$/,
  method: 'GET',
  handler: input => {
    const id = extractIdFromUrl(toUrl(input), 'employee');
    const employee = employeeStore.find(e => e.id === id);
    if (!employee)
      return appfetch.error({ code: 'NOT_FOUND', message: 'Not found' }, 404);
    return appfetch.json(employee);
  },
});

// ─── POST /profiles/employee ─────────────────────────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee$/,
  method: 'POST',
  handler: async (input, init) => {
    const body = (await parseBody(input, init)) as Partial<EmployeeMock>;
    const newEmployee: EmployeeMock = {
      id: uuidv4(),
      employeeCode: body.employeeCode ?? '',
      firstName: body.firstName ?? '',
      lastName: body.lastName ?? '',
      // ... merge các field khác từ body
    } as EmployeeMock;
    employeeStore.push(newEmployee);
    return appfetch.json(buildEmployeePreview(newEmployee));
  },
});

// ─── PUT /profiles/employee/:id ──────────────────────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/[^/?]+$/,
  method: 'PUT',
  handler: async (input, init) => {
    const id = extractIdFromUrl(toUrl(input), 'employee');
    const index = employeeStore.findIndex(e => e.id === id);
    if (index === -1)
      return appfetch.error({ code: 'NOT_FOUND', message: 'Not found' }, 404);
    const body = await parseBody(input, init);
    employeeStore[index] = { ...employeeStore[index], ...body, id: employeeStore[index].id };
    return appfetch.json(employeeStore[index]);
  },
});

// ─── DELETE /profiles/employee/:id ───────────────────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/[^/?]+$/,
  method: 'DELETE',
  handler: input => {
    const id = extractIdFromUrl(toUrl(input), 'employee');
    const index = employeeStore.findIndex(e => e.id === id);
    if (index === -1)
      return appfetch.error({ code: 'NOT_FOUND', message: 'Not found' }, 404);
    employeeStore.splice(index, 1);
    return appfetch.empty();
  },
});
```

`index.ts` — barrel:

```ts
// src/mock/hrmem/employee/index.ts
export type { EmployeeMock } from './mock-types';
export { employeeStore } from './stores';
import './routes'; // side-effect: đăng ký mock routes với hrmemHttpRequest
```

> **String vs RegExp:**
>
> - `url: '/profiles/employee/abc-001'` → exact match sau khi prepend baseUrl. Dùng cho endpoint có ID cố định (vd test fixture).
> - `url: /\/profiles\/employee\/[^/?]+$/` → pattern match trên full URL. Dùng cho list (có query string) hoặc CRUD với ID động.
> - Khi có nhiều route RegExp cùng pattern (PUT và DELETE), `method` phân biệt chúng.

### Bước 2 — Khai báo inject trong service `index.ts` barrel

```ts
// src/mock/hrmem/index.ts
export type { EmployeeMock } from './employee';
export { employeeStore } from './employee';
import './employee'; // side-effect: chạy routes.ts của entity
import './organization-unit';
// Thêm entity mới: import './<new-entity>';
```

### Bước 3 — `*-http-request.ts` tự inject mock của service

Mỗi `HttpRequest` instance **tự import folder mock của mình** ở cuối file:

```ts
// src/core/network/hrmem-http-request.ts (ở cuối file)
export default hrmemHttpRequest;

// Mock
if (
  process.env.NEXT_PUBLIC_MOCK_API === 'true' &&
  typeof window === 'undefined'
) {
  import('@/mock/hrmem');
}
```

### Bước 4 — Đăng ký service trong `inject-mock.ts`

`src/core/network/inject-mock.ts` được import bởi các file dùng `appfetchInstance` trực tiếp (vd API proxy route). Đảm bảo mock được load:

```ts
// src/core/network/inject-mock.ts
import './iam-http-request';
import './hrmem-http-request';
import './ast-http-request';
// Thêm service mới: import './<new-service>-http-request';
```

### Mock current user (dev only)

#### Cơ chế

`src/mock/mock-context.ts` lưu current user ID trong `globalThis` (server-side singleton). Default fallback là `CURRENT_USER_ID` từ `src/mock/constants.ts`:

```ts
// src/mock/constants.ts
export const CURRENT_USER_ID = 'f7f65cf6-7dc4-4ff4-8b4c-6ddd2046d736'; // EMP-001

// src/mock/mock-context.ts
export function getCurrentUserId(): string {
  return globalThis.__mockCurrentUserId ?? CURRENT_USER_ID;
}
export function setCurrentUserId(userId: string) {
  globalThis.__mockCurrentUserId = userId;
}
```

Flow khi switch user:

```text
MockUserSwitcher (client)
  → POST /api/mock/switch-user { userId }   (Next.js API route)
    → setCurrentUserId(userId)              (server-side globalThis)
      → invalidate employeeKeys.me          (refetch /profiles/me)
```

> **Quan trọng:** `globalThis.__mockCurrentUserId` chỉ tồn tại trong process Node.js hiện tại. Khi restart dev server, giá trị bị reset về `CURRENT_USER_ID`.

#### Giá trị hợp lệ của createdBy / modifiedBy

`createdBy` / `modifiedBy` nhận một trong hai dạng:

- **UUID (userId)** — `'f7f65cf6-7dc4-4ff4-8b4c-6ddd2046d736'` — người dùng thực hiện thao tác
- **`'system'`** (không phân biệt chữ hoa/thường) — hệ thống tự động tạo/sửa (scheduled job, migration, v.v.)

UUID phải khớp với field `userId` trong employee store để UI resolve được tên người dùng. Dùng `'user-001'` hay bất kỳ string giả nào khác sẽ khiến UI hiển thị null:

```ts
// src/mock/hrmem/employee/stores.ts
{ id: 'fbed7e14-...', userId: 'f7f65cf6-7dc4-4ff4-8b4c-6ddd2046d736', ... }

// src/mock/<service>/stores.ts — đúng: UUID thật hoặc 'system'
{ createdBy: 'f7f65cf6-7dc4-4ff4-8b4c-6ddd2046d736', modifiedBy: null }
{ createdBy: 'system', modifiedBy: 'system' }

// SAI — string giả không resolve được
{ createdBy: 'user-001', ... }
```

#### Dùng getCurrentUserId() trong route handler

Gọi `getCurrentUserId()` để gán audit fields theo user đang active — áp dụng cho cả seed data query (vd `/profiles/me`) lẫn write operations (upload, update):

```ts
import { getCurrentUserId } from '@/mock/mock-context';

// GET /profiles/me
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/me$/,
  method: 'GET',
  handler: () => {
    const me = employeeStore.find(e => e.userId === getCurrentUserId());
    return me
      ? appfetch.json(me)
      : appfetch.error({ code: 'NOT_FOUND', message: 'Not found' }, 404);
  },
});

// POST /assets/upload — gán createdBy
astHttpRequest.addMockRoute({
  url: /\/assets\/upload$/,
  method: 'POST',
  handler: async (input, init) => {
    const newAsset = {
      id: uuidv4(),
      // ...fields từ formData...
      createdBy: getCurrentUserId(),
      createdOnUtc: new Date().toISOString(),
      modifiedBy: null,
      modifiedOnUtc: null,
    };
    assetStore.push(newAsset);
    return appfetch.json(newAsset);
  },
});

// PATCH /assets/:id — gán modifiedBy
astHttpRequest.addMockRoute({
  url: /\/assets\/[^/?]+$/,
  method: 'PATCH',
  handler: async (input, init) => {
    const body = await parseBody(input, init);
    assetStore[index] = {
      ...assetStore[index],
      ...body,
      modifiedBy: getCurrentUserId(),
      modifiedOnUtc: new Date().toISOString(),
    };
    return appfetch.json(assetStore[index]);
  },
});
```

#### MockUserSwitcher

Floating widget `MockUserSwitcher` ([src/mock/MockUserSwitcher.tsx](src/mock/MockUserSwitcher.tsx)) hiển thị popup cho phép chọn user khi `NEXT_PUBLIC_MOCK_API=true`. Danh sách user lấy từ `GET /profiles/employee/preview`; user hiện tại lấy từ `GET /profiles/me`.

### appfetch helpers

```ts
appfetch.json(data, (status = 200)); // JSON response (dùng hầu hết)
appfetch.text(body, (status = 200)); // Plain text response
appfetch.empty((status = 204)); // Empty response (DELETE thành công)
appfetch.error(data, (status = 400)); // Error response (test error handling)
```

### Mock Utility Functions

Import từ `@/core/network/mock-utils`:

```ts
import {
  buildMockListResponse,
  extractIdFromUrl,
  extractPathParams,
  parseBody,
  toUrl,
} from '@/core/network/mock-utils';
```

#### `toUrl(input)` → `string`

Convert `RequestInfo | URL` thành string URL. **Trả về `string`**, không phải URL object.

```ts
// ✅ ĐÚNG — wrap bằng new URL() để lấy searchParams
const sp = new URL(toUrl(input)).searchParams;
const searchTerm = sp.get('searchTerm') ?? undefined;

// ❌ SAI — toUrl() không có .searchParams hay .pathname
toUrl(input).searchParams; // TypeError: string không có property này
```

Helper pattern dùng trong nhiều routes:

```ts
function getSearchParams(input: RequestInfo | URL) {
  return new URL(toUrl(input)).searchParams;
}
```

#### `buildMockListResponse(options)` → `ListResponseData<T>`

Dùng cho **mọi mock list API**. Không tự viết lại pagination/filter/sort trong từng route.

Mock list route nhận `pageIndex` **1-based** giống backend thật, rồi trả `pageIndex` **1-based**. Service API sẽ transform về 0-based trong `transformSuccessResponse`, giống flow thật.

Helper xử lý sẵn:

- `pageIndex`, `pageSize`: guard giá trị invalid, default `1` và `10`.
- `searchTerm`: trim + lowercase, gọi predicate `search`.
- `filters`: parse format `filters[0].field` / `filters[0][field]` và `filters[0].value` / `filters[0][value]`.
- `sorts`: parse format `sorts[0].field` / `sorts[0][field]` và `sorts[0].direction` / `sorts[0][direction]`.
- `mapItem`: map store entity sang preview/list item.
- `defaultSort`: sort mặc định khi request không truyền `sorts`.

```ts
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employees(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const sp = new URL(toUrl(input)).searchParams;
    return appfetch.json(
      buildMockListResponse({
        sp,
        items: employeeStore,
        search: searchEmployee,
        filter: filterEmployee,
        mapItem: buildEmployeePreview,
        defaultSort: [{ field: 'employeeCode', direction: 'Ascending' }],
      }),
    );
  },
});
```

Rule:

- `List*Request` cho CRUD/table list phải là `ListRequest`; không thêm field riêng như `relatedEntityId`, `status`, `fromDate` ở top-level nếu các field đó có thể đi qua `filters`.
- Mock list route không tự parse `pageIndex/pageSize`, không tự trả `totalItems/totalPages`.
- Field đặc thù không phải table filter, ví dụ period của dashboard, chỉ dùng khi API nghiệp vụ thật định nghĩa riêng; phần list vẫn phải đi qua `buildMockListResponse`.

#### `extractIdFromUrl(url, segment)` → `string | null`

Lấy segment cuối cùng sau `segment` trong URL. **Trả về `string | null`** — cần handle null.

```ts
// URL: /profiles/employee/abc-001
const id = extractIdFromUrl(toUrl(input), 'employee'); // 'abc-001' | null
const safeId = id ?? '';
```

#### `extractPathParams(pattern, url)` → `Record<string, string>`

Parse named params từ URL theo pattern. **Arg thứ nhất là pattern, thứ hai là URL string.**

```ts
// ✅ ĐÚNG — pattern trước, url sau
const params = extractPathParams(
  '/profiles/employee/:employeeId/documents/:id',
  toUrl(input), // string
);
params.employeeId; // string
params.id; // string

// ❌ SAI — đảo ngược args
extractPathParams(toUrl(input), '/profiles/employee/:employeeId/documents/:id');
```

#### `parseBody(input, init)` → `Promise<Record<string, unknown>>`

Parse JSON body từ POST/PUT request.

```ts
handler: async (input, init) => {
  const body = await parseBody(input, init);
  const name = body.name as string;
  const amount = Number(body.amount ?? 0);
  // ...
};
```

### Thứ tự đăng ký Mock Routes

Route được match **theo thứ tự đăng ký** — route nào đăng ký trước sẽ thắng. **Routes cụ thể hơn phải đăng ký TRƯỚC routes tổng quát.**

```ts
// ✅ ĐÚNG — specific trước, general sau
hrmemHttpRequest.addMockRoute({ url: /\/profiles\/employee\/generate-employee-code$/, method: 'GET', ... });          // /generate-employee-code
hrmemHttpRequest.addMockRoute({ url: /\/profiles\/employee\/[^/?]+\/documents\/[^/?]+$/, method: 'GET', ... });       // /:id/documents/:docId
hrmemHttpRequest.addMockRoute({ url: /\/profiles\/employee\/[^/?]+\/documents(\?.*)?$/, method: 'GET', ... });        // /:id/documents (list)
hrmemHttpRequest.addMockRoute({ url: /\/profiles\/employee\/[^/?]+$/, method: 'GET', ... });                          // /:id
hrmemHttpRequest.addMockRoute({ url: /\/profiles\/employees(\?.*)?$/, method: 'GET', ... });                          // /employees (list)

// ❌ SAI — general /:id trước sẽ nuốt cả /:id/documents
hrmemHttpRequest.addMockRoute({ url: /\/profiles\/employee\/[^/?]+$/, ... });           // ← match cả /abc-001/documents
hrmemHttpRequest.addMockRoute({ url: /\/profiles\/employee\/[^/?]+\/documents$/, ... }); // ← không bao giờ được gọi
```

> **Quy tắc:** Với một entity, đăng ký theo thứ tự: route hành động đặc biệt (`/generate-code`, `/action`) → nested routes (`/:parent/:id/sub`) → `/:id` → `/list`.

## API Proxy Architecture

HTTP request đi theo 2 đường tùy runtime:

- **Client (browser):** qua proxy `src/app/api/proxy/[...path]/route.ts`. Proxy inject `Authorization: Bearer <accessToken>` từ session rồi forward tới backend (URL resolve bằng `resolveProxyBackendUrl`).
- **Server (SSR / Server Component):** gọi thẳng backend, không qua proxy. Token được inject bởi `requestInterceptor: iamAuthenticationHandler` — handler đọc `getServerSession` và gắn `Authorization` (chỉ chạy server-side; client return sớm).

AI không cần xử lý auth header trong API calls — `HttpRequest` instance đã handle cả 2 đường.

> **directUrl:** nếu set `<SERVICE>_DIRECT_URL`, cả 2 đường đều trỏ thẳng vào service local thay vì gateway (xem [Service Registry](#service-registry--config-base-url-tập-trung)). Mặc định (không set) → đi qua gateway.

### API proxy contract

`src/app/api/proxy/[...path]/route.ts` là ranh giới bảo mật giữa browser và backend. Khi sửa proxy hoặc thêm service mới, giữ các rule sau:

- `OPTIONS` là CORS preflight, phải trả `204` ngay tại proxy và không gọi `getServerSession`.
- Proxy không forward `cookie`, `authorization` hoặc header nhạy cảm từ browser. Header `Authorization: Bearer <accessToken>` luôn được inject từ NextAuth session phía server.
- `resolveProxyBackendUrl(pathSegments, search)` chỉ được resolve tới service prefix đã khai báo trong `SERVICE_REGISTRY`; prefix lạ trả `404`, path segment rỗng/`.`/`..`/chứa slash trả `400`.
- Nếu `NEXT_PUBLIC_MOCK_API=true`, proxy phải `await ensureMockRoutesReady()` trước khi gọi `appfetchInstance.fetch()` để mock route đăng ký xong.
- Response `204`, `205`, `304` không được trả body.

### API proxy CORS

CORS của proxy là credentialed CORS vì request có thể dựa vào session cookie. Không dùng `NEXTAUTH_COOKIE_DOMAIN` hoặc wildcard subdomain làm allowlist CORS.

- Allowed origin phải so khớp exact `origin` lấy từ các env URL: `NEXT_PUBLIC_APIPROXY_BASE_URL`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SIGNIN_URL`.
- `localhost`, `127.0.0.1`, `[::1]` chỉ được allow khi `NODE_ENV !== 'production'`.
- Chỉ set `Access-Control-Allow-Origin` và `Access-Control-Allow-Credentials` khi origin được allow.
- Nếu request có `Origin`, luôn set/merge `Vary: Origin`. Nếu backend đã trả `Vary` như `Accept-Language`, proxy phải preserve và merge, không overwrite.
- Preserve các response header cần thiết từ backend: `cache-control`, `content-type`, `content-disposition`, `vary`.
- Expose `Content-Disposition` qua `Access-Control-Expose-Headers` để client đọc được filename/header download.
