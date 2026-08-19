import React from 'react';
import { AppTheme } from '../theme';
import {
  AppContext,
  AppContextProps,
  appContextValueRef,
  defaultValue,
} from '.';

export default function AppContextProvider({
  children,
}: React.PropsWithChildren<unknown>) {
  const [selectedTheme, setSelectedTheme] = React.useState<AppTheme>(
    defaultValue.selectedTheme,
  );

  const selectTheme = React.useCallback((theme: AppTheme) => {
    setSelectedTheme(theme);
  }, []);

  const value = React.useMemo<AppContextProps>(
    () => ({
      selectedTheme,
      themes: defaultValue.themes,
      selectTheme,
    }),
    [selectedTheme, selectTheme],
  );

  React.useLayoutEffect(() => {
    appContextValueRef.current = value;
  });

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
