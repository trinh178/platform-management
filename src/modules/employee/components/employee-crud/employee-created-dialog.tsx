'use client';

import type { ReactNode } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  User,
  UserPlus,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { EmployeePreview } from '../../types/employee';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { EmptyAvatar } from '@/shared/components/ui/empty-avatar';
import { cn } from '@/shared/lib/utils';

export interface EmployeeCreatedDialogProps {
  employee: EmployeePreview;
  onAddOnboarding?: () => void;
  onCreateContract?: () => void;
  onViewEmployee?: () => void;
  onClose: () => void;
}

export default function EmployeeCreatedDialog({
  employee,
  onAddOnboarding,
  onCreateContract,
  onViewEmployee,
  onClose,
}: EmployeeCreatedDialogProps) {
  const t = useTranslations();
  const employeeName =
    employee.fullName || t('employee.createdDialog.defaultFullName');

  return (
    <Dialog open={true}>
      <DialogContent
        aria-describedby={undefined}
        className={cn('gap-0 overflow-hidden p-0 sm:max-w-xl')}
        showCloseButton={false}
      >
        <div className="border-b px-6 py-5">
          <DialogHeader className="flex-row items-start gap-3 space-y-0 text-left">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </span>

            <div className="min-w-0 space-y-1">
              <DialogTitle className="text-xl">
                {t('employee.createdDialog.title')}
              </DialogTitle>
              <DialogDescription>
                {t('employee.createdDialog.description')}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center gap-4 rounded-md border bg-muted/30 p-4">
            <Avatar className="size-12">
              <AvatarImage src={employee.avatar} alt={employeeName} />
              <AvatarFallback>
                <EmptyAvatar />
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{employeeName}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <span>{employee.employeeCode}</span>
                <span className="text-border">|</span>
                <span>{t('employee.createdDialog.summary')}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">
                {t('employee.createdDialog.nextAction.title')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('employee.createdDialog.nextAction.description')}
              </p>
            </div>

            <div className="grid gap-2">
              <NextActionButton
                icon={<UserPlus />}
                label={t('employee.createdDialog.nextAction.addOnboarding')}
                onClick={onAddOnboarding}
              />
              <NextActionButton
                icon={<FileText />}
                label={t('employee.createdDialog.nextAction.createContract')}
                onClick={onCreateContract}
              />
              <NextActionButton
                icon={<User />}
                label={t('employee.createdDialog.nextAction.viewEmployee')}
                onClick={onViewEmployee}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            {t('common.control.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NextActionButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="outline"
      className="h-auto w-full justify-between gap-4 px-4 py-3 text-left font-normal"
      disabled={!onClick}
      onClick={onClick}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary [&_svg]:size-4">
          {icon}
        </span>
        <span className="truncate font-medium">{label}</span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
    </Button>
  );
}
