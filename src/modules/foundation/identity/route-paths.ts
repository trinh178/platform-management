import { routerConfig } from '@/core/router/config';

const routePaths = {
  root: routerConfig.rootRoute.path,
  signIn: routerConfig.signInRoute.path,
} as const;

export default routePaths;
