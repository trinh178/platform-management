# Platform Management (HVA Nexus)

## 1. Overview

Platform Management (PLM) là ứng dụng trong hệ thống **HVA Nexus**, dùng để quản trị các metadata và cấu hình dùng chung của toàn bộ platform.

Platform Management **không sở hữu business data** của các application/service khác. Nó chỉ quản lý thông tin định danh, cấu trúc và cấu hình ở cấp platform.

Hệ thống hỗ trợ:

* Đăng ký và quản lý metadata App, Service, Domain, Resource (Registry)
* Quản lý quan hệ many-to-many giữa App và Service
* Cung cấp chuẩn định danh dùng cho cross-service reference của toàn platform (ReferenceService/ReferenceDomain/ReferenceResource)
* Quản lý thông tin tổ chức, giá trị mặc định hệ thống, ngôn ngữ/định dạng hiển thị và thương hiệu (Settings)

Hai thành phần chính:

* **Registry**: Quản lý Apps, Services, Domains, Resources và quan hệ giữa App và Service.
* **Settings**: Quản lý các cấu hình chung của platform như Organization, General, Localization và Branding.

---

## 1.1 Application Code (AppCode)

Platform Management là một ứng dụng thuộc hệ thống **HVA Nexus**.

AppCode của Platform Management:

```text
PLM
```

AppCode được sử dụng trong:

* Permission key
* Routing / integration giữa các ứng dụng HVA Nexus
* Audit và báo cáo cross-app
* Định danh chính PLM trong Registry mà PLM tự quản lý (PLM tự đăng ký chính nó như một App/Service)

Ví dụ:

```text
PLM.REGISTRY.APP.CREATE
PLM.REGISTRY.APP_SERVICE_MAPPING.ASSIGN
PLM.SETTINGS.ORGANIZATION.UPDATE
PLM.SETTINGS.BRANDING.VIEW
```

PLM cũng lưu metadata của các app/service khác trong HVA Nexus. Ví dụ dữ liệu Registry có thể mô tả:

```text
appCode:     FTM        # Fuel Tracking Management
serviceCode: HRM_EM      # HR Management - Employee
serviceCode: FLEET_MNG   # Fleet Management
```

Phân biệt **AppCode** và **ServiceCode**:

* **AppCode** là mã của một app frontend hiển thị trong HVA Nexus (App Switcher, portal).
* **ServiceCode** là mã của một service backend. Mã quyền dùng ServiceCode làm phần đầu (`FTM.FUEL_ENTRY.FUEL_ENTRY.CREATE`, `IAM.USER.USER.CREATE`, ...), vì quyền được kiểm tra ở backend và Domain/Resource thuộc về service.

Một App liên kết với các Service qua App-Service Mapping. Service **Primary** là service chính của App; quyền thuộc Service Primary quyết định người dùng có thấy App hay không (xem rule `my_apps_filtered_by_app_permission`).

PLM là **nơi duy nhất quản lý danh mục quyền** (Service → Domain → Resource → Action). IAM chỉ đồng bộ danh mục này về, không tự thêm/sửa/xoá permission; việc gán permission cho role vẫn thuộc IAM (xem mục 4.5).

---

## 1.2 Source Material

Tài liệu này được xây dựng từ:

* `platform-management/_raw-docs/draft.md`: mô tả nghiệp vụ gốc của Platform Management
* `docs.example`: cấu trúc, cách trình bày và mức độ chi tiết mẫu
* Các app đã có `docs/` trong cùng repo (`fuel-tracking-management`, `iam`, `audit-service`, `asset-storage`, `trading-bot`, `wats`, ...): dùng để xác nhận AppCode thực tế của các service liên quan và thống nhất convention chung của HVA Nexus

Những nội dung không có trực tiếp trong `draft.md` (ví dụ field chi tiết của entity, flow CRUD, permission key) được ghi theo dạng contract suy luận hợp lý dựa trên convention đã dùng ở các app khác trong cùng hệ thống. Quyết định phân tích đáng chú ý được ghi rõ trong `rules` của domain tương ứng (ví dụ `default_language_single_source`) thay vì để mơ hồ.

---

## 1.3 Editing Rules

Khi thêm hoặc sửa tài liệu trong `platform-management/docs`, đọc [`EDITING_RULES.md`](./EDITING_RULES.md) trước để đảm bảo nội dung đúng phạm vi nghiệp vụ.

---

## 2. Domain Structure

| Domain | Tên tiếng Việt | Tên tiếng Anh | Mô tả |
| --- | --- | --- | --- |
| REGISTRY | Danh mục đăng ký | App, Service & Resource Registry | Quản lý metadata App, Service, Domain, Resource và quan hệ App-Service trong platform |
| SETTINGS | Cấu hình platform | Platform Settings | Quản lý cấu hình dùng chung: tổ chức, giá trị mặc định hệ thống, ngôn ngữ/định dạng và thương hiệu |

---

## 3. Core Concepts

### 3.1 Entities

Entity là dữ liệu cốt lõi của từng domain. Mỗi entity gồm `fields`, `constraints`, và có thể dùng `audit: true` để tự động có AuditFields.
Entity không mặc định là một bảng database; đây là contract dữ liệu nghiệp vụ. Các shape rút gọn chỉ phục vụ lựa chọn/tra cứu nhanh không khai báo thành entity riêng.

```yaml
entities:
  App:
    description: Metadata định danh một application/frontend trong platform
    audit: true
    fields:
      id: uuid
      appCode: string
      name: string
      status: enum(registry_status)
    constraints:
      - appCode unique
```

### 3.2 Flows

Flow là luồng nghiệp vụ hoặc hành động hệ thống. Flow có thể map sang API, permission và actor.

```yaml
flows:
  - name: assign_service_to_app
    description: Gán một Service cho một App
    actor: platform_admin
    permission: PLM.REGISTRY.APP_SERVICE_MAPPING.ASSIGN
    api:
      method: POST
      path: /registry/app-service-mappings
    input:
      - appId
      - serviceId
    output:
      - app_service_mapping
```

### 3.3 Features

Feature mô tả khả năng ở cấp page/action/system.

| Type | Mô tả | Có route |
| --- | --- | --- |
| page | Màn hình | Có |
| action | Hành động người dùng/API | Không bắt buộc |
| system | Xử lý tự động qua event/cron | Không |

```yaml
features:
  - name: app_service_mapping
    type: page
    route:
      path: /registry/app-service-mapping
    permissions:
      - PLM.REGISTRY.APP_SERVICE_MAPPING.VIEW
    flows:
      - list_app_service_mappings
      - assign_service_to_app
```

### 3.4 Rules

Rule là chính sách nghiệp vụ cấp domain, dùng cho validation, state transition, tính toán và cảnh báo.

```yaml
rules:
  - name: registry_owns_metadata_only
    description: PLM chỉ lưu metadata định danh, không lưu business data thực tế của App/Service
    condition: App/Service/Domain/Resource fields are limited to identity/lifecycle metadata
    on_violation: move business data field to owning service's own domain
```

### 3.5 Actors

Actor là thực thể thực hiện hành động trong hệ thống.

| Actor | Mô tả |
| --- | --- |
| `platform_admin` | Quản trị nền tảng, toàn quyền Registry và Settings |
| `platform_viewer` | Nhân sự nội bộ cần tra cứu Registry/Settings, chỉ đọc |
| `external_application` | Ứng dụng/service khác trong HVA Nexus đọc registry metadata hoặc platform settings dùng chung |
| `authenticated_user` | Mọi người dùng đã đăng nhập HVA Nexus, ở bất kỳ app nào - chỉ đọc danh sách app của chính mình |
| `anonymous_user` | Người chưa đăng nhập (ví dụ trang đăng nhập) - chỉ đọc cấu hình hiển thị công khai |

Source of truth: [`shared/actors.yaml`](./shared/actors.yaml).

---

## 4. Permission Model

Permission là cơ chế duy nhất để kiểm soát truy cập, trừ hai flow phục vụ mọi app được liệt kê ở mục 4.4.

### 4.1 Format

```text
<ServiceCode>.<Domain>.<Resource>.<Action>
```

Mỗi phần theo `UPPER_SNAKE_CASE`. Mỗi Action khai báo trên một Resource trong Registry sinh ra đúng một mã quyền.

Ví dụ:

```text
PLM.REGISTRY.APP.CREATE
PLM.REGISTRY.DOMAIN.VIEW
PLM.REGISTRY.APP_SERVICE_MAPPING.ASSIGN
PLM.SETTINGS.BRANDING.UPDATE
```

### 4.2 Action chuẩn

Source of truth: [`shared/permissions.yaml`](./shared/permissions.yaml).

| Nhóm | Actions |
| --- | --- |
| CRUD | `CREATE`, `UPDATE`, `DELETE`, `VIEW` |
| Quan hệ App-Service | `ASSIGN`, `UNASSIGN` |
| Danh mục quyền | `IMPORT`, `EXPORT` |

Danh sách trên là action **của chính PLM**. Action của Resource thuộc service khác không bắt buộc nằm trong danh sách này, chỉ cần đúng `UPPER_SNAKE_CASE`.

### 4.3 Nguyên tắc

* Permission chỉ thể hiện quyền truy cập
* Không chứa business logic
* Không sử dụng role trung gian trong domain spec
* Actor được gán trực tiếp permission
* Resource phải rõ ràng và thuộc domain sở hữu
* Settings không có action `CREATE`/`DELETE` vì mỗi entity là singleton đã được seed sẵn

### 4.4 Ngoại lệ không yêu cầu permission

Một số dữ liệu cần cho **mọi** người dùng ở **mọi** app ngay khi mở app, nên không thể gắn với permission PLM. Cấp `PLM.*.VIEW` cho tất cả người dùng sẽ mở luôn trang quản trị và metadata nội bộ của PLM. Vì vậy các nhu cầu này dùng flow riêng, đánh dấu `permission: none`, với dữ liệu trả về được giới hạn bằng rule:

| Flow | Actor | Điều kiện | Rule giới hạn dữ liệu |
| --- | --- | --- | --- |
| `list_my_apps` (REGISTRY) | `authenticated_user` | Đã đăng nhập | `my_apps_filtered_by_app_permission`: chỉ App Active mà người dùng có permission thuộc một Service Primary của App (App không có Service Primary thì ai cũng thấy) |
| `get_public_settings` (SETTINGS) | `anonymous_user` | Không cần đăng nhập | `public_settings_display_only`: chỉ thông tin hiển thị, không có thông tin liên hệ/ghi chú/audit |

Quy tắc khi thêm ngoại lệ mới:

* Chỉ đọc, không có flow ghi nào được `permission: none`
* Phải có rule giới hạn dữ liệu trả về; không dùng lại flow quản trị (ví dụ `list_apps`) để làm ngoại lệ
* Ghi vào bảng trên và vào `shared/actor-permissions.yaml`

### 4.5 Danh mục quyền và đồng bộ sang IAM

* PLM quản lý danh mục quyền: thêm/sửa/xoá Action trên Resource, import và export danh sách mã (file Code list TXT, mỗi dòng một mã).
* IAM lấy danh mục qua flow `get_permission_catalog` và đồng bộ khi quản trị viên bấm đồng bộ. Sau mỗi lần đồng bộ, danh mục ở IAM giống PLM 100%: mã mới được thêm, mã đã đổi được cập nhật, mã không còn trong PLM bị xoá cùng các gán role của nó.
* IAM khớp theo **id của Action**, không theo mã. Đổi mã Service/Domain/Resource ở PLM thì mã ở IAM đổi theo và các gán role được giữ. Đổi mã Action được tính là xoá Action cũ và tạo Action mới.
* Việc mã quyền có đang được kiểm tra trong code của các service hay không nằm ngoài phạm vi PLM; người quản trị chịu trách nhiệm giữ hai bên khớp nhau. Xem rule `iam_mirrors_registry_permissions`.

---

## 5. Actor Permission Mapping

Actor được gán trực tiếp permission. Source of truth: [`shared/actor-permissions.yaml`](./shared/actor-permissions.yaml).

Tóm tắt scope:

| Actor | Scope chính |
| --- | --- |
| `platform_admin` | Full access (`*`) |
| `platform_viewer` | Xem toàn bộ Registry và Settings |
| `external_application` | Đọc Registry metadata (resolve reference) và đọc Settings dùng chung cho UI của app khác |
| `authenticated_user` | Không có permission PLM - chỉ dùng `list_my_apps` (xem mục 4.4) |
| `anonymous_user` | Không có permission PLM - chỉ dùng `get_public_settings` (xem mục 4.4) |

---

## 6. Routing (Feature-based)

Routing được định nghĩa trong feature `type = page`.

Base path domain được quản lý trong [`shared/sitemap.yaml`](./shared/sitemap.yaml).

| Domain | Base path |
| --- | --- |
| REGISTRY | `/registry` |
| SETTINGS | `/settings` |

```yaml
features:
  - name: app_list
    type: page
    route:
      path: /registry/apps

  - name: app_service_mapping
    type: page
    route:
      path: /registry/app-service-mapping

  - name: branding_setting
    type: page
    route:
      path: /settings/branding
```

Mapping:

```text
Route -> Feature -> Flow -> Permission
```

---

## 7. Design Principles

* Domain-Driven Design (DDD)
* PLM chỉ quản lý **platform metadata và platform-level settings**, không bao giờ lưu business data thực tế của service khác (xem mục 8 - Responsibility Boundary)
* App và Service là entity độc lập, không có quan hệ ownership - chỉ liên kết qua App-Service Mapping (many-to-many)
* Domain/Resource là metadata thuộc về một Service cụ thể, dùng làm chuẩn cross-service reference nhưng không sở hữu dữ liệu được tham chiếu
* REGISTRY và SETTINGS độc lập với nhau; SETTINGS không phụ thuộc dữ liệu REGISTRY
* Settings là singleton theo từng nhóm (Organization/General/Localization/Branding) - không hỗ trợ multi-tenant/multi-organization trong phạm vi hiện tại
* BrandingSetting.logoAssetId có thể override OrganizationSetting.logoAssetId cho hiển thị sản phẩm; nếu không set thì fallback về logo tổ chức
* Mọi code Registry (`appCode`, `serviceCode`, `domainCode`, `resourceCode`) là định danh có chủ đích do người tạo nhập, không phải sequence tự sinh
* Field API dùng camelCase

---

## 7.1 Schema Conventions

### 7.1.1 Audit fields

Entity persistent có `audit: true` sẽ có AuditFields trong response.

```yaml
entities:
  App:
    audit: true
    fields:
      id: uuid
      appCode: string
```

AuditFields xem chi tiết tại [`shared/entities.yaml`](./shared/entities.yaml).

### 7.1.2 List request/response contracts

Flow list có `output: list_response` phải dùng `input: list_request`, không bung riêng
`pagination`, `searchTerm`, `filters`, `sorts` thành input top-level.

Contract chuẩn xem tại [`shared/conventions.yaml`](./shared/conventions.yaml):

```text
list_request:
  pageIndex?: number              # 1-based, default 1
  pageSize?: number               # default 20
  searchTerm?: string
  filters?: { field: string; operator?: string; value?: string; values?: string[] }[]
  sorts?: { field: string; direction?: 'Ascending' | 'Descending' }[]

list_response<T>:
  items: T[]
  pageIndex: number
  pageSize: number
  totalItems: number
  totalPages: number
```

### 7.1.3 Constraints vs Rules

| Tên | Phạm vi | Mô tả | Đặt ở |
| --- | --- | --- | --- |
| `constraints` | Cấp entity | Ràng buộc dữ liệu nội bộ entity | `entities.<EntityName>.constraints` |
| `rules` | Cấp domain | Business policy cross-entity / state / calculation | Section `rules:` cấp domain |

### 7.1.4 Registry code format

Mọi code Registry theo `UPPER_SNAKE_CASE`, phạm vi duy nhất khác nhau theo cấp:

| Field | Phạm vi duy nhất |
| --- | --- |
| `App.appCode` | Toàn platform |
| `Service.serviceCode` | Toàn platform |
| `Domain.domainCode` | Trong phạm vi `serviceId` |
| `Resource.resourceCode` | Trong phạm vi `domainId` |

Chi tiết xem [`shared/conventions.yaml`](./shared/conventions.yaml).

### 7.1.5 Naming conventions

| Loại | Pattern | Ví dụ |
| --- | --- | --- |
| Entity | `PascalCase` số ít | `App`, `AppServiceMapping` |
| Flow | `snake_case` verb_object | `assign_service_to_app` |
| Feature | `snake_case` entity_action/business_term | `app_service_mapping` |
| Permission key | `PLM.<DOMAIN>.<RESOURCE>.<ACTION>` | `PLM.REGISTRY.DOMAIN.VIEW` |
| Route path | kebab-case | `/registry/app-service-mapping` |
| Enum name | `snake_case` | `registry_status` |
| Registry code | `UPPER_SNAKE_CASE` | `FUEL_ENTRY`, `HRM_EM` |

Feature name phải unique trong toàn hệ thống.

---

## 8. Responsibility Boundary

Platform Management chỉ quản lý **platform metadata và platform-level settings**.

### Platform Management sở hữu

* App metadata
* Service metadata
* Domain metadata
* Resource metadata
* App–Service relationships
* Organization information
* Platform settings (General, Localization)
* Platform branding

### Không thuộc Platform Management

| Responsibility | Owner (AppCode) |
| --- | --- |
| User / Identity | IAM |
| Role | IAM |
| Permission | IAM |
| Policy | IAM |
| Audit Log | Audit Service (AUDIT) |
| Notification | Notification Service (NTS) |
| Employee data | HRM (HRM_EM) |
| Vehicle data | Fleet Management (FLEET_MNG) |
| Workflow / approval data | WATS |
| Document generation | Document Automation System (DAS) |
| File/asset storage | Asset Service (AST) |
| Business configuration của HRM | HRM (HRM_EM, HRM_AL, HRM_RE, HRM_IC) |
| Business configuration của Fleet | Fleet Management (FLEET_MNG) |
| Secrets / Credentials | Infrastructure / Secret Management |

> AppCode ở trên phản ánh các service đã đăng ký trong HVA Nexus tại thời điểm viết tài liệu này. Danh sách thực tế sẽ do chính Registry của PLM quản lý và có thể mở rộng theo thời gian.

---

## 9. Conceptual Model

```text
Platform Management
│
├── Registry
│   ├── Apps
│   ├── Services
│   ├── Domains
│   ├── Resources
│   └── App–Service Mapping
│
└── Settings
    ├── Organization
    ├── General
    ├── Localization
    └── Branding
```

Quan hệ giữa các thành phần:

```text
App ─────────────── Service
                    │
                    └── Domain
                          │
                          └── Resource
```

App và Service là các entity độc lập. App sử dụng Service thông qua App–Service Mapping.

---

## 10. Cross-Service Reference

Các Service trong platform sử dụng một chuẩn reference thống nhất:

```text
ReferenceService
ReferenceDomain
ReferenceResource
ReferenceId
```

Ví dụ một Notification liên quan đến Employee:

```text
ReferenceService  = HRM_EM
ReferenceDomain   = Employee
ReferenceResource = Employee
ReferenceId       = EMP001
```

Platform Management cung cấp metadata để xác định Service, Domain và Resource (qua flow `get_reference_metadata`, xem [`domains/registry/domain.yaml`](./domains/registry/domain.yaml)) nhưng **không sở hữu** entity `EMP001` - dữ liệu đó vẫn thuộc HRM_EM.

Đây cũng là chuẩn mà một số service hiện đang dùng cục bộ trước khi có PLM (ví dụ WATS tự duy trì `shared/services.yaml` làm service registry riêng để biết resource nào được phép tham chiếu). Khi PLM go-live, các service này có thể dần chuyển sang tra cứu Registry của PLM thay vì duy trì danh sách cục bộ, để tránh lệch dữ liệu giữa nhiều nguồn.

---

## 11. Folder Structure

```text
platform-management/docs/
|-- README.md
|-- EDITING_RULES.md
|-- external-services.yaml   # External services PLM tích hợp (IAM, Asset Service)
|-- domains/
|   |-- registry/domain.yaml
|   `-- settings/domain.yaml
`-- shared/
    |-- permissions.yaml
    |-- actors.yaml
    |-- actor-permissions.yaml
    |-- enums.yaml
    |-- entities.yaml
    |-- references.yaml
    |-- sitemap.yaml
    `-- conventions.yaml
```

---

## 12. Initial Scope

Phiên bản đầu tiên của Platform Management tập trung vào:

1. App Registry
2. Service Registry
3. Domain Registry
4. Resource Registry
5. App–Service Mapping
6. Organization Settings
7. General Settings
8. Localization Settings
9. Branding Settings

Các chức năng như Event Registry, Integration Management, Environment Management và Feature Management có thể được bổ sung trong các phiên bản sau khi có nhu cầu thực tế. Khi bổ sung, cần domain mới hoặc mở rộng REGISTRY - không nên gộp vào SETTINGS.

---

## 13. Usage

Tài liệu này là **source of truth** cho Platform Management:

* Phân tích nghiệp vụ
* Làm căn cứ xây dựng API, validation và permission guard theo nghiệp vụ
* Làm căn cứ triển khai route, feature, action và permission theo nghiệp vụ
* Làm chuẩn tham chiếu để các service khác trong HVA Nexus đăng ký App/Service/Domain/Resource và tra cứu cross-service reference
* Onboarding team phát triển và QA

External service integrations xem tại [`external-services.yaml`](./external-services.yaml).
