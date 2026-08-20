'use client';

import { useTranslations } from 'next-intl';
import LocalizationSettingForm from '../components/localization-setting';
import PageContent from '@/core/layout/page-content';
import PageContentHeader from '@/core/layout/page-content-header';

export default function LocalizationSettingPage() {
  const t = useTranslations();

  return (
    <PageContent>
      <PageContentHeader title={t('settings.localization.title')} />
      <LocalizationSettingForm />
    </PageContent>
  );
}
