export const routerConfig = {
  rootRoute: {
    key: 'root',
    path: '/',
  },
  signInRoute: {
    key: 'sign-in',
    path: '/sign-in',
    externalPath: process.env.NEXT_PUBLIC_SIGNIN_URL as string, // SSO
  },
} as const;
