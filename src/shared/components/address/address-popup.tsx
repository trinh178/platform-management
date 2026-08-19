/* eslint-disable react-hooks/set-state-in-render */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { ChevronRight, Eraser, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Spinner } from '../ui/spinner';
import type { Address, District, Province, Ward } from './types';
import {
  formatSelectorContentDistricts,
  formatSelectorContentProvinces,
  formatSelectorContentWards,
  groupSelectorContent,
  searchByKey,
} from './utils';

interface PopupProps {
  provinces: Province[];
  open: boolean;
  onCancel: () => void;
  onOk: (v: Address) => void;
}
export default function Popup({ provinces, open, onCancel, onOk }: PopupProps) {
  const t = useTranslations('components.address_picker');

  // States
  const [currentSelect, setCurrentSelect] = useState<
    'PROVINCE' | 'DISTRICT' | 'WARD'
  >('PROVINCE');
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null,
  );
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null,
  );
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [searchKey, setSearchKey] = useState<string>('');

  // Refs
  const selectorRef = useRef<HTMLDivElement>(null);

  // Groups
  const provinceGroup = useMemo(() => {
    const g = groupSelectorContent(
      formatSelectorContentProvinces(
        provinces.filter(p => searchByKey(p.provinceName || '', searchKey)),
      ),
    );
    setCurrentSelect('PROVINCE');
    return g;
  }, [provinces, searchKey]);
  const districtGroup = useMemo(() => {
    if (selectedProvince === null) return [];
    const g = groupSelectorContent(
      formatSelectorContentDistricts(
        (selectedProvince?.districts || []).filter(d =>
          searchByKey(d.districtName || '', searchKey),
        ),
      ),
    );
    setCurrentSelect('DISTRICT');
    return g;
  }, [selectedProvince, searchKey]);
  const wardGroup = useMemo(() => {
    if (selectedDistrict === null) return [];
    const g = groupSelectorContent(
      formatSelectorContentWards(
        (selectedDistrict?.wards || []).filter(w =>
          searchByKey(w.wardName || '', searchKey),
        ),
      ),
    );
    setCurrentSelect('WARD');
    return g;
  }, [selectedDistrict, searchKey]);

  // Handlers
  const reset = () => {
    setSelectedWard(null);
    setSelectedDistrict(null);
    setSelectedProvince(null);
    setCurrentSelect('PROVINCE');
    setSearchKey('');
  };

  // Effects
  useEffect(() => {
    React.startTransition(() => reset());
  }, [open]);
  useEffect(() => {
    if (!selectorRef.current) return;
    selectorRef.current.scrollTop = 0;
  }, [currentSelect]);

  return (
    <Dialog open={open} onOpenChange={open => !open && onCancel}>
      <DialogContent showCloseButton={false} aria-describedby="address">
        <DialogHeader className="">
          <DialogTitle>{`${t('select')} ${
            currentSelect === 'PROVINCE'
              ? t('province')
              : currentSelect === 'DISTRICT'
                ? t('district')
                : t('ward')
          }`}</DialogTitle>
        </DialogHeader>
        <div>
          <div className="relative">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="bg-background pl-9"
              type="search"
              placeholder={`${t('find')} ${
                currentSelect === 'PROVINCE'
                  ? t('province')
                  : currentSelect === 'DISTRICT'
                    ? t('district')
                    : t('ward')
              }`}
              value={searchKey}
              onChange={e => {
                setSearchKey(e.target.value);
                if (currentSelect === 'WARD') setSelectedWard(null);
              }}
            />
          </div>

          <div
            className="mt-2 h-52 w-full border rounded-md overflow-x-hidden overflow-y-auto p-2"
            ref={selectorRef}
          >
            <div className="w-full animate-slideLeft" key={currentSelect}>
              {_.isEmpty(provinces) ? (
                <div className="w-full flex justify-center">
                  <Spinner />
                </div>
              ) : selectedDistrict !== null ? (
                wardGroup.map(g => (
                  <React.Fragment key={g.letter}>
                    <SelectorLetter>{g.letter}</SelectorLetter>
                    {g.values.map(v => (
                      <SelectorItem
                        key={`${v.wardCode} ward_code`}
                        onClick={() => {
                          setSelectedWard(v);
                        }}
                        selected={v === selectedWard}
                      >
                        {v.wardName}
                      </SelectorItem>
                    ))}
                  </React.Fragment>
                ))
              ) : selectedProvince !== null ? (
                districtGroup.map(g => (
                  <React.Fragment key={g.letter}>
                    <SelectorLetter>{g.letter}</SelectorLetter>
                    {g.values.map(v => (
                      <SelectorItem
                        key={`${v.districtCode} district_code`}
                        onClick={() => {
                          setSelectedDistrict(v);
                          setSearchKey('');
                        }}
                        selected={v === selectedDistrict}
                      >
                        {v.districtName}
                      </SelectorItem>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                provinceGroup.map(g => (
                  <React.Fragment key={g.letter}>
                    <SelectorLetter>{g.letter}</SelectorLetter>
                    {g.values.map(v => (
                      <SelectorItem
                        key={`${v.provinceCode} province_code`}
                        onClick={() => {
                          setSelectedProvince(v);
                          setSearchKey('');
                        }}
                        selected={v === selectedProvince}
                      >
                        {v.provinceName}
                      </SelectorItem>
                    ))}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center border rounded-md px-4 py-1 pe-1">
            <div className="flex gap-2 items-center flex-wrap">
              <div
                className={cn({
                  'font-semibold': currentSelect === 'PROVINCE',
                })}
              >
                {selectedProvince?.provinceName || t('province')}
              </div>
              <ChevronRight size="16" />
              <div
                className={cn({
                  'font-semibold': currentSelect === 'DISTRICT',
                })}
              >
                {selectedDistrict?.districtName || t('district')}
              </div>
              <ChevronRight size="16" />
              <div
                className={cn({
                  'font-semibold': currentSelect === 'WARD',
                })}
              >
                {selectedWard?.wardName || t('ward')}
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => {
                reset();
              }}
              size="sm"
            >
              <Eraser />
            </Button>
          </div>

          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={
                selectedProvince === null ||
                selectedDistrict === null ||
                selectedWard === null
              }
              onClick={() =>
                onOk({
                  province: selectedProvince,
                  district: selectedDistrict,
                  ward: selectedWard,
                  street: '',
                })
              }
              className="w-24"
            >
              {t('btn_ok')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => onCancel()}
              className="w-24"
            >
              {t('btn_cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Animations
// const slideLeft = keyframes`
//   from {
//     -webkit-transform: translateX(100%);
//             transform: translateX(100%);
//   }

//   to {
//     -webkit-transform: translateX(0);
//             transform: translateX(0);
//   }
// `;
// const scaleUpCenter = keyframes`
//   0% {
//     -webkit-transform: scale(0.95);
//             transform: scale(0.95);
//   }
//   50% {
//     -webkit-transform: scale(1.05);
//             transform: scale(1.05);
//   }
//   100% {
//     -webkit-transform: scale(1);
//             transform: scale(1);
//   }
// `;

// Styles

const SelectorLetter = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => (
  <div {...props} className={cn('w-full font-bold px-2 py-1', className)} />
);

const SelectorItem = ({
  selected,
  className,
  ...props
}: React.ComponentProps<'button'> & {
  selected?: boolean;
}) => (
  <Button
    {...props}
    className={cn('w-full justify-start px-2', className)}
    variant={selected ? 'secondary' : 'ghost'}
  />
);
