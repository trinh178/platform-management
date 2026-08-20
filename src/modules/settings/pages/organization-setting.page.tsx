'use client';

import { useTranslations } from 'next-intl';
import OrganizationSettingForm from '../components/organization-setting';
import PageContent from '@/core/layout/page-content';
import PageContentHeader from '@/core/layout/page-content-header';

export default function OrganizationSettingPage() {
  const t = useTranslations();

  return (
    <PageContent>
      <PageContentHeader title={t('settings.organization.title')} />
      <OrganizationSettingForm />
    </PageContent>
  );
}
