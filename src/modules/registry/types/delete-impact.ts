// GET /registry/{services|domains|resources}/{id}/delete-impact — số lượng dữ
// liệu con sẽ bị xoá kèm. `mappings` chỉ có ở Service: còn mapping thì không
// được xoá (409 SERVICE_HAS_MAPPINGS).
export type ServiceDeleteImpact = {
  domains: number;
  resources: number;
  actions: number;
  mappings: number;
};

export type DomainDeleteImpact = {
  resources: number;
  actions: number;
};

export type ResourceDeleteImpact = {
  actions: number;
};

export type DeleteImpact = Partial<ServiceDeleteImpact>;
