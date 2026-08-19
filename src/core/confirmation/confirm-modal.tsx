'use client';

import type { ComponentProps } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib/utils';

export type ConfirmVariant = 'default' | 'danger' | 'warning' | 'success';
type ButtonVariant = ComponentProps<typeof Button>['variant'];

export interface ConfirmModalProps {
  open: boolean;

  title?: string;
  description?: string;
  content?: ReactNode;

  confirmText?: string;
  cancelText?: string;

  variant?: ConfirmVariant;

  loading?: boolean;

  onConfirm?: () => void;
  onCancel?: () => void;
}

const variantConfig = {
  default: {
    icon: Info,
    iconClassName:
      'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300',
    panelClassName: 'border-blue-200/70 bg-blue-50/40 dark:border-blue-900',
    confirmVariant: 'default' satisfies ButtonVariant,
  },

  danger: {
    icon: Trash2,
    iconClassName:
      'border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive/40',
    panelClassName:
      'border-destructive/30 bg-destructive/5 dark:border-destructive/40',
    confirmVariant: 'destructive' satisfies ButtonVariant,
  },

  warning: {
    icon: AlertTriangle,
    iconClassName:
      'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
    panelClassName: 'border-amber-200/70 bg-amber-50/40 dark:border-amber-900',
    confirmVariant: 'default' satisfies ButtonVariant,
  },

  success: {
    icon: CheckCircle2,
    iconClassName:
      'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
    panelClassName:
      'border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-900',
    confirmVariant: 'default' satisfies ButtonVariant,
  },
} as const satisfies Record<
  ConfirmVariant,
  {
    icon: typeof Info;
    iconClassName: string;
    panelClassName: string;
    confirmVariant: ButtonVariant;
  }
>;

export function ConfirmModal({
  open,

  title = 'Xác nhận hành động',
  description = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  content,

  confirmText = 'Xác nhận',
  cancelText = 'Huỷ',

  variant = 'default',

  loading,

  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={v => !v && onCancel?.()}>
      <DialogContent
        aria-describedby={undefined}
        className="gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        <div
          className={cn('flex gap-4 border-b px-6 py-5', config.panelClassName)}
        >
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-full border',
              config.iconClassName,
            )}
          >
            <Icon className="size-5" />
          </span>

          <DialogHeader className="min-w-0 gap-1 text-left">
            <DialogTitle className="text-lg leading-6">{title}</DialogTitle>

            <DialogDescription className="leading-5">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {content && <div className="px-6 py-5">{content}</div>}

        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>

          <Button
            variant={config.confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
