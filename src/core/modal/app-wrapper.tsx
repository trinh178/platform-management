import React from 'react';
import { ModalWrapperProps } from '../common/dynamic-modal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

interface AppWrapperProps extends React.ComponentProps<typeof Dialog> {
  title?: string;
}

export default function AppWrapper({
  Component,
  props,
  wrapperProps,
}: ModalWrapperProps<AppWrapperProps>) {
  const handleClose = React.useCallback(() => {
    props?.modalThis?.close?.();
  }, [props?.modalThis]);

  // Close when press ESC
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  const { title, ...dialogProps } = wrapperProps || {};

  return (
    <Dialog
      {...dialogProps}
      onOpenChange={open => !open && props?.modalThis?.close?.()}
      open={true}
    >
      <DialogContent
        showCloseButton={true}
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
        aria-describedby={undefined}
        className="md:max-w-[90svw] w-fit"
      >
        <DialogHeader>
          <DialogTitle className="uppercase">{title}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {Component && <Component {...props} />}
      </DialogContent>
    </Dialog>
  );
}
