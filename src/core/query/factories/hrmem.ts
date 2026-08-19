import type { UseMutationOptions } from '@tanstack/react-query';
import { createQuery, createUseMutation, createUseQuery } from './base';
import type { HrmEmHttpRequestError } from '@/core/network/hrmem-http-request';

export function createUseQueryHrmEm<TRequest>() {
  return createUseQuery<HrmEmHttpRequestError>()<TRequest>();
}

export function createQueryHrmEm<TRequest>() {
  return createQuery<HrmEmHttpRequestError>()<TRequest>();
}

export function createUseMutationHrmEm<TRequest, TResponse>(
  options: UseMutationOptions<TResponse, HrmEmHttpRequestError, TRequest>,
) {
  return createUseMutation<HrmEmHttpRequestError>()<TRequest, TResponse>(
    options,
  );
}
