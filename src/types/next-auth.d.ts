// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from 'next-auth';
import { SignInResponse } from '@/modules/foundation/identity/services/auth/auth.api';

declare module 'next-auth' {
  // type User = SignInResponse;
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User extends SignInResponse {}

  interface Session {
    accessToken: string;
    error?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    accessTokenExpiry: number;
    refreshToken: string;
    refreshTokenExpiry: number;
    error?: string;
  }
}
