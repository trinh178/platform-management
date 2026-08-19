import { appSignOut } from '../auth/signOut';
import appLoadingControl from '../loading/prevent-interactive';
import { notify } from '../notification';
import { storage } from '../storage';
import { signInRoute } from '@/modules/foundation/identity';
import { Button } from '@/shared/components/ui/button';
import { comparePathname } from '@/shared/utils/path-tools';

export async function iamUnauthorizedHandler(
  response: Response & { data?: unknown },
): Promise<Response & { data?: unknown }> {
  if (typeof window === 'undefined') return response;
  if (response.status === 401) {
    if (storage.get<boolean>('___HAS_SIGNIN')) {
      notify.info('identity.auth.session_expired', {
        id: '401',
        duration: Infinity,
        closeButton: false,
        action: (
          <Button
            variant="ghost"
            onClick={() => {
              notify.dismiss('401');
              appLoadingControl.hide('401');
              appSignOut({
                redirect: !comparePathname(
                  window.location.pathname,
                  signInRoute.path,
                ),
              });
            }}
          >
            OK
          </Button>
        ),
      });
      appLoadingControl.show('401');
    }
  }
  return response;
}
