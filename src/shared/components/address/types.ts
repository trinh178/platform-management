export interface Ward {
  wardCode: number | null;
  wardName?: string | null;
}

export interface District {
  districtCode: number | null;
  districtName?: string | null;
  wards?: Ward[];
}

export interface Province {
  provinceCode: number | null;
  provinceName?: string | null;
  districts?: District[];
}

export interface Address {
  province?: Province | null;
  district?: District | null;
  ward?: Ward | null;
  street?: string | null;
}

export interface AddressCode {
  provinceCode?: number;
  districtCode?: number;
  wardCode?: number;
}
