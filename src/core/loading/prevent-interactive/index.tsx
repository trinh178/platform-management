'use client';

import { LoadingController } from '@/core/common/dynamic-loading';
import PreventInteractiveLoadingContent from '@/core/common/dynamic-loading/templates/PreventInteractiveLoadingContent';

let appLoadingControl = null;

if (typeof window !== 'undefined') {
  appLoadingControl = new LoadingController({
    Content: PreventInteractiveLoadingContent,
  });
}

export default appLoadingControl as LoadingController;

export { useAppLoading } from './hooks';
