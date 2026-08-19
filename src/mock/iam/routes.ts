import {
  buildSignInResponse,
  buildUserMe,
  buildUserPreview,
  getUserByEmail,
  getUserById,
} from './helpers';
import { userStore } from './stores';
import { appfetch } from '@/core/network/appfetch';
import iamHttpRequest from '@/core/network/iam-http-request';
import {
  MockListFilter,
  buildMockListResponse,
  extractIdFromUrl,
  matchFilterOperator,
  parseBody,
  toUrl,
} from '@/core/network/mock-utils';
import { getCurrentUserId, setCurrentUserId } from '@/mock/mock-context';

// ─── POST /auth/sign-in ──────────────────────────────────────────────────────
iamHttpRequest.addMockRoute({
  url: '/auth/sign-in',
  method: 'POST',
  handler: async (input, init) => {
    const body = await parseBody(input, init);
    const email = typeof body.email === 'string' ? body.email : '';
    const password = typeof body.password === 'string' ? body.password : '';

    const user = getUserByEmail(email);
    if (!user || user.password !== password) {
      return appfetch.error(
        {
          code: 'INVALID_CREDENTIALS',
          message: 'Email hoặc mật khẩu không đúng',
        },
        401,
      );
    }

    // Mock: đăng nhập thành công thì đặt luôn current user.
    setCurrentUserId(user.id);
    return appfetch.json(buildSignInResponse(user));
  },
});

// ─── POST /auth/refresh ──────────────────────────────────────────────────────
iamHttpRequest.addMockRoute({
  url: '/auth/refresh',
  method: 'POST',
  handler: () => {
    const user = getUserById(getCurrentUserId()) ?? userStore[0];
    const tokens = buildSignInResponse(user);
    return appfetch.json({
      accessToken: tokens.accessToken,
      accessTokenExpiry: tokens.accessTokenExpiry,
    });
  },
});

// ─── GET /users/me (specific — must be BEFORE /users/:id) ────────────────────
iamHttpRequest.addMockRoute({
  url: '/users/me',
  method: 'GET',
  handler: () => {
    const user = getUserById(getCurrentUserId()) ?? userStore[0];
    return appfetch.json(buildUserMe(user));
  },
});

// ─── GET /users (list) ───────────────────────────────────────────────────────
iamHttpRequest.addMockRoute({
  url: /\/users(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const sp = new URL(toUrl(input)).searchParams;
    return appfetch.json(
      buildMockListResponse({
        sp,
        items: userStore,
        search: (u, term) =>
          [u.username, u.email, u.firstName, u.lastName]
            .filter(Boolean)
            .some(v => v!.toLowerCase().includes(term)),
        filter: (u, filter: MockListFilter) => {
          if (filter.field === 'username')
            return matchFilterOperator(u.username, filter);
          if (filter.field === 'email')
            return matchFilterOperator(u.email, filter);
          if (filter.field === 'roles')
            return matchFilterOperator(u.roles[0], filter);
          if (filter.field === 'lockoutEnabled')
            return matchFilterOperator(u.lockoutEnabled, filter);
          return true;
        },
        mapItem: buildUserPreview,
      }),
    );
  },
});

// ─── GET /users/:id ──────────────────────────────────────────────────────────
iamHttpRequest.addMockRoute({
  url: /\/users\/[^/?]+$/,
  method: 'GET',
  handler: input => {
    const id = extractIdFromUrl(toUrl(input), 'users');
    const user = getUserById(id);
    if (!user) {
      return appfetch.error(
        { code: 'NOT_FOUND', message: 'Không tìm thấy user' },
        404,
      );
    }
    return appfetch.json(buildUserMe(user));
  },
});
