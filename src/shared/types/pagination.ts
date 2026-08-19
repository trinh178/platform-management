// Paging request — pageIndex mặc định 1, pageSize mặc định 20 khi client bỏ trống.
export interface PaginationRequest {
  pageIndex: number;
  pageSize: number;
}

export type PaginationParams = Partial<PaginationRequest>;

// Toán tử lọc hỗ trợ bởi FilterCondition.
export type FilterOperator =
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

// Một điều kiện lọc.
// - value: dùng cho operator giá trị đơn (Equal, Contains, GreaterThan, ...).
// - values: dùng cho operator danh sách (In, NotIn, Between).
// - operator bỏ trống mặc định là 'Equal'.
export interface FilterCondition {
  field: string;
  operator?: FilterOperator;
  value?: string;
  values?: string[];
}

export interface FilterRequest {
  searchTerm?: string;
  filters?: FilterCondition[];
}

// Chiều sắp xếp; bỏ trống mặc định là 'Descending'.
export type SortDirection = 'Ascending' | 'Descending';

export interface SortCondition {
  field: string;
  direction?: SortDirection;
}

export interface SortRequest {
  sorts?: SortCondition[];
}

export type ListRequest = PaginationParams & FilterRequest & SortRequest;

// PagedResult<T> server thực sự trả về.
// hasNextPage/hasPreviousPage gắn [JsonIgnore] phía server nên KHÔNG có trong JSON.
export type ListResponseData<T> = {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

// Client-enriched: server response + searchTerm/filters/sorts inject bởi transformSuccessResponse
// để DataTable có thể restore state khi remount từ cached data.
// searchTerm/filters/sorts KHÔNG đến từ server — chúng được copy từ ListRequest trong transformSuccessResponse.
export type ListResponse<T> = ListResponseData<T> & FilterRequest & SortRequest;
