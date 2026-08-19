import { PageRouteConfigProps } from '@/core/router/router.types';

export interface AppBaseError<T = unknown> {
  code?: number | string | null;
  message: string;
  data?: T;
}

export interface AppModuleProps {
  route: PageRouteConfigProps | PageRouteConfigProps[];
  importI18n?: (locale: string) => () => Promise<object>;
}
