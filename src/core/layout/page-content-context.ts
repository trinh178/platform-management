import React from 'react';

interface PageContentContextProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const defaultValue: PageContentContextProps = {
  loading: false,
  setLoading: () => {},
};

export const PageContentContext =
  React.createContext<PageContentContextProps>(defaultValue);

export function usePageContentContext() {
  const context = React.useContext(PageContentContext);

  if (!context) {
    throw new Error('usePageContentContext must be used inside <PageContent>');
  }

  return context;
}
