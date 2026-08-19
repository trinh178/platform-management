import appLoadingControl from '.';

export function useAppLoading(loading?: boolean) {
  if (typeof window === 'undefined') return;
  appLoadingControl.useLoading(loading);
}
