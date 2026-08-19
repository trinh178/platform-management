/* eslint-disable no-restricted-imports */
import {
  DefaultError,
  QueryClient,
  QueryMeta,
  UseMutationOptions,
  useMutation,
} from '@tanstack/react-query';
import { notify } from '../notification';
import appLoadingControl from '@/core/loading';
import { getMessage } from '@/shared/utils';

const defaultMeta: QueryMeta = {
  notifySuccess: true,
  notifyError: true,
  showLoading: true,
};

type MutationLoading =
  | { type: 'spinner'; key: string }
  | { type: 'toast'; key: string | number };

const mutationLoadingByContext = new WeakMap<object, MutationLoading>();

export function useAppMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TOnMutateResult = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>,
  queryClient?: QueryClient,
) {
  return useMutation<TData, TError, TVariables, TOnMutateResult>(
    {
      ...options,
      meta: {
        ...defaultMeta,
        ...options.meta,
      },
      onMutate(variables, context) {
        // Generic handlers
        if (context.meta?.showLoading) {
          if (context.meta.showLoading === 'SPINNER') {
            mutationLoadingByContext.set(context, {
              type: 'spinner',
              key: appLoadingControl.show(),
            });
          } else if (typeof context.meta.showLoading === 'string') {
            mutationLoadingByContext.set(context, {
              type: 'toast',
              key: notify.loading(context.meta.showLoading),
            });
          } else {
            mutationLoadingByContext.set(context, {
              type: 'toast',
              key: notify.loading('common.notify.loading'),
            });
          }
        }

        // Specific handlers
        if (options.onMutate) return options.onMutate(variables, context);
        else return undefined as TOnMutateResult;
      },
      onSettled(data, error, variables, onMutateResult, context) {
        // Generic handlers
        const mutationLoading = mutationLoadingByContext.get(context);
        if (mutationLoading) {
          if (mutationLoading.type === 'spinner') {
            appLoadingControl.hide(mutationLoading.key);
          } else {
            notify.dismiss(mutationLoading.key);
          }
          mutationLoadingByContext.delete(context);
        }

        // Specific handlers
        if (options.onSettled)
          return options.onSettled(
            data,
            error,
            variables,
            onMutateResult,
            context,
          );
      },
      onSuccess(data, variables, onMutateResult, context) {
        // Generic handlers
        if (context.meta?.notifySuccess) {
          notify.success(
            typeof context.meta.notifySuccess === 'string'
              ? context.meta.notifySuccess
              : 'common.notify.success',
          );
        }

        // Specific handlers
        if (options.onSuccess)
          return options.onSuccess(data, variables, onMutateResult, context);
      },
      onError(error, variables, onMutateResult, context) {
        // Generic handlers
        if (context.meta?.notifyError) {
          notify.error(
            typeof context.meta.notifyError === 'string'
              ? context.meta.notifyError
              : getMessage(error) || 'common.notify.error',
          );
        }

        // Specific handlers
        if (options.onError)
          options.onError(error, variables, onMutateResult, context);
      },
    },
    queryClient,
  );
}
