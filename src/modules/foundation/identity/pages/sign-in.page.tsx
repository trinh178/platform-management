'use client';

import { useSignInWithOptions } from '@/core/auth/useSignIn';
import { LoginForm } from '@/modules/foundation/identity/components/login-form';

export default function SignInPage() {
  const signIn = useSignInWithOptions({ showLoading: true });

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10 overflow-hidden bg-muted">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-primary" />
      {/* Ambient blobs */}
      <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-primary/8 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full bg-primary/6 blur-3xl" />

      <div className="relative w-full max-w-sm md:max-w-4xl">
        <LoginForm
          loading={signIn.isPending}
          onSubmit={(email, password) => signIn.mutate({ email, password })}
        />
      </div>
    </div>
  );
}
