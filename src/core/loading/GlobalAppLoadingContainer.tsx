import React from 'react';
import GlobalAppLoading from './GlobalAppLoading';
import { useAppShellStore } from '@/modules/foundation/app-shell/stores/app-shell.store';

export default function GlobalAppLoadingContainer() {
  const isInitAppFetched = useAppShellStore(state => state.isInitAppFetched);

  const [stage, setStage] = React.useState<'visible' | 'exiting' | 'hidden'>(
    'visible',
  );

  React.useEffect(() => {
    if (isInitAppFetched) {
      React.startTransition(() => setStage('exiting'));
      const timer = setTimeout(() => setStage('hidden'), 2000);
      return () => clearTimeout(timer);
    }
  }, [isInitAppFetched]);

  if (stage === 'hidden') return null;
  const isExiting = stage === 'exiting';

  return <GlobalAppLoading isExiting={isExiting} />;
}
