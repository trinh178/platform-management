import React from 'react';
import { QueryMeta } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';
import { storage } from '../storage';
import appLoadingControl from '@/core/loading/prevent-interactive';
import { notify } from '@/core/notification';
import { defaultMeta } from '@/core/query/defaultMeta';
import queryClient from '@/core/query/query-client';
import { SignInRequest } from '@/modules/foundation/identity/services/auth/auth.api';
import usersKeys from '@/modules/foundation/identity/services/users/users.query-keys';

export function useSignIn() {
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const mutate = async (data: SignInRequest) => {
    setIsSuccess(false);
    setIsError(false);
    setError('');

    setIsPending(true);
    const res = await signIn('credentials', {
      redirect: false,
      ...data,
    });
    if (res?.ok) {
      setIsSuccess(true);

      storage.set('___HAS_SIGNIN', true);

      queryClient.invalidateQueries({ queryKey: usersKeys.me }); // TODO: put in useMutation ?
    } else {
      setIsError(true);
      setError(res?.error || '');
    }
    setIsPending(false);
  };

  return { mutate, isPending, isSuccess, isError, error };
}

export function useSignInWithOptions(otp?: QueryMeta) {
  const signIn = useSignIn();
  const notifyRef = React.useRef<string | number>(undefined);
  const otpRef = React.useRef({
    ...defaultMeta,
    ...otp,
  });

  React.useEffect(() => {
    if (!otpRef.current.showLoading) return;
    if (signIn.isPending) {
      notifyRef.current = notify.loading('identity.auth.signing_in', {
        id: notifyRef.current,
      });
      appLoadingControl.show(notifyRef.current!.toString());
    } else if (notifyRef.current) {
      notify.dismiss(notifyRef.current);
      appLoadingControl.hide(notifyRef.current!.toString());
    }
  }, [signIn.isPending]);

  React.useEffect(() => {
    return () => {
      if (notifyRef.current) {
        notify.dismiss(notifyRef.current);
        appLoadingControl.hide(notifyRef.current!.toString());
      }
    };
  }, []);

  React.useEffect(() => {
    if (!signIn.isSuccess) return;
    if (otpRef.current.notifySuccess) {
      notify.success(
        typeof otpRef.current.notifySuccess === 'string'
          ? otpRef.current.notifySuccess
          : 'identity.auth.sign_in_success',
      );
    }
  }, [signIn.isSuccess]);

  React.useEffect(() => {
    if (!signIn.isError) return;
    if (otpRef.current.notifyError) {
      notify.error(
        typeof otpRef.current.notifyError === 'string'
          ? otpRef.current.notifyError
          : signIn.error || 'identity.auth.sign_in_failure',
      );
    }
  }, [signIn.isError, signIn.error]);

  return signIn;
}
