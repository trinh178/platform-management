'use client';

import { useEffect, useState } from 'react';
import _ from 'lodash';
import type { Address, AddressCode, Province } from './types';
import { CONFIG, findAddress } from './utils';

export function useAddressLabel(
  addressCode: AddressCode,
  defaultLabel?: string,
  formatAddressLabel?: (address: Address) => string,
) {
  // Fetch
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [isFetchError, setIsFetchError] = useState<boolean>(false);
  useEffect(() => {
    let isMounted = true;
    CONFIG.fetcher(true)
      .then(provinces => {
        if (!isMounted) return;
        setProvinces(provinces);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error(err);
        setIsFetchError(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const [label, setLabel] = useState<string>(defaultLabel || '');

  useEffect(() => {
    if (isFetchError) return;
    if (_.isEmpty(provinces)) return;
    const a = findAddress(provinces, addressCode);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLabel(
      a
        ? formatAddressLabel
          ? formatAddressLabel(a)
          : CONFIG.defaultFormatAddressLabel(a)
        : defaultLabel || '',
    );
  }, [isFetchError, provinces, addressCode, formatAddressLabel, defaultLabel]);

  return label;
}
