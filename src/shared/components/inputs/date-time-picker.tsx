'use client';

import * as React from 'react';
import { CalendarIcon, Clock3Icon } from 'lucide-react';
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
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { defaultFormatDate } from '@/shared/constants/date';
import { cn } from '@/shared/lib/utils';

export interface DateTimePickerLabels {
  hour?: string;
  minute?: string;
  now?: string;
  done?: string;
}

interface DateTimePickerProps {
  value?: Date;
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
  /** Minute step for the minute column. Default `1`. */
  minuteStep?: number;
  /** Override built-in English labels (the form wrapper passes localized text). */
  labels?: DateTimePickerLabels;
}

const DEFAULT_LABELS: Required<DateTimePickerLabels> = {
  hour: 'Hr',
  minute: 'Min',
  now: 'Now',
  done: 'Done',
};

const HOURS = Array.from({ length: 24 }, (_, index) => index);

function pad2(value: number) {
  return value.toString().padStart(2, '0');
}

function formatDateTime(value?: Date) {
  return value ? moment(value).format(`${defaultFormatDate} HH:mm`) : '';
}

/** Apply an hour/minute onto `base` (or today when there is no date yet). */
function setTimeOnDate(base: Date | undefined, hour: number, minute: number) {
  const next = base ? new Date(base) : new Date();
  next.setHours(hour, minute, 0, 0);
  return next;
}

/** Center the selected time button inside its scroll viewport without scrolling the page. */
function centerInViewport(button: HTMLButtonElement | null) {
  if (!button) return;
  const viewport = button.closest<HTMLElement>(
    '[data-slot=scroll-area-viewport]',
  );
  if (!viewport) return;

  const buttonRect = button.getBoundingClientRect();
  const viewportRect = viewport.getBoundingClientRect();
  viewport.scrollTop +=
    buttonRect.top -
    viewportRect.top -
    (viewportRect.height - buttonRect.height) / 2;
}

export function DateTimePicker({
  value,
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
  minuteStep = 1,
  labels,
}: DateTimePickerProps) {
  const text = { ...DEFAULT_LABELS, ...labels };

  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(value);
  const [bodyHeight, setBodyHeight] = React.useState<number>();
  // Bumped to re-center the time columns after a programmatic jump (e.g. "Now").
  const [scrollTick, setScrollTick] = React.useState(0);

  const calendarRef = React.useRef<HTMLDivElement>(null);
  const selectedHourRef = React.useRef<HTMLButtonElement>(null);
  const selectedMinuteRef = React.useRef<HTMLButtonElement>(null);

  const selectedHour = value?.getHours();
  const selectedMinute = value?.getMinutes();

  const minutes = React.useMemo(() => {
    const step = Math.max(1, Math.floor(minuteStep));
    const list = Array.from(
      { length: Math.ceil(60 / step) },
      (_, i) => i * step,
    );
    // Keep an out-of-step current minute visible/selectable (e.g. 37 with step 5).
    if (selectedMinute !== undefined && !list.includes(selectedMinute)) {
      list.push(selectedMinute);
      list.sort((a, b) => a - b);
    }
    return list;
  }, [minuteStep, selectedMinute]);

  React.useEffect(() => {
    React.startTransition(() => setOpen(openPopup ?? false));
  }, [openPopup]);

  React.useEffect(() => {
    if (value) React.startTransition(() => setMonth(value));
  }, [value]);

  // Scroll the current hour/minute into view when the popover opens or after a
  // programmatic jump ("Now").
  React.useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      centerInViewport(selectedHourRef.current);
      centerInViewport(selectedMinuteRef.current);
    });
    return () => cancelAnimationFrame(frame);
  }, [open, scrollTick]);

  // Match the time columns to the calendar height so the popover never grows to
  // the full (24 + 60) list height. ResizeObserver keeps it in sync across month
  // changes (5 vs 6 week grids).
  React.useEffect(() => {
    if (!open) return;
    const element = calendarRef.current;
    if (!element) return;

    const update = () => setBodyHeight(element.offsetHeight);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [open]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    onOpenPopup?.(nextOpen);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange?.(undefined);
      return;
    }
    onChange?.(setTimeOnDate(date, selectedHour ?? 0, selectedMinute ?? 0));
  };

  const handleHourSelect = (hour: number) => {
    onChange?.(setTimeOnDate(value, hour, selectedMinute ?? 0));
  };

  const handleMinuteSelect = (minute: number) => {
    onChange?.(setTimeOnDate(value, selectedHour ?? 0, minute));
  };

  const handleNow = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    setMonth(now);
    onChange?.(now);
    setScrollTick(tick => tick + 1);
  };

  const openIfInteractive = () => {
    if (readOnly || disabled) return;
    handleOpenChange(true);
  };

  return (
    <div
      className={cn(
        'h-9 rounded-md border border-input',
        {
          'border-destructive': isError,
        },
        className,
      )}
    >
      <div className="relative h-full">
        <Input
          value={formatDateTime(value)}
          placeholder={placeholder}
          readOnly
          isError={isError}
          onClick={openIfInteractive}
          className={cn(
            'border-none shadow-none focus-visible:border-0 focus-visible:ring-0',
            !readOnly && !disabled && 'cursor-pointer',
          )}
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
            <div className="flex items-start">
              <div ref={calendarRef}>
                <Calendar
                  mode="single"
                  selected={value}
                  month={month}
                  onMonthChange={setMonth}
                  onSelect={handleDateSelect}
                  disabled={dateDisabled}
                  captionLayout="dropdown"
                />
              </div>

              <div
                className="flex h-72 border-l"
                style={bodyHeight ? { height: bodyHeight } : undefined}
              >
                <TimeColumn
                  label={text.hour}
                  values={HOURS}
                  selected={selectedHour}
                  selectedRef={selectedHourRef}
                  disabled={readOnly || disabled}
                  onSelect={handleHourSelect}
                />
                <TimeColumn
                  label={text.minute}
                  values={minutes}
                  selected={selectedMinute}
                  selectedRef={selectedMinuteRef}
                  disabled={readOnly || disabled}
                  onSelect={handleMinuteSelect}
                  className="border-l"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={handleNow}
                disabled={readOnly || disabled}
              >
                <Clock3Icon />
                {text.now}
              </Button>
              <Button
                size="sm"
                type="button"
                onClick={() => handleOpenChange(false)}
              >
                {text.done}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

interface TimeColumnProps {
  label: string;
  values: number[];
  selected?: number;
  selectedRef: React.RefObject<HTMLButtonElement | null>;
  disabled?: boolean;
  onSelect: (value: number) => void;
  className?: string;
}

function TimeColumn({
  label,
  values,
  selected,
  selectedRef,
  disabled,
  onSelect,
  className,
}: TimeColumnProps) {
  return (
    <div className={cn('flex h-full w-14 flex-col', className)}>
      <div className="border-b py-1.5 text-center text-xs font-medium text-muted-foreground">
        {label}
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-0.5 p-1.5">
          {values.map(item => {
            const isSelected = item === selected;
            return (
              <Button
                key={item}
                ref={isSelected ? selectedRef : undefined}
                variant={isSelected ? 'default' : 'ghost'}
                size="sm"
                type="button"
                disabled={disabled}
                className="h-8 justify-center tabular-nums"
                onClick={() => onSelect(item)}
              >
                {pad2(item)}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
