/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';
import location from './location.json';
import type { Address, AddressCode, District, Province, Ward } from './types';
export const CONFIG: {
  fetcher: (useCache?: boolean) => Promise<Province[]>;
  defaultFormatAddressLabel: (address: Address) => string;
} = {
  fetcher: async (useCache?: boolean) => {
    return location as Province[];
    // if (useCache) {
    //   const expiryTime = Number.parseInt(
    //     localStorage.getItem('__address_picker_provinces_expiry') || '0',
    //   );
    //   if (expiryTime > new Date().getTime()) {
    //     const provinces: Province[] = JSON.parse(
    //       localStorage.getItem('__address_picker_provinces') || '[]',
    //     );
    //     if (provinces.length > 0) return provinces;
    //   }
    // }

    // const locationAll = await locationApi.all();

    // if (useCache) {
    //   localStorage.setItem(
    //     '__address_picker_provinces',
    //     JSON.stringify(locationAll),
    //   );
    //   const expiryDate = new Date(new Date().getTime() + 60000);
    //   console.log('expiryDate', expiryDate);
    //   localStorage.setItem(
    //     '__address_picker_provinces_expiry',
    //     expiryDate.getTime().toString(),
    //   );
    // }

    // return locationAll;
  },
  defaultFormatAddressLabel: (address: Address) =>
    `${address.street ? address.street + ', ' : ''}${
      address.ward?.wardName ? address.ward?.wardName + ', ' : ''
    }${
      address.district?.districtName
        ? address.district?.districtName + ', '
        : ''
    }${address.province?.provinceName || ''}`,
};

export function normalizeAddress(address?: Address | AddressCode | null) {
  if (!address) return null;
  if ((address as AddressCode)?.provinceCode) return address as AddressCode;
  return {
    provinceCode: (address as Address).province?.provinceCode,
    districtCode: (address as Address).district?.districtCode,
    wardCode: (address as Address).ward?.wardCode,
  } as AddressCode;
}

export function compareAddress(
  address1?: Address | AddressCode | null,
  address2?: Address | AddressCode | null,
) {
  if (address1 === address2) return true;
  const a1 = normalizeAddress(address1);
  const a2 = normalizeAddress(address2);
  return (
    a1?.provinceCode === a2?.provinceCode &&
    a1?.districtCode === a2?.districtCode &&
    a1?.wardCode === a2?.wardCode
  );
}

export function findAddress(
  provinces: Province[],
  address?: Address | AddressCode | null,
) {
  const a = normalizeAddress(address);
  // if (!a?.province_code || !a?.district_code || !a?.ward_code) return null;
  const province = provinces.find(p => p.provinceCode === a?.provinceCode);
  if (!province?.districts) return null;

  const district = province.districts.find(
    d => d.districtCode === a?.districtCode,
  );
  if (!district?.wards)
    return {
      province,
      district: null,
      ward: null,
      street: '',
    } as Address;

  const ward = district.wards.find(w => w.wardCode === a?.wardCode);
  if (!ward)
    return {
      province,
      district,
      ward: null,
      street: '',
    } as Address;

  return {
    province,
    district,
    ward,
    street: '',
  } as Address;
}

export function getAddressLabel(address?: Address | null) {
  if (!address) return '-';
  return CONFIG.defaultFormatAddressLabel(address);
}

interface SelectorContentProps<T = Province | District | Ward> {
  letter: string;
  label: string;
  value: T;
}

interface SelectorContentGroup<T = Province | District | Ward> {
  letter: string;
  values: T[];
}

export function formatSelectorContentProvinces(provinces: Province[]) {
  return (
    provinces
      // .filter(p => p.provinceCode !== 'KXD')
      .map(
        p =>
          ({
            letter: p.provinceName?.trim().slice(0, 1) || '0',
            label: p.provinceName?.trim() || '0',
            value: p,
          }) as SelectorContentProps<Province>,
      )
  );
}

export function formatSelectorContentDistricts(districts: District[]) {
  return districts.map(
    d =>
      ({
        letter: d.districtName?.trim().slice(0, 1) || '0',
        label: d.districtName?.trim() || '0',
        value: d,
      }) as SelectorContentProps<District>,
  );
}

export function formatSelectorContentWards(wards: Ward[]) {
  return wards.map(
    w =>
      ({
        letter: w.wardName?.trim().slice(0, 1) || '0',
        label: w.wardName?.trim() || '0',
        value: w,
      }) as SelectorContentProps<Ward>,
  );
}

export function groupSelectorContent<T>(
  selectorContents: SelectorContentProps<T>[],
) {
  const group: Record<string, T[]> = {};
  for (const sc of selectorContents) {
    if (group[sc.letter]) {
      group[sc.letter].push(sc.value);
    } else {
      group[sc.letter] = [sc.value];
    }
  }
  return (
    Object.keys(group).map(k => ({
      letter: k,
      values: group[k],
    })) as SelectorContentGroup<T>[]
  ).sort((a, b) => a.letter.localeCompare(b.letter));
}

// Searching
function nonAccentVietnamese(str = ''): string {
  if (str === '' || !str) return '';
  str = str.toLowerCase();
  // str = str.replace(/\u00E0|\u00E1|\u1EA1|\u1EA3|\u00E3|\u00E2|\u1EA7|\u1EA5|\u1EAD|\u1EA9|\u1EAB|\u0103|\u1EB1|\u1EAF|\u1EB7|\u1EB3|\u1EB5/g, "a");
  // str = str.replace(/\u00E8|\u00E9|\u1EB9|\u1EBB|\u1EBD|\u00EA|\u1EC1|\u1EBF|\u1EC7|\u1EC3|\u1EC5/g, "e");
  // str = str.replace(/\u00EC|\u00ED|\u1ECB|\u1EC9|\u0129/g, "i");
  // str = str.replace(/\u00F2|\u00F3|\u1ECD|\u1ECF|\u00F5|\u00F4|\u1ED3|\u1ED1|\u1ED9|\u1ED5|\u1ED7|\u01A1|\u1EDD|\u1EDB|\u1EE3|\u1EDF|\u1EE1/g, "o");
  // str = str.replace(/\u00F9|\u00FA|\u1EE5|\u1EE7|\u0169|\u01B0|\u1EEB|\u1EE9|\u1EF1|\u1EED|\u1EEF/g, "u");
  // str = str.replace(/\u1EF3|\u00FD|\u1EF5|\u1EF7|\u1EF9/g, "y");
  // str = str.replace(/\u0111/g, "d");
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // Â, Ê, Ă, Ơ, Ư
  return str;
}
export function searchVNEntity(multi: string, keyword: string): number {
  return nonAccentVietnamese(multi).indexOf(nonAccentVietnamese(keyword));
}
export function searchByKey(
  current: string,
  next: string,
): boolean | undefined {
  return searchVNEntity(!_.isNil(current) ? current : '', next) >= 0;
}
