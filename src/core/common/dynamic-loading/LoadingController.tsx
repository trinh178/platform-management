import { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { useLoading } from './hooks';
import LoadingContainer from './LoadingContainer';
import { Store } from '@/core/common/store';

export interface LoadingContentProps {
  visible: boolean;
}

interface LoadingControllerOptions {
  Content: ComponentType<LoadingContentProps>;
}

export interface LoadingControl {
  show: () => string;
  hide: () => void;
}

export class LoadingController {
  #store: Store<undefined>;
  #options: LoadingControllerOptions;
  #container: HTMLElement | null = null;

  constructor(options: LoadingControllerOptions) {
    this.#store = new Store({
      autoKeyPrefix: 'LOADING_',
      enableLogger: false,
    });

    this.#options = options;
  }

  getStore() {
    return this.#store;
  }

  show(key?: string) {
    return this.#store.add(undefined, key);
  }

  hide(key: string) {
    this.#store.remove(key);
  }

  createLoadingControl() {
    const key = this.#store.generateKey();
    return {
      show: () => this.show(key),
      hide: () => this.hide(key),
    } as LoadingControl;
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
    modalContainer.render(<LoadingContainer control={this} />);

    return this;
  }

  // Hooks
  useLoading(loading?: boolean) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useLoading(this, loading);
  }
}
