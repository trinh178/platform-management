/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { ChevronRight, CircleAlert } from 'lucide-react';
import { cn } from '../../lib/utils';
import Popup from './address-popup';
import type { Address, AddressCode, Province } from './types';
import { CONFIG, compareAddress, findAddress, normalizeAddress } from './utils';
import { Input } from '@/shared/components/ui/input';
import { Spinner } from '@/shared/components/ui/spinner';

export interface AddressPickerProps {
  defaultValue?: Address | AddressCode | null;
  value?: Address | AddressCode | null;
  onChange?: (
    value: Address | null,
    code: AddressCode | null,
    label: string,
  ) => void;
  placeholder?: string;
  inputClassName?: string;
  inputStyle?: React.CSSProperties;
  controlStyle?: React.CSSProperties;
  controlClassName?: string;
  formatAddressLabel?: (address: Address) => string;
  useCache?: boolean;
  onDefaultValueLoaded?: (value: Address | null, label: string) => void;
  disabled?: boolean;
  error?: boolean;
  readOnly?: boolean;
  popupOpen?: boolean;
  onPopupOpen?: (open: boolean) => void;
}

export default function AddressPicker(props: AddressPickerProps) {
  const isControlled = Object.prototype.hasOwnProperty.call(props, 'value');
  const {
    defaultValue,
    value,
    onChange,
    placeholder,
    inputClassName,
    inputStyle,
    controlStyle,
    controlClassName,
    formatAddressLabel,
    useCache = true,
    onDefaultValueLoaded,
    disabled,
    error,
    readOnly,
    popupOpen: popupOpenOutside,
    onPopupOpen: onPopupOpenOutside,
  } = props;
  // Fetch
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [isFetchError, setIsFetchError] = useState<boolean>(false);
  useEffect(() => {
    let isMounted = true;
    CONFIG.fetcher(useCache)
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
  }, [useCache]);

  // States
  const [address, setAddress] = useState<Address | null>(null);
  const [popupOpen, setPopupOpen] = useState<boolean>(false);

  // Change popupOpen outside
  React.useEffect(() => {
    React.startTransition(() => setPopupOpen(popupOpenOutside ?? false));
  }, [popupOpenOutside]);

  // Refs
  const defaultValueRef = useRef<Address | AddressCode | null | undefined>(
    defaultValue,
  );
  const addressRef = useRef<Address | null>(address);
  useEffect(() => {
    addressRef.current = address;
  }, [address]);

  // Handlers
  const getAddressLabel = useCallback(
    (a?: Address | null) => {
      return a
        ? formatAddressLabel
          ? formatAddressLabel(a)
          : CONFIG.defaultFormatAddressLabel(a)
        : '';
    },
    [formatAddressLabel],
  );
  const handleSetAddress = useCallback(
    (value?: Address | AddressCode | null, isDefaultValue?: boolean) => {
      if (_.isEmpty(provinces)) return;
      if (value === undefined) {
        if (isDefaultValue)
          onDefaultValueLoaded && onDefaultValueLoaded(null, '');
        else setAddress(null);
        return;
      }
      if (value === null) {
        if (isDefaultValue)
          onDefaultValueLoaded && onDefaultValueLoaded(null, '');
        setAddress(null);
        return;
      }
      if (compareAddress(value, addressRef.current)) return;
      const v = findAddress(provinces, value);
      setAddress(v);
      if (isDefaultValue)
        onDefaultValueLoaded && onDefaultValueLoaded(v, getAddressLabel(v));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [provinces, getAddressLabel],
  );

  // Effects
  useEffect(() => {
    handleSetAddress(defaultValueRef.current, true);
  }, [handleSetAddress]);
  useEffect(() => {
    if (!isControlled) return;

    React.startTransition(() => handleSetAddress(value));
  }, [handleSetAddress, isControlled, value]);

  return (
    <div>
      <div
        className={cn(
          'relative w-full',
          disabled && 'opacity-50 pointer-events-none',
          'h-9 border border-input rounded-md',
          {
            'border-destructive': error,
          },
          inputClassName,
        )}
      >
        <div className="relative h-full">
          <Input
            onClick={() => {
              if (_.isEmpty(provinces) || disabled || readOnly) return;
              setPopupOpen(true);
              onPopupOpenOutside?.(true);
            }}
            value={getAddressLabel(address)}
            placeholder={placeholder}
            className="focus-visible:ring-0 focus-visible:border-0 border-none shadow-none"
            style={inputStyle}
            type="text"
            disabled={disabled}
            readOnly={true}
          />
          {isFetchError ? (
            <CircleAlert
              className={cn(
                'absolute top-1/2 h-4 w-4 -translate-y-1/2',
                controlClassName,
              )}
              style={controlStyle ?? { right: '0.5rem' }}
            />
          ) : _.isEmpty(provinces) ? (
            <Spinner
              className={cn(
                'absolute top-1/2 h-4 w-4 -translate-y-1/2',
                controlClassName,
              )}
              style={controlStyle ?? { right: '0.5rem' }}
            />
          ) : (
            <ChevronRight
              className={cn(
                'absolute top-1/2 h-4 w-4 -translate-y-1/2',
                controlClassName,
              )}
              style={controlStyle ?? { right: '0.5rem' }}
            />
          )}
        </div>
      </div>

      <Popup
        provinces={provinces}
        open={popupOpen}
        onCancel={() => {
          setPopupOpen(false);
          onPopupOpenOutside?.(false);
        }}
        onOk={v => {
          setAddress(v);
          onChange && onChange(v, normalizeAddress(v), getAddressLabel(v));
          setPopupOpen(false);
          onPopupOpenOutside?.(false);
        }}
      />
    </div>
  );
}
