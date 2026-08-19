'use client';

import { LoadingContainer } from '../common/dynamic-loading';
import appLoadingControlPI from './prevent-interactive';
import appLoadingControl from '.';

export default function AppLoadingContainer() {
  return (
    <>
      <LoadingContainer control={appLoadingControl} />
      <LoadingContainer control={appLoadingControlPI} />
    </>
  );
}
