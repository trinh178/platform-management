import React from 'react';
import { StoreEntity } from '../store/Store';
import { LoadingController } from './LoadingController';

interface LoadingContainerProps {
  control: LoadingController;
}

export default function LoadingContainer({ control }: LoadingContainerProps) {
  const [list, setList] = React.useState<StoreEntity<undefined>[]>([]);
  React.useEffect(() => {
    React.startTransition(() => setList(control.getStore().entries));
  }, [control]);

  React.useEffect(() => {
    const unsub = control.getStore().subscribe(() => {
      setList([...control.getStore().entries]);
    });
    return () => unsub();
  }, [control]);

  const Content = control?.getOptions?.()?.Content;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-transparent pointer-events-none z-[10000]">
      {Content && <Content visible={list.length > 0} />}
    </div>
  );
}
