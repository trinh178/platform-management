// Action là bảng con của Resource, mỗi action có `id` riêng — IAM đồng bộ
// permission theo id này (RegistryActionId), không theo mã.
export interface ResourceActionMock {
  id: string;
  action: string;
}

export interface ResourceMock {
  id: string;
  domainId: string;
  resourceCode: string;
  name: string;
  description?: string;
  actions: ResourceActionMock[];
  createdBy?: string;
  createdOnUtc?: string;
  modifiedBy?: string | null;
  modifiedOnUtc?: string | null;
}
