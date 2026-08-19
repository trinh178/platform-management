import type { IamUserMock } from './mock-types';
import { userStore } from './stores';
import type { SignInResponse } from '@/modules/foundation/identity/services/auth/auth.api';
import type { User } from '@/modules/foundation/identity/services/users/users.api';
import { PERMISSIONS } from '@/modules/permissions';

const ACCESS_TOKEN_TTL_MS = 3 * 60 * 60 * 1000; // 3h
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7d

function fakeToken(prefix: string, userId: string): string {
  return `${prefix}.${Buffer.from(`${userId}:${Date.now()}`).toString('base64')}`;
}

export function getUserById(id?: string | null): IamUserMock | undefined {
  if (!id) return undefined;
  return userStore.find(u => u.id === id);
}

export function getUserByEmail(value: string): IamUserMock | undefined {
  const normalized = value.trim().toLowerCase();
  return userStore.find(
    u =>
      u.email.toLowerCase() === normalized ||
      u.username.toLowerCase() === normalized,
  );
}

/** Shape cho `GET /users/me` — đầy đủ roles + permissions. */
export function buildUserMe(user: IamUserMock): User {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber ?? '',
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles,
    permissions: Object.values(PERMISSIONS),
  };
}

/** Shape rút gọn cho list `GET /users`. */
export function buildUserPreview(user: IamUserMock) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber ?? '',
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles,
    lockoutEnabled: user.lockoutEnabled,
    createdBy: user.createdBy,
    createdOnUtc: user.createdOnUtc,
    modifiedBy: user.modifiedBy,
    modifiedOnUtc: user.modifiedOnUtc,
  };
}

export function buildSignInResponse(user: IamUserMock): SignInResponse {
  const now = Date.now();
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber ?? '',
    accessToken: fakeToken('mock-access', user.id),
    accessTokenExpiry: now + ACCESS_TOKEN_TTL_MS,
    refreshToken: fakeToken('mock-refresh', user.id),
    refreshTokenExpiry: now + REFRESH_TOKEN_TTL_MS,
  };
}
