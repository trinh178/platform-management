import type { EmployeePreview } from '../types/employee';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import { EmptyAvatar } from '@/shared/components/ui/empty-avatar';

export default function EmployeeDeleteConfirmContent({
  employee,
}: {
  employee: Pick<
    EmployeePreview,
    'avatar' | 'employeeCode' | 'fullName' | 'contact'
  >;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
      <Avatar className="size-11">
        <AvatarImage src={employee.avatar} alt={employee.fullName} />
        <AvatarFallback>
          <EmptyAvatar />
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{employee.fullName}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span>{employee.employeeCode}</span>
          {employee.contact?.personalPhoneNumber && (
            <>
              <span className="text-border">|</span>
              <span>{employee.contact.personalPhoneNumber}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
