import { ModalController } from './ModalController';
import Wrapper from './wrapper';

export { default as ModalContainer } from './ModalContainer';
export type { ModalBaseProps, ModalWrapperProps } from './ModalController';
export { ModalController };

// Default modal controller
export const modalControl = new ModalController({
  WrapperComponent: Wrapper,
}).mount();
export default modalControl;
