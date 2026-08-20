'use client';

import { useTranslations } from 'next-intl';
import BrandingSettingForm from '../components/branding-setting';
import PageContent from '@/core/layout/page-content';
import PageContentHeader from '@/core/layout/page-content-header';

export default function BrandingSettingPage() {
  const t = useTranslations();

  return (
    <PageContent>
      <PageContentHeader title={t('settings.branding.title')} />
      <BrandingSettingForm />
    </PageContent>
  );
}
