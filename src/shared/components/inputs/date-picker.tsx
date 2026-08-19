'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import moment from 'moment';
import { Matcher } from 'react-day-picker';
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

interface DatePickerProps {
  value?: Date;
  defaultValue?: Date;
  placeholder?: string;
  onChange?: (value: Date | undefined) => void;
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
}

export function DatePicker({
  value,
  // defaultValue,
  placeholder,
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
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(value);

  React.useEffect(() => {
    React.startTransition(() => setOpen(openPopup ?? false));
  }, [openPopup]);

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
          value={(value && moment(value).format(defaultFormatDate)) ?? ''}
          placeholder={placeholder}
          readOnly
          isError={isError}
          className="border-none shadow-none focus-visible:border-0 focus-visible:ring-0"
          style={inputStyle}
          disabled={disabled}
        />

        <Popover
          open={open}
          onOpenChange={o => {
            setOpen(o);
            onOpenPopup?.(o);
          }}
        >
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
              mode="single"
              selected={value}
              month={month}
              onMonthChange={setMonth}
              onSelect={date => {
                // setDate(date);
                // set_Value(formatDate(date));
                setOpen(false);
                onOpenPopup?.(false);
                onChange?.(date);
              }}
              disabled={dateDisabled}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
