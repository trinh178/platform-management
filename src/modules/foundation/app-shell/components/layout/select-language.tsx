'use client';

import { Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { setLocale } from '@/core/i18n/set-locale';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

const locales = [
  { locale: 'vi', label: 'Tiếng Việt' },
  { locale: 'en', label: 'English' },
] as const;

const SelectLanguage = () => {
  const t = useTranslations('app_shell.common');
  const locale = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Languages className="h-4 w-4" />
          {locales.find(e => e.locale === locale)?.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>{t('select_language')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          onValueChange={async lang => {
            await setLocale(lang);
            // router.refresh();
            location.reload();
          }}
          value={locale}
        >
          {locales.map(e => (
            <DropdownMenuRadioItem key={e.locale} value={e.locale}>
              <span className="flex items-center gap-2">
                <span>{e.locale}</span>
                <span>{e.label}</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SelectLanguage;
