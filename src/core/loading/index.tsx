import CircularProgressLoadingContent from './CircularProgressLoadingContent';
import { LoadingController } from '@/core/common/dynamic-loading';

let appLoadingControl = null;

if (typeof window !== 'undefined') {
  appLoadingControl = new LoadingController({
    Content: CircularProgressLoadingContent,
  });
}

export default appLoadingControl as LoadingController;

export { useAppLoading } from './hooks';
