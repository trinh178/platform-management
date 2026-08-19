import { ListRequest } from '../types/pagination';

export const defaultListRequest: ListRequest = {
  pageIndex: 0,
  pageSize: 10,
} as const;

export const pageSizeOptions = [5, 10, 20, 50, 100] as const;
