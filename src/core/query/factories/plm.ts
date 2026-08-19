import type { UseMutationOptions } from '@tanstack/react-query';
import { createQuery, createUseMutation, createUseQuery } from './base';
import type { PlmHttpRequestError } from '@/core/network/plm-http-request';

export function createUseQueryPlm<TRequest>() {
  return createUseQuery<PlmHttpRequestError>()<TRequest>();
}

export function createQueryPlm<TRequest>() {
  return createQuery<PlmHttpRequestError>()<TRequest>();
}

export function createUseMutationPlm<TRequest, TResponse>(
  options: UseMutationOptions<TResponse, PlmHttpRequestError, TRequest>,
) {
  return createUseMutation<PlmHttpRequestError>()<TRequest, TResponse>(options);
}
