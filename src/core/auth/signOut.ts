import React from 'react';
import { SignOutParams, SignOutResponse, signOut } from 'next-auth/react';
import { storage } from '../storage';
// import queryClient from '../query/query-client';
// import { getGrantedPageRoutesConfigs } from '../router';
// import { usersKeys } from '@/modules/foundation/identity/services/users/users.query-keys';
// import { useAppShellStore } from '@/modules/foundation/app-shell/stores/app-shell.store';
// import { useIdentityStore } from '@/modules/foundation/identity/stores/identity.store';

export async function appSignOut<R extends boolean = true>(
  options?: SignOutParams<R>,
): Promise<R extends true ? undefined : SignOutResponse> {
  const result = await signOut(options);
  storage.remove('___HAS_SIGNIN');
  return result;
}

export default function useAppSignOut() {
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');

  // const resetIdentity = useIdentityStore(state => state.resetIdentity);
  // const setGrantedPageRouteConfigs = useAppShellStore(
  //   state => state.setGrantedPageRouteConfigs,
  // );

  const mutate = async <R extends boolean = true>(
    options?: SignOutParams<R>,
  ) => {
    setIsSuccess(false);
    setIsError(false);
    setError('');

    setIsPending(true);
    await appSignOut(options); // Redirect root page by default
    setIsSuccess(true);
    setIsPending(false);

    // Reset
    // resetIdentity();
    // setGrantedPageRouteConfigs(getGrantedPageRoutesConfigs(false, []));
  };

  return { mutate, isPending, isSuccess, isError, error };
}
