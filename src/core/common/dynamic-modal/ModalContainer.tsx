import { Fragment } from 'react';
import React from 'react';
import { StoreEntity } from '../store/Store';
import {
  ModalBaseProps,
  ModalController,
  ModalStoreEntity,
} from './ModalController';
import { cn } from '@/shared/lib/utils';

interface ModalContainerProps<W> {
  control: ModalController<W>;
}
export default function ModalContainer<W>({ control }: ModalContainerProps<W>) {
  const [list, setList] = React.useState<
    StoreEntity<ModalStoreEntity<ModalBaseProps, W>>[]
  >([]);
  React.useEffect(() => {
    React.startTransition(() => setList(control.getStore().entries));
  }, [control]);

  React.useEffect(() => {
    const unsub = control.getStore().subscribe(() => {
      setList([...control.getStore().entries]);
    });
    return () => unsub();
  }, [control]);

  const { containerStyle, containerClassname, WrapperComponent } =
    React.useMemo(() => control?.getOptions?.() || {}, [control]);

  return (
    <div
      style={containerStyle}
      className={cn(
        'fixed left-0 top-0 w-full h-full bg-transparent pointer-events-none z-[10000]',
        containerClassname,
      )}
    >
      {list.map(({ key, value }) => {
        if (!value) return null;
        const { Component, props } = value;
        return (
          <Fragment key={key}>
            {WrapperComponent ? (
              <WrapperComponent {...value} />
            ) : Component ? (
              <Component {...props} />
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
}
