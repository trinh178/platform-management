import { CSSProperties, ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { Store } from '../store';
import { useModalComponentControl } from './hooks';
import ModalContainer from './ModalContainer';

export interface ModalBaseProps {
  modalType?: 'info' | 'edit';
  modalThis?: {
    close: () => void;
  };
  onClose?: () => void;
}

export type ModalWrapperProps<W> = ModalStoreEntity<ModalBaseProps, W>;
// export type ModalWrapperProps<W> = Required<
//   ModalStoreEntity<ModalBaseProps, W>
// >;

export interface ModalStoreEntity<P extends ModalBaseProps, W> {
  Component?: React.ComponentType<P>;
  props?: P;
  wrapperProps?: W;
}

export interface ModalComponentControl<P extends ModalBaseProps, W> {
  open: (props?: ModalStoreEntity<P, W>['props']) => string;
  close: () => void;
}

interface ModalControllerOptions<W> {
  containerStyle?: CSSProperties;
  containerClassname?: string;
  WrapperComponent?: ComponentType<ModalWrapperProps<W>>;
}

interface ShowOptions<P extends ModalBaseProps, W> {
  Component?: ModalStoreEntity<P, W>['Component'];
  props?: ModalStoreEntity<P, W>['props'];
  wrapperProps?:
    | ModalStoreEntity<P, W>['wrapperProps']
    | ((props: P) => ModalStoreEntity<P, W>['wrapperProps']);
  key?: string;
}

export class ModalController<W> {
  #store: Store<ModalStoreEntity<ModalBaseProps, W>>;
  #options: ModalControllerOptions<W>;
  #container: HTMLElement | null = null;

  constructor(options?: ModalControllerOptions<W>) {
    this.#store = new Store({
      autoKeyPrefix: 'MODAL_',
      enableLogger: false,
    });

    this.#options = options || {};
  }

  getStore() {
    return this.#store;
  }

  close(key: string) {
    const entity = this.#store.get(key);
    if (!entity) return;
    entity?.value?.props?.onClose?.();
    this.#store.remove(key);
  }

  open<P extends ModalBaseProps>(options: ShowOptions<P, W>): string;
  open<P extends ModalBaseProps>(
    Component: ShowOptions<P, W>['Component'],
    props?: ShowOptions<P, W>['props'],
    wrapperProps?: ShowOptions<P, W>['wrapperProps'],
    key?: ShowOptions<P, W>['key'],
  ): string;
  open<P extends ModalBaseProps>(
    optionsOrComponent: ShowOptions<P, W> | ShowOptions<P, W>['Component'],
    props?: ShowOptions<P, W>['props'],
    wrapperProps?: ShowOptions<P, W>['wrapperProps'],
    key?: ShowOptions<P, W>['key'],
  ) {
    let Component: ShowOptions<P, W>['Component'];
    if (typeof optionsOrComponent === 'object') {
      const options = optionsOrComponent as ShowOptions<P, W>;
      Component = options.Component;
      props = options.props;
      wrapperProps = options.wrapperProps;
      key = options.key;
    } else {
      Component = optionsOrComponent as ShowOptions<P, W>['Component'];
      props = props || ({} as ShowOptions<P, W>['props']);
    }

    key = key || this.#store.generateKey();
    const baseProps: ModalBaseProps = {
      modalThis: {
        close: () => this.close(key as string),
      },
    };
    const addedBaseProps = {
      ...baseProps,
      ...props,
    };

    return this.#store.add(
      {
        Component: Component as React.ComponentType<ModalBaseProps>,
        props: addedBaseProps,
        wrapperProps:
          typeof wrapperProps === 'function'
            ? (wrapperProps as (props: P) => W)(addedBaseProps as P)
            : wrapperProps || ({} as W),
      },
      key,
    );
  }

  createModalComponentControl<P extends ModalBaseProps>(
    Component: ModalStoreEntity<P, W>['Component'],
    initialProps?: ModalStoreEntity<P, W>['props'],
    wrapperProps?: W,
  ) {
    // const key = this.#store.generateKey();
    let key: string;
    return {
      open: (props?: ModalStoreEntity<P, W>['props']) => {
        key = this.open({
          Component,
          props: { ...initialProps, ...(props || ({} as P)) },
          wrapperProps,
          key,
        });
        return key;
      },
      close: () => this.close(key),
    } as ModalComponentControl<P, W>;
  }

  getOptions() {
    return this.#options;
  }

  mount() {
    if (typeof document === 'undefined') {
      console.error('document not found.');
      return this;
    }
    if (this.#container) {
      console.error('mounted.');
      return this;
    }

    this.#container = document.createElement('div');
    this.#container.className = 'dynamic-modal-container-wrapper';
    document.body.appendChild(this.#container);
    const modalContainer = createRoot(this.#container);
    modalContainer.render(<ModalContainer control={this} />);

    return this;
  }

  // Hooks
  useModalComponentControl<P extends ModalBaseProps>(
    Component: ModalStoreEntity<P, W>['Component'],
    initialProps?: ModalStoreEntity<P, W>['props'],
    wrapperProps?: W,
  ) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useModalComponentControl(
      this,
      Component,
      initialProps,
      wrapperProps,
    );
  }
}
