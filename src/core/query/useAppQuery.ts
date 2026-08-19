/* eslint-disable no-restricted-imports */
import React from 'react';
import {
  DefaultError,
  QueryClient,
  QueryKey,
  QueryMeta,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import appLoadingControl from '../loading';
import { notify } from '../notification';
import { getMessage } from '@/shared/utils';

const defaultMeta: QueryMeta = {
  notifyError: true,
};

export function useAppQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
) {
  const _options = React.useMemo(
    () => ({
      ...options,
      meta: {
        ...defaultMeta,
        ...options.meta,
      },
    }),
    [options],
  );

  const query = useQuery<TQueryFnData, TError, TData, TQueryKey>(
    _options,
    queryClient,
  );

  // notifyError
  React.useEffect(() => {
    if (!query.isError) return;
    if (_options.meta?.notifyError) {
      notify.error(
        typeof _options.meta.notifyError === 'string'
          ? _options.meta.notifyError
          : getMessage(query.error) || 'common.notify.error',
      );
    }
  }, [query.isError, query.error, _options.meta.notifyError]);

  // notifySucess
  React.useEffect(() => {
    if (!query.isSuccess) return;
    if (_options.meta?.notifySuccess) {
      notify.success(
        typeof _options.meta.notifySuccess === 'string'
          ? _options.meta.notifySuccess
          : 'common.notify.success',
      );
    }
  }, [query.isSuccess, _options.meta.notifySuccess]);

  // showLoading
  React.useEffect(() => {
    const clearLoading = () => {
      if (_options.meta.key) {
        if (_options.meta.showLoading === 'SPINNER') {
          appLoadingControl.hide(_options.meta.key);
        } else if (typeof _options.meta.showLoading === 'string') {
          notify.dismiss(Number(_options.meta.key));
        } else {
          notify.dismiss(Number(_options.meta.key));
        }
        _options.meta.key = undefined;
      }
    };

    if (query.isFetching) {
      if (!_options.meta.key) {
        if (_options.meta?.showLoading) {
          if (_options.meta.showLoading === 'SPINNER') {
            // eslint-disable-next-line react-hooks/immutability
            _options.meta.key = appLoadingControl.show();
          } else if (typeof _options.meta.showLoading === 'string') {
            _options.meta.key = notify
              .loading(_options.meta.showLoading)
              .toString();
          } else {
            _options.meta.key = notify
              .loading('common.notify.loading')
              .toString();
          }
        }
      }
    } else clearLoading();

    return clearLoading;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isFetching, _options.meta.showLoading]);

  return query;
}
