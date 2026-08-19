import type {
  FetchQueryOptions,
  QueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';
import { useAppMutation, useAppQuery } from '@/core/query';

export function createUseQuery<TError>() {
  return function <TRequest>() {
    return function <TResponse>(
      getOptions: (data: TRequest) => FetchQueryOptions<TResponse, TError>,
    ) {
      const useQueryFn = (
        data: TRequest = undefined as TRequest,
        otp?: Omit<UseQueryOptions<TResponse, TError>, 'queryKey' | 'queryFn'>,
      ) => {
        return useAppQuery<TResponse, TError>({
          ...getOptions(data),
          ...otp,
        });
      };

      const queryFn = (
        queryClient: QueryClient,
        data: TRequest = undefined as TRequest,
        otp?: Omit<
          FetchQueryOptions<TResponse, TError>,
          'queryKey' | 'queryFn'
        >,
      ): Promise<TResponse> => {
        return queryClient.fetchQuery({
          ...getOptions(data),
          ...otp,
        }) as Promise<TResponse>;
      };

      return Object.assign(useQueryFn, { query: queryFn });
    };
  };
}

export function createQuery<TError>() {
  return function <TRequest>() {
    return function <TResponse>(
      getOptions: (data: TRequest) => FetchQueryOptions<TResponse, TError>,
    ) {
      return (
        queryClient: QueryClient,
        data: TRequest = undefined as TRequest,
        otp?: Omit<
          FetchQueryOptions<TResponse, TError>,
          'queryKey' | 'queryFn'
        >,
      ): Promise<TResponse> => {
        return queryClient.fetchQuery({
          ...getOptions(data),
          ...otp,
        }) as Promise<TResponse>;
      };
    };
  };
}

export function createUseMutation<TError>() {
  return function <TRequest, TResponse>(
    options: UseMutationOptions<TResponse, TError, TRequest>,
  ) {
    return (
      otp?: Omit<UseMutationOptions<TResponse, TError, TRequest>, 'mutationFn'>,
    ) => {
      return useAppMutation<TResponse, TError, TRequest>({
        ...options,
        ...otp,
        async onSuccess(data, variables, onMutateResult, context) {
          await options?.onSuccess?.(data, variables, onMutateResult, context);
          await otp?.onSuccess?.(data, variables, onMutateResult, context);
        },
        async onError(error, variables, onMutateResult, context) {
          await options?.onError?.(error, variables, onMutateResult, context);
          await otp?.onError?.(error, variables, onMutateResult, context);
        },
        async onSettled(data, error, variables, onMutateResult, context) {
          await options?.onSettled?.(
            data,
            error,
            variables,
            onMutateResult,
            context,
          );
          await otp?.onSettled?.(
            data,
            error,
            variables,
            onMutateResult,
            context,
          );
        },
        async onMutate(variables, context) {
          const optionsResult = await options?.onMutate?.(variables, context);
          const overrideResult = await otp?.onMutate?.(variables, context);
          return overrideResult ?? optionsResult;
        },
      });
    };
  };
}
