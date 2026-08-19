import { ModalController } from '../common/dynamic-modal';
import AppWrapper from './app-wrapper';

let appModalControl = null;

if (typeof window !== 'undefined') {
  appModalControl = new ModalController({
    WrapperComponent: AppWrapper,
  });
}

export default appModalControl as ModalController<
  React.ComponentProps<typeof AppWrapper>
>;

export { useAppModalComponentControl } from './hooks';
