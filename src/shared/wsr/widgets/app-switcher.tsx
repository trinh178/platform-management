import React from 'react';
import { AppSwitcherFn } from '@hva-nexus/web-shared-remote/src/exposes/widgets/app-switcher';

// App Switcher from Web Shared Remote: TODO: Tạo riêng component ở wsr lib cho project sử dụng react
export interface AppSwitcherProps {
  appKey: string;
  triggerVariant?: 'full' | 'icon';
  triggerOnly?: boolean;
  className?: string;
  onReady?: (widget: AppSwitcherFn) => void;
}

export default function AppSwitcher({
  appKey,
  triggerVariant = 'full',
  triggerOnly = false,
  className,
  onReady,
}: AppSwitcherProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const widgetRef = React.useRef<AppSwitcherFn | undefined>(undefined);
  const latestOptionsRef = React.useRef({ triggerOnly, triggerVariant });
  const onReadyRef = React.useRef(onReady);

  React.useEffect(() => {
    latestOptionsRef.current = { triggerOnly, triggerVariant };
    onReadyRef.current = onReady;
  }, [onReady, triggerOnly, triggerVariant]);

  React.useEffect(() => {
    const container = containerRef.current;
    const remote = window.HVANexusWebSharedRemote?.Widgets?.AppSwitcher;

    if (!container) return;
    if (!remote) {
      throw new Error(
        'AppSwitcher remote is unavailable. Load widgets-remote.js before rendering this component.',
      );
    }

    const mountTarget = document.createElement('div');
    mountTarget.style.width = '100%';
    container.replaceChildren(mountTarget);

    const options = latestOptionsRef.current;
    const widget = remote.mount(mountTarget, appKey, options);
    widgetRef.current = widget;
    onReadyRef.current?.(widget);

    return () => {
      widget.destroy?.();
      widgetRef.current = undefined;
      mountTarget.remove();
    };
  }, [appKey]);

  React.useEffect(() => {
    widgetRef.current?.setTriggerVariant?.(triggerVariant);
  }, [triggerVariant]);

  React.useEffect(() => {
    widgetRef.current?.setTriggerOnly?.(triggerOnly);
  }, [triggerOnly]);

  return <div ref={containerRef} className={className} />;
}
