'use client';

import React from 'react';
import { Download, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  CONST_DEMO_EMPLOYEE_JOB_LEVEL,
  CONST_DEMO_EMPLOYEE_STATUS,
  DEFAULT_LIST_REQUEST,
  DemoEmployee,
  MOCK_EMPLOYEES,
  useMockEmployeeList,
} from './sample-data';
import { constGet } from '@/core/constants';
import { gT } from '@/core/i18n';
import { TranslationsKey } from '@/core/i18n/types';
import PageContentHeader from '@/core/layout/page-content-header';
import {
  DataTablePlain,
  PlainTableColumnDef,
} from '@/shared/components/data-table/plain';
import { DataTableServer } from '@/shared/components/data-table/server';
import {
  createActionsColumn,
  createDateColumn,
  createSelectColumn,
  createStatusColumn,
  createTickColumn,
  getColumnHelper,
} from '@/shared/components/data-table/shared/column-utils';
import {
  DataTableFilterField,
  DataTableFilterOptions,
} from '@/shared/components/data-table/shared/data-table-filter';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/shared/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { ListRequest } from '@/shared/types/pagination';

// ─── Module-level column definitions ─────────────────────────────────────────

const h = getColumnHelper<DemoEmployee>();

const PLAYGROUND_COLUMNS = [
  createSelectColumn<DemoEmployee>(),

  h.accessor('code', {
    header: 'datatableGuide.field.code' satisfies TranslationsKey,
  }),

  h.accessor('fullName', {
    header: 'datatableGuide.field.fullName' satisfies TranslationsKey,
    meta: { sticky: 'left' },
  }),

  h.accessor('manager.fullName', {
    // Đặt id tường minh: TanStack mặc định đổi 'manager.fullName' → 'manager_fullName',
    // sẽ không khớp filter field id (dispatcher bind theo column id).
    id: 'manager.fullName',
    header: 'datatableGuide.field.managerName' satisfies TranslationsKey,
  }),

  h.accessor('jobLevel', {
    header: 'datatableGuide.field.jobLevel' satisfies TranslationsKey,
    cell: c =>
      gT(
        constGet(
          CONST_DEMO_EMPLOYEE_JOB_LEVEL,
          c.getValue(),
          'label',
        ) as TranslationsKey,
      ),
  }),

  createStatusColumn<DemoEmployee>({
    accessor: 'status',
    header: 'datatableGuide.field.status',
    status: row =>
      gT(
        constGet(
          CONST_DEMO_EMPLOYEE_STATUS,
          row.original.status,
          'label',
        ) as TranslationsKey,
      ),
    statusClassName: row => {
      switch (row.original.status) {
        case 'Active':
          return 'text-green-600 border-green-600';
        case 'Inactive':
          return 'text-gray-500 border-gray-500';
        case 'OnLeave':
          return 'text-yellow-600 border-yellow-600';
      }
    },
  }),

  createDateColumn<DemoEmployee>({
    accessor: 'hireDate',
    header: 'datatableGuide.field.hireDate',
  }),

  createTickColumn<DemoEmployee>({
    accessor: 'isActive',
    header: 'datatableGuide.field.isActive',
  }),

  createActionsColumn<DemoEmployee>(row => (
    <>
      <DropdownMenuItem onClick={() => alert(`View ${row.original.fullName}`)}>
        Xem chi tiết
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => alert(`Edit ${row.original.fullName}`)}>
        Sửa
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        variant="destructive"
        onClick={() => alert(`Delete ${row.original.fullName}`)}
      >
        Xóa
      </DropdownMenuItem>
    </>
  )),
];

const FILTER_FIELDS: DataTableFilterField[] = [
  {
    id: 'status',
    type: 'enum',
    title: 'datatableGuide.field.status' satisfies TranslationsKey,
    options: CONST_DEMO_EMPLOYEE_STATUS.map(c => ({
      label: c.label,
      value: c.value,
    })),
  },
  {
    id: 'jobLevel',
    type: 'enum',
    title: 'datatableGuide.field.jobLevel' satisfies TranslationsKey,
    options: CONST_DEMO_EMPLOYEE_JOB_LEVEL.map(c => ({
      label: c.label,
      value: c.value,
    })),
  },
  {
    id: 'code',
    type: 'text',
    title: 'datatableGuide.field.code' satisfies TranslationsKey,
  },
  {
    id: 'hireDate',
    type: 'dateRange',
    title: 'datatableGuide.field.hireDate' satisfies TranslationsKey,
  },
  {
    id: 'isActive',
    type: 'boolean',
    title: 'datatableGuide.field.isActive' satisfies TranslationsKey,
  },
  {
    id: 'manager.fullName',
    type: 'select',
    title: 'datatableGuide.field.managerName' satisfies TranslationsKey,
  },
];

// Mô phỏng options lấy từ 1 API multi-column (keyed theo field id).
const FILTER_OPTIONS: DataTableFilterOptions = {
  'manager.fullName': Array.from(
    new Set(MOCK_EMPLOYEES.map(e => e.manager.fullName)),
  ).map(name => ({ value: name, label: name })),
};

// ─── Plain demo data ──────────────────────────────────────────────────────────

const PLAIN_DEMO_DATA = MOCK_EMPLOYEES.slice(0, 6);

const PLAIN_USAGE_CODE = `import { DataTablePlain, PlainTableColumnDef } from '@/shared/components/data-table/plain';
import { TableCell, TableRow } from '@/shared/components/ui/table';

const columns: PlainTableColumnDef<Item>[] = [
  {
    key: 'name',
    header: t('field.name'),
    render: row => row.name,
  },
  {
    key: 'amount',
    header: t('field.amount'),
    align: 'right',
    render: row => formatCurrency(row.amount),
  },
  {
    key: 'action',
    header: '',
    align: 'center',
    render: (_, index) => (
      <Button size="sm" variant="ghost" onClick={() => remove(index)}>
        {t('common.control.delete')}
      </Button>
    ),
  },
];

<DataTablePlain
  columns={columns}
  data={items}
  isFetching={query.isFetching && !query.data}
  getRowKey={row => row.id}
  footer={
    <TableRow>
      <TableCell colSpan={2} className="text-right font-semibold">Tổng</TableCell>
      <TableCell className="text-right font-bold">{formatCurrency(total)}</TableCell>
      <TableCell />
    </TableRow>
  }
/>`;

const PLAIN_WHEN_CODE = `// ✅ Dùng DataTablePlain khi:
// • Sub-table nhúng trong form hoặc detail view
// • Data client-side nhỏ, không cần search/filter/pagination
// • Cần inline edit (input) hoặc action buttons trong cell
// • Cần footer row (tổng cộng, summary)

// ❌ KHÔNG dùng HTML <table> thuần — bao giờ cũng vậy
// ❌ KHÔNG dùng DataTableServer/Static cho sub-table nhỏ không cần toolbar

// Cột điều kiện — dùng push thay vì spread:
const columns: PlainTableColumnDef<Item>[] = [...baseColumns];
if (canDelete) {
  columns.push({
    key: 'action',
    header: t('common.label.action'),
    align: 'center',
    headerClassName: 'w-20',
    render: row => <Button onClick={() => del(row.id)}>Xóa</Button>,
  });
}`;

// ─── Catalog types ────────────────────────────────────────────────────────────

type FactoryRow = {
  factory: string;
  required: string;
  description: string;
  defaultMeta: string;
};

type MetaRow = {
  prop: string;
  type: string;
  description: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DataTableGuide() {
  const t = useTranslations('datatableGuide');
  const [listRequest, setListRequest] =
    React.useState<ListRequest>(DEFAULT_LIST_REQUEST);
  const [selectedRows, setSelectedRows] = React.useState<DemoEmployee[]>([]);
  const query = useMockEmployeeList(listRequest);

  const factoryRows = React.useMemo<FactoryRow[]>(
    () => [
      {
        factory: 'getColumnHelper<T>()',
        required: '—',
        description: t('catalog.helper.description'),
        defaultMeta: '—',
      },
      {
        factory: 'h.accessor(key, def)',
        required: 'accessor, header',
        description: t('catalog.accessor.description'),
        defaultMeta: '—',
      },
      {
        factory: 'createSelectColumn<T>()',
        required: '—',
        description: t('catalog.select.description'),
        defaultMeta: 'align: center, sticky: left',
      },
      {
        factory: 'createActionsColumn<T>(render?)',
        required: '—',
        description: t('catalog.actions.description'),
        defaultMeta: 'align: center, sticky: right',
      },
      {
        factory: 'createStatusColumn<T>({...})',
        required: 'accessor, header, status',
        description: t('catalog.status.description'),
        defaultMeta: '—',
      },
      {
        factory: 'createTickColumn<T>({...})',
        required: 'accessor, header',
        description: t('catalog.tick.description'),
        defaultMeta: 'align: center',
      },
      {
        factory: 'createDateColumn<T>({...})',
        required: 'accessor, header',
        description: t('catalog.date.description'),
        defaultMeta: '—',
      },
    ],
    [t],
  );

  const metaRows = React.useMemo<MetaRow[]>(
    () => [
      {
        prop: 'align',
        type: "'left' | 'center' | 'right'",
        description: t('meta.align'),
      },
      {
        prop: 'className',
        type: 'string',
        description: t('meta.className'),
      },
      {
        prop: 'headerClassName',
        type: 'string',
        description: t('meta.headerClassName'),
      },
      {
        prop: 'sticky',
        type: "'left' | 'right'",
        description: t('meta.sticky'),
      },
    ],
    [t],
  );

  const plainColumns = React.useMemo<PlainTableColumnDef<DemoEmployee>[]>(
    () => [
      {
        key: 'code',
        header: t('field.code'),
        render: row => <span className="font-mono text-xs">{row.code}</span>,
      },
      {
        key: 'fullName',
        header: t('field.fullName'),
        render: row => <span className="font-medium">{row.fullName}</span>,
      },
      {
        key: 'managerName',
        header: t('field.managerName'),
        render: row => row.manager.fullName,
      },
      {
        key: 'jobLevel',
        header: t('field.jobLevel'),
        render: row =>
          gT(
            constGet(
              CONST_DEMO_EMPLOYEE_JOB_LEVEL,
              row.jobLevel,
              'label',
            ) as TranslationsKey,
          ),
      },
      {
        key: 'isActive',
        header: t('field.isActive'),
        align: 'center',
        render: row => (
          <span
            className={
              row.isActive
                ? 'text-green-600 font-medium'
                : 'text-muted-foreground'
            }
          >
            {row.isActive ? '✓' : '—'}
          </span>
        ),
      },
      {
        key: 'action',
        header: '',
        align: 'center',
        headerClassName: 'w-20',
        render: row => (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => alert(`View ${row.fullName}`)}
          >
            Xem
          </Button>
        ),
      },
    ],
    [t],
  );

  const plainActiveCount = PLAIN_DEMO_DATA.filter(e => e.isActive).length;

  const listRequestJson = React.useMemo(
    () => JSON.stringify(listRequest, null, 2),
    [listRequest],
  );

  const selectedJson = React.useMemo(
    () =>
      selectedRows.length === 0
        ? '—'
        : JSON.stringify(
            selectedRows.map(r => ({
              id: r.id,
              code: r.code,
              fullName: r.fullName,
            })),
            null,
            2,
          ),
    [selectedRows],
  );

  return (
    <>
      <PageContentHeader title="datatableGuide.title" />

      <div className="flex flex-col gap-4">
        <div className="rounded-md border border-border bg-background px-4 py-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl font-semibold">{t('hero.title')}</h1>
              <p className="mt-1 max-w-4xl text-sm text-muted-foreground">
                {t('hero.description')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{t('hero.badgeLive')}</Badge>
              <Badge variant="outline">{t('hero.badgeServer')}</Badge>
              <Badge variant="outline">{t('hero.badgeSticky')}</Badge>
              <Badge variant="outline">{t('hero.badgePlain')}</Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="playground" className="gap-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="playground">{t('tabs.playground')}</TabsTrigger>
            <TabsTrigger value="catalog">{t('tabs.catalog')}</TabsTrigger>
            <TabsTrigger value="usage">{t('tabs.usage')}</TabsTrigger>
            <TabsTrigger value="plain">{t('tabs.plain')}</TabsTrigger>
          </TabsList>

          {/* ── Playground ─────────────────────────────────────────────────── */}
          <TabsContent value="playground">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <DataTableServer
                columns={PLAYGROUND_COLUMNS}
                isFetching={query.isFetching}
                listResponse={query.data}
                onChangeListRequest={setListRequest}
                initialListRequest={DEFAULT_LIST_REQUEST}
                searchPlaceholder={t('playground.search')}
                filterFields={FILTER_FIELDS}
                filterOptions={FILTER_OPTIONS}
                enableViewOptions
                enableMultiRowSelection
                onSelectedRowsChange={setSelectedRows}
                actionsRender={({ table, isLoading }) => {
                  const count = table.getSelectedRowModel().rows.length;
                  return (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Download />}
                        disabled={count === 0 || isLoading}
                        onClick={() => alert(`Export ${count} rows`)}
                      >
                        {t('playground.export')}
                        {count > 0 ? ` (${count})` : ''}
                      </Button>
                      <Button
                        size="sm"
                        icon={<Plus />}
                        onClick={() => alert('Create')}
                      >
                        {t('playground.create')}
                      </Button>
                    </div>
                  );
                }}
                onRowClick={row => console.log('Row clicked:', row)}
              />

              <aside className="rounded-md border border-border bg-muted/20 p-4">
                <h2 className="text-sm font-semibold">
                  {t('playground.stateTitle')}
                </h2>
                <div className="mt-3 space-y-3">
                  <div>
                    <div className="mb-1 text-xs font-medium text-muted-foreground">
                      {t('playground.listRequest')}
                    </div>
                    <pre className="max-h-[280px] overflow-auto rounded-md bg-background p-3 text-xs">
                      {listRequestJson}
                    </pre>
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-medium text-muted-foreground">
                      {t('playground.selectedRows')} ({selectedRows.length})
                    </div>
                    <pre className="max-h-[200px] overflow-auto rounded-md bg-background p-3 text-xs">
                      {selectedJson}
                    </pre>
                  </div>
                </div>
              </aside>
            </div>
          </TabsContent>

          {/* ── Catalog ────────────────────────────────────────────────────── */}
          <TabsContent value="catalog">
            <div className="space-y-6">
              <div>
                <h2 className="mb-3 text-sm font-semibold">
                  {t('catalogHeader.factory')}
                </h2>
                <div className="overflow-hidden rounded-md border border-border">
                  <div className="grid grid-cols-[220px_160px_minmax(0,1fr)_140px] bg-muted px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                    <div>{t('catalogHeader.factory')}</div>
                    <div>{t('catalogHeader.required')}</div>
                    <div>{t('catalogHeader.description')}</div>
                    <div>{t('catalogHeader.defaultMeta')}</div>
                  </div>
                  <div className="divide-y divide-border">
                    {factoryRows.map(row => (
                      <div
                        key={row.factory}
                        className="grid grid-cols-1 gap-2 px-3 py-3 text-sm md:grid-cols-[220px_160px_minmax(0,1fr)_140px]"
                      >
                        <div className="font-mono text-xs font-semibold">
                          {row.factory}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {row.required}
                        </div>
                        <div>{row.description}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {row.defaultMeta}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-sm font-semibold">Column meta</h2>
                <div className="overflow-hidden rounded-md border border-border">
                  <div className="grid grid-cols-[140px_200px_minmax(0,1fr)] bg-muted px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                    <div>{t('metaHeader.prop')}</div>
                    <div>{t('metaHeader.type')}</div>
                    <div>{t('metaHeader.description')}</div>
                  </div>
                  <div className="divide-y divide-border">
                    {metaRows.map(row => (
                      <div
                        key={row.prop}
                        className="grid grid-cols-1 gap-2 px-3 py-3 text-sm md:grid-cols-[140px_200px_minmax(0,1fr)]"
                      >
                        <div className="font-mono text-xs font-semibold">
                          {row.prop}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {row.type}
                        </div>
                        <div>{row.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Usage ──────────────────────────────────────────────────────── */}
          <TabsContent value="usage">
            <div className="grid gap-4 lg:grid-cols-2">
              <GuideBlock
                title={t('usage.server.title')}
                description={t('usage.server.description')}
                code={`const DEFAULT_REQUEST: ListRequest = {
  ...defaultListRequest,
  sorts: [{ field: 'createdOnUtc', direction: 'Descending' }],
};

const [listRequest, setListRequest] = useState(DEFAULT_REQUEST);
const employees = useEmployees(listRequest, {
  placeholderData: prev => prev,
});

<DataTableServer
  columns={columns}
  isFetching={employees.isFetching}
  error={employees.error}
  listResponse={employees.data}
  onChangeListRequest={setListRequest}
  initialListRequest={DEFAULT_REQUEST}
  searchPlaceholder={t('employee.control.search')}
  filterFields={filterFields}
  enableViewOptions
/>`}
              />

              <GuideBlock
                title={t('usage.client.title')}
                description={t('usage.client.description')}
                code={`import { DataTableStatic } from '@/shared/components/data-table/static';

// Minimal — no toolbar
<DataTableStatic columns={columns} data={items} />

// Full-featured client-side
<DataTableStatic
  columns={columns}
  data={items}
  searchPlaceholder={t('employee.control.search')}
  filterFields={filterFields}
  enablePagination
  enableViewOptions
/>`}
              />

              <GuideBlock
                title={t('usage.columns.title')}
                description={t('usage.columns.description')}
                code={`import {
  getColumnHelper,
  createSelectColumn,
  createActionsColumn,
} from '@/shared/components/data-table/shared/column-utils';

const h = getColumnHelper<EmployeePreview>();

export const columns = [
  createSelectColumn<EmployeePreview>(),

  h.accessor('code', {
    header: 'employee.field.code' satisfies TranslationsKey,
  }),

  h.accessor('manager.fullName', {           // nested path
    header: 'employee.field.managerName' satisfies TranslationsKey,
  }),

  h.accessor('jobLevel', {                   // custom cell
    header: 'employee.field.jobLevel' satisfies TranslationsKey,
    cell: c => gT(constGet(CONST_JOB_LEVEL, c.getValue(), 'label')),
  }),

  createActionsColumn<EmployeePreview>(),
];`}
              />

              <GuideBlock
                title={t('usage.factories.title')}
                description={t('usage.factories.description')}
                code={`createStatusColumn<EmployeePreview>({
  accessor: 'status',
  header: 'employee.field.status',
  status: row =>
    gT(constGet(CONST_STATUS, row.original.status, 'label')),
  statusClassName: row => {             // optional custom colors
    switch (row.original.status) {
      case 'Active':   return 'text-green-600 border-green-600';
      case 'Inactive': return 'text-gray-500 border-gray-500';
      case 'OnLeave':  return 'text-yellow-600 border-yellow-600';
    }
  },
});

createTickColumn<EmployeePreview>({
  accessor: 'isActive',
  header: 'employee.field.isActive',
});

createDateColumn<EmployeePreview>({
  accessor: 'hireDate',
  header: 'employee.field.hireDate',
});`}
              />

              <GuideBlock
                title={t('usage.filters.title')}
                description={t('usage.filters.description')}
                code={`// columns-filters.ts
import { DataTableFilterField } from '@/shared/components/data-table/shared/data-table-filter';

export const filterFields: DataTableFilterField[] = [
  {
    id: 'status',   // must match the API filter field name
    title: 'employee.field.status' satisfies TranslationsKey,
    options: CONST_EMPLOYEE_STATUS.map(c => ({
      label: c.label,
      value: c.value,
    })),
  },
  {
    id: 'jobLevel',
    title: 'employee.field.jobLevel' satisfies TranslationsKey,
    options: CONST_EMPLOYEE_JOB_LEVEL.map(c => ({
      label: c.label,
      value: c.value,
    })),
  },
];`}
              />

              <GuideBlock
                title={t('usage.sticky.title')}
                description={t('usage.sticky.description')}
                code={`const h = getColumnHelper<EmployeePreview>();

export const columns = [
  createSelectColumn<EmployeePreview>(),     // sticky: 'left' — default
  h.accessor('code', {
    header: '...',
    meta: { sticky: 'left' },              // explicit sticky left
  }),
  h.accessor('fullName', { header: '...' }),
  // ...middle columns...
  createDateColumn({ accessor: 'hireDate', header: '...' }),
  createStatusColumn({ accessor: 'status', ... }),
  createActionsColumn<EmployeePreview>(),    // sticky: 'right' — default
];

// Pass to DataTableServer or DataTableStatic — no extra config needed
<DataTableServer columns={columns} ... />`}
              />

              <GuideBlock
                title={t('usage.actionsRender.title')}
                description={t('usage.actionsRender.description')}
                code={`<DataTableServer
  columns={columns}
  ...
  enableMultiRowSelection
  actionsRender={({ table, isLoading }) => {
    const selected = table
      .getSelectedRowModel()
      .rows.map(r => r.original);
    return (
      <>
        <Button
          size="sm"
          disabled={selected.length === 0 || isLoading}
          onClick={() =>
            exportMutation.mutate(selected.map(r => r.id))
          }
        >
          Export {selected.length > 0 ? \`(\${selected.length})\` : ''}
        </Button>
        <Button size="sm" onClick={() => openCreateDialog()}>
          {t('employee.control.create')}
        </Button>
      </>
    );
  }}
/>`}
              />

              <GuideBlock
                title={t('usage.tableMeta.title')}
                description={t('usage.tableMeta.description')}
                code={`// columns.tsx
createActionsColumn<EmployeePreview>(row => (
  <>
    <DropdownMenuItem
      onClick={() => row.table.options.meta?.onEdit?.(row)}
    >
      Sửa
    </DropdownMenuItem>
    <DropdownMenuItem
      variant="destructive"
      onClick={() => row.table.options.meta?.onDelete?.(row)}
    >
      Xóa
    </DropdownMenuItem>
  </>
)),

// index.tsx
<DataTableServer
  ...
  meta={{
    onEdit: row => openEditDialog(row.original),
    onDelete: row => deleteMutation.mutate(row.original.id),
  }}
/>`}
              />
            </div>
          </TabsContent>
          {/* ── Plain table ────────────────────────────────────────────── */}
          <TabsContent value="plain">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="mb-3 text-sm font-semibold">
                  {t('plain.demoTitle')}
                </h2>
                <DataTablePlain
                  columns={plainColumns}
                  data={PLAIN_DEMO_DATA}
                  getRowKey={row => row.id}
                  footer={
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-right font-semibold"
                      >
                        {t('plain.totalActive')}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {plainActiveCount} / {PLAIN_DEMO_DATA.length}
                      </TableCell>
                    </TableRow>
                  }
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <GuideBlock
                  title={t('usage.plain.title')}
                  description={t('usage.plain.description')}
                  code={PLAIN_USAGE_CODE}
                />
                <GuideBlock
                  title={t('plain.whenTitle')}
                  description={t('plain.whenDescription')}
                  code={PLAIN_WHEN_CODE}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function GuideBlock({
  title,
  description,
  code,
}: {
  title: string;
  description: string;
  code: string;
}) {
  return (
    <section className="rounded-md border border-border bg-background p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <pre className="mt-3 overflow-auto rounded-md bg-muted p-3 text-xs">
        {code}
      </pre>
    </section>
  );
}
