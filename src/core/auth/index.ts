import { AuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import authApi from '@/modules/foundation/identity/services/auth/auth.api';

async function refreshAccessToken(token: JWT) {
  try {
    const data = await authApi.refreshToken({
      refreshToken: token.refreshToken,
    });

    return {
      ...token,
      accessToken: data.accessToken,
      accessTokenExpiry: data.accessTokenExpiry,
    };
  } catch (error) {
    console.error(error); // TODO: error
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const data = await authApi.signin({
          email: credentials?.email || '',
          password: credentials?.password || '',
        });
        return data;
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 1 * 24 * 60 * 60,
  },

  jwt: {
    maxAge: 1 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      // First login
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          accessTokenExpiry: user.accessTokenExpiry,
          refreshToken: user.refreshToken,
          refreshTokenExpiry: user.refreshTokenExpiry,
        };
      }

      // If the token has not expired
      if (Date.now() < Number(token.accessTokenExpiry)) {
        return token;
      }

      // If expired → refresh
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        domain: process.env.NEXTAUTH_COOKIE_DOMAIN,
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      },
    },
  },
};
