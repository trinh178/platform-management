import React from 'react';
import { LoadingController } from '.';

export function useLoading(control: LoadingController, loading?: boolean) {
  const [loadingControl] = React.useState(() => control.createLoadingControl());
  React.useEffect(() => {
    if (loading) {
      loadingControl.show();
    } else {
      loadingControl.hide();
    }
    return () => {
      loadingControl.hide();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);
}
