'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import moment from 'moment';
import { DateRange, Matcher } from 'react-day-picker';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import { Input } from '@/shared/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { defaultFormatDate } from '@/shared/constants/date';
import { cn } from '@/shared/lib/utils';

interface DateRangePickerProps {
  value?: DateRange;
  defaultValue?: DateRange;
  placeholder?: string;
  separator?: string;
  onChange?: (value: DateRange | undefined) => void;
  readOnly?: boolean;
  isError?: boolean;
  className?: string;
  inputStyle?: React.CSSProperties;
  controlStyle?: React.CSSProperties;
  controlClassName?: string;
  openPopup?: boolean;
  onOpenPopup?: (open: boolean) => void;
  dateDisabled?: Matcher | Matcher[];
  disabled?: boolean;
  numberOfMonths?: number;
}

function formatRange(value: DateRange | undefined, separator: string): string {
  if (!value?.from && !value?.to) return '';
  const from = value.from ? moment(value.from).format(defaultFormatDate) : '…';
  const to = value.to ? moment(value.to).format(defaultFormatDate) : '…';
  return `${from} ${separator} ${to}`;
}

export function DateRangePicker({
  value,
  placeholder,
  separator = '→',
  onChange,
  readOnly,
  isError,
  className,
  inputStyle,
  controlStyle,
  controlClassName,
  openPopup,
  onOpenPopup,
  dateDisabled,
  disabled,
  numberOfMonths = 2,
}: DateRangePickerProps) {
  const isControlled = openPopup !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(value?.from);

  // Dùng controlled state nếu openPopup được truyền vào, ngược lại dùng internal state
  const open = isControlled ? openPopup : internalOpen;

  const handleOpenChange = (o: boolean) => {
    if (!isControlled) {
      setInternalOpen(o);
    }
    onOpenPopup?.(o);
  };

  return (
    <div
      className={cn(
        'h-9 border border-input rounded-md',
        {
          'border-destructive': isError,
        },
        className,
      )}
    >
      <div className="relative h-full">
        <Input
          value={formatRange(value, separator)}
          placeholder={placeholder}
          readOnly
          isError={isError}
          className="border-none shadow-none focus-visible:border-0 focus-visible:ring-0"
          style={inputStyle}
          disabled={disabled}
        />

        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="link"
              className={cn(
                'absolute top-1/2 h-4! w-4! -translate-y-1/2',
                controlClassName,
              )}
              style={controlStyle ?? { right: '0.5rem' }}
              size="icon-sm"
              disabled={readOnly || disabled}
              type="button"
            >
              <CalendarIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="range"
              selected={value}
              month={month}
              onMonthChange={setMonth}
              onSelect={range => {
                onChange?.(range);
                if (range?.from && range?.to) {
                  handleOpenChange(false);
                }
              }}
              disabled={dateDisabled}
              numberOfMonths={numberOfMonths}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
