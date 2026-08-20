'use client';

import { useTranslations } from 'next-intl';
import GeneralSettingForm from '../components/general-setting';
import PageContent from '@/core/layout/page-content';
import PageContentHeader from '@/core/layout/page-content-header';

export default function GeneralSettingPage() {
  const t = useTranslations();

  return (
    <PageContent>
      <PageContentHeader title={t('settings.general.title')} />
      <GeneralSettingForm />
    </PageContent>
  );
}
