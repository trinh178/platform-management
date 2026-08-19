'use client';

import queryClient from '@/core/query/query-client';
import {
  useEmployeeMe,
  useEmployeePreviews,
} from '@/modules/employee/services/employee.queries';
import employeeKeys from '@/modules/employee/services/employee.query-keys';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { getFullName } from '@/shared/utils';

export default function MockUserSwitcher() {
  const { data: employeeMe } = useEmployeeMe(undefined);
  const { data: employees } = useEmployeePreviews({
    pageIndex: 0,
    pageSize: 50,
  });

  const handleSwitch = async (userId: string) => {
    // eslint-disable-next-line no-restricted-globals
    await fetch('/api/mock/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    queryClient.invalidateQueries({ queryKey: employeeKeys.me });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1.5 bg-background border border-border rounded-full px-3 py-1.5 shadow-md text-xs hover:bg-accent transition-colors">
            <span className="size-2 rounded-full bg-amber-400" />
            <span className="font-medium max-w-[120px] truncate">
              {employeeMe ? getFullName(employeeMe) : 'Mock User'}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" side="top" className="w-52 p-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 pb-1">
            Switch user
          </p>
          <div className="space-y-0.5">
            {employees?.items.map(emp => (
              <button
                key={emp.id}
                onClick={() => handleSwitch(emp.userId!)}
                className={`w-full text-left px-2 py-1.5 rounded text-xs hover:bg-accent transition-colors flex flex-col ${
                  employeeMe?.id === emp.id ? 'bg-primary/10 font-medium' : ''
                }`}
              >
                <span>{getFullName(emp)}</span>
                <span className="text-muted-foreground text-[10px]">
                  {emp.jobInfo?.jobPosition.name}
                </span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
