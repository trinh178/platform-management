import React from 'react';
import { useTranslations } from 'next-intl';
import { useAppShellStore } from '@/modules/foundation/app-shell/stores/app-shell.store';

export default function InjectStore({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const setTranslations = useAppShellStore(state => state.setTranslations);
  React.useEffect(() => {
    setTranslations(t);
  }, [setTranslations, t]);
  return children;
}
