import React from 'react';
import { ModalWrapperProps } from '..';

interface MyModalWrapperProps {
  a: string;
}

export default function MyModalWrapper({
  Component,
  props,
}: ModalWrapperProps<MyModalWrapperProps>) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal content */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button
          className="mb-4 rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
          onClick={handleClose}
        >
          wrapper close
        </button>

        {Component && <Component {...props} />}
      </div>
    </div>
  );
}
