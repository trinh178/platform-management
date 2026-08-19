'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { ConfirmVariant } from './confirm-modal';
import { ConfirmModal } from './confirm-modal';

export type ConfirmOptions = {
  title?: string;
  description?: string;
  content?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
};

export type ConfirmContextType = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | undefined>(undefined);

  const resolveAndClose = useCallback((value: boolean) => {
    resolveRef.current?.(value);
    resolveRef.current = undefined;
    setOptions(null);
  }, []);

  const confirm = useCallback((nextOptions: ConfirmOptions) => {
    resolveRef.current?.(false);
    setOptions(nextOptions);

    return new Promise<boolean>(resolve => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveAndClose(true);
  }, [resolveAndClose]);

  const handleCancel = useCallback(() => {
    resolveAndClose(false);
  }, [resolveAndClose]);

  useEffect(() => {
    return () => {
      resolveRef.current?.(false);
      resolveRef.current = undefined;
    };
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <ConfirmModal
        open={!!options}
        title={options?.title}
        description={options?.description}
        content={options?.content}
        confirmText={options?.confirmText}
        cancelText={options?.cancelText}
        variant={options?.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);

  if (!context) {
    throw new Error('useConfirm must be used inside ConfirmProvider');
  }

  return context;
}
