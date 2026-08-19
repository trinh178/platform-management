import React from 'react';
import {
  ModalBaseProps,
  ModalController,
  ModalStoreEntity,
} from './ModalController';

export function useModalComponentControl<P extends ModalBaseProps, W>(
  control: ModalController<W>,
  Component: ModalStoreEntity<P, W>['Component'],
  initialProps?: ModalStoreEntity<P, W>['props'],
  wrapperProps?: W,
) {
  const [modalControl] = React.useState(() =>
    control.createModalComponentControl(Component, initialProps, wrapperProps),
  );

  React.useEffect(() => {
    return () => {
      modalControl.close();
    };
  }, [modalControl]);

  return modalControl;
}
