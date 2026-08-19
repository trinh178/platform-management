import authApi from './auth.api';
import { createUseMutationIam } from '@/core/query/factories';

export const useSignIn = createUseMutationIam({
  mutationFn: authApi.signin,
});
