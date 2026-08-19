import { useTranslations } from 'next-intl';
import appConfig from '@/modules/foundation/app-branding/app-config';
import AppIcon from '@/shared/components/ui/app-icon';
import { cn } from '@/shared/lib/utils';

export default function GlobalAppLoading({
  isExiting,
}: {
  isExiting?: boolean;
}) {
  const t = useTranslations();

  return (
    <div
      className={cn(
        'fixed inset-0 flex flex-col items-center justify-center overflow-hidden',
        'bg-background',
        'transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        isExiting && 'opacity-0 scale-105 blur-sm',
      )}
    >
      <div className="absolute w-[480px] h-[480px] rounded-full bg-primary/10 blur-[140px] animate-pulse" />
      <div className="absolute w-[200px] h-[200px] rounded-full bg-primary/8 blur-[80px] -translate-y-24 translate-x-20" />

      <div
        className={cn(
          'relative flex items-center justify-center transition-all duration-700',
          isExiting && 'scale-75 opacity-0',
        )}
      >
        <div className="absolute w-36 h-36 rounded-3xl animate-[spin_4s_linear_infinite]">
          <div className="w-full h-full rounded-3xl bg-primary/30 [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude] p-[2px]" />
        </div>

        <div className="absolute w-28 h-28 rounded-2xl bg-primary/15 blur-xl animate-pulse" />

        <div className="animate-[float_3s_ease-in-out_infinite]">
          <AppIcon
            src={appConfig.icon}
            alt={t('app.iconAlt')}
            size={92}
            rounded="2xl"
          />
        </div>
      </div>

      <p
        className={cn(
          'mt-8 text-xs tracking-[0.2em] uppercase font-semibold text-primary/80 transition-all duration-500',
          isExiting && 'opacity-0 translate-y-2',
        )}
      >
        {t('app.name')}
      </p>

      <div
        className={cn(
          'mt-5 w-44 h-[3px] bg-primary/15 rounded-full overflow-hidden transition-all duration-500',
          isExiting && 'opacity-0 scale-x-75',
        )}
      >
        <div className="h-full w-1/2 bg-primary animate-loading-bar rounded-full" />
      </div>
    </div>
  );
}
