import React from 'react';
import { useTranslations } from 'next-intl';
import { useEmployeeCRUDContext } from '../../context';
import Actions from './actions';
import columns from './columns';
import DocumentCRUDModal from './document-crud-modal';
import { useEmployeeDocuments } from '@/modules/employee/services/employee-documents.queries';
import { EmployeeDocument } from '@/modules/employee/types/employee-document';
import { DataTableServer } from '@/shared/components/data-table/server';
import SectionPanel from '@/shared/components/layout/section-panel';
import { defaultListRequest } from '@/shared/constants/pagination';
import { CRUDMode } from '@/shared/types/crud';
import { ListRequest } from '@/shared/types/pagination';

export default function EmployeeDocuments() {
  const t = useTranslations();
  const { data: employee } = useEmployeeCRUDContext();
  const employeeId = employee?.id;

  const [listRequest, setListRequest] =
    React.useState<ListRequest>(defaultListRequest);
  const documents = useEmployeeDocuments(
    {
      employeeId: employeeId || '',
      listRequest,
    },
    {
      enabled: !!employeeId,
      placeholderData: previousData => previousData,
    },
  );

  const [modalMode, setModalMode] = React.useState<CRUDMode>('CREATE');
  const [modalData, setModalData] = React.useState<
    EmployeeDocument | undefined
  >(undefined);
  const [modalOpen, setModalOpen] = React.useState(false);

  if (!employeeId) return null;

  return (
    <SectionPanel title={t('employee.sections.documents.title')}>
      <DataTableServer
        columns={columns}
        isFetching={documents.isFetching}
        error={documents.error}
        listResponse={documents.data}
        onChangeListRequest={setListRequest}
        searchPlaceholder={t('employee.controls.searchDocument')}
        enableViewOptions
        actionsRender={() => (
          <Actions
            onCreate={() => {
              setModalMode('CREATE');
              setModalData(undefined);
              setModalOpen(true);
            }}
          />
        )}
        meta={{
          onEdit(row) {
            setModalMode('UPDATE');
            setModalData(row.original);
            setModalOpen(true);
          },
          onDelete(row) {
            setModalMode('DELETE');
            setModalData(row.original);
            setModalOpen(true);
          },
        }}
      />

      <DocumentCRUDModal
        mode={modalMode}
        data={modalData}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </SectionPanel>
  );
}
