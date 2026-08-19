import type { UseMutationOptions } from '@tanstack/react-query';
import { createUseMutation, createUseQuery } from './base';
import type { IamHttpRequestError } from '@/core/network/iam-http-request';

export function createUseQueryIam<TRequest>() {
  return createUseQuery<IamHttpRequestError>()<TRequest>();
}

export function createUseMutationIam<TRequest, TResponse>(
  options: UseMutationOptions<TResponse, IamHttpRequestError, TRequest>,
) {
  return createUseMutation<IamHttpRequestError>()<TRequest, TResponse>(options);
}
