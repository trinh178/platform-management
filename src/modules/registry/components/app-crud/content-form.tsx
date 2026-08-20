import { useAppCRUDContext } from './context';
import AppBasic from './sections/app-basic';
import AppLinkedServices from './sections/app-linked-services';

export default function AppCRUDForm() {
  const { mode, data } = useAppCRUDContext();

  return (
    <div className="space-y-4">
      <AppBasic />
      {mode !== 'CREATE' && data?.id && <AppLinkedServices appId={data.id} />}
    </div>
  );
}
