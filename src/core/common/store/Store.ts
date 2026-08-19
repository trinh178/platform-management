export interface StoreEntity<T> {
  key: string;
  value?: T;
}

interface StoreConfig {
  autoKeyPrefix?: string;
  enableLogger?: boolean;
}
const defConfig: Required<StoreConfig> = {
  autoKeyPrefix: '_',
  enableLogger: false,
};

export class Store<P> {
  readonly entries: StoreEntity<P>[];
  readonly config: Required<StoreConfig>;
  readonly subscribeList: (() => void)[];

  #autoId: number;

  constructor(config: StoreConfig) {
    this.entries = [];
    this.#autoId = 0;
    this.config = {
      ...defConfig,
      ...config,
    };
    this.subscribeList = [];
  }

  #runSubscribe() {
    for (const subs of this.subscribeList) {
      subs();
    }
  }

  generateKey() {
    return this.config.autoKeyPrefix + this.#autoId++;
  }

  add(value?: StoreEntity<P>['value'], key?: StoreEntity<P>['key']) {
    key = key || this.generateKey();
    this.remove(key);
    this.entries.push({
      key,
      value,
    });
    this.#runSubscribe();

    // Logger
    if (this.config.enableLogger) {
      console.groupCollapsed('Added item with key: ' + key);
      console.log('Current entries', this.entries);
      console.trace();
      console.groupEnd();
    }

    return key;
  }

  remove(key: StoreEntity<P>['key']) {
    const index = this.entries.findIndex(e => e.key === key);
    if (index === -1) return;
    this.entries.splice(index, 1);
    this.#runSubscribe();

    // Logger
    if (this.config.enableLogger) {
      console.groupCollapsed('Removed item with key: ' + key);
      console.log('Current entries', this.entries);
      console.trace();
      console.groupEnd();
    }
  }

  get(key: StoreEntity<P>['key']) {
    return this.entries.find(e => e.key === key);
  }

  subscribe(callback: () => void) {
    this.subscribeList.push(callback);
    return () => {
      const index = this.subscribeList.findIndex(e => e === callback);
      if (index === -1) return;
      this.subscribeList.splice(index, 1);
    };
  }
}
