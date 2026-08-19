import { CURRENT_USER_ID } from './constants';

declare global {
  var __mockCurrentUserId: string | undefined;
}

export function getCurrentUserId(): string {
  return globalThis.__mockCurrentUserId ?? CURRENT_USER_ID;
}

export function setCurrentUserId(userId: string) {
  globalThis.__mockCurrentUserId = userId;
}
