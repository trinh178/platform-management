'use client';

import React from 'react';
import { useAppRouter } from './next';

type RedirectProps = {
  to: string;
  replace?: boolean;
};

export default function Redirect({ to, replace = false }: RedirectProps) {
  const router = useAppRouter();

  React.useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [to, replace, router]);

  return null;
}
