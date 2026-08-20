'use client';

import { useEffect } from 'react';
import routePaths from '../route-paths';
import { useAppRouter } from '@/core/router/next';

export default function SettingsRedirectPage() {
  const router = useAppRouter();

  useEffect(() => {
    router.replace(routePaths.settingsOrganization);
  }, [router]);

  return null;
}
