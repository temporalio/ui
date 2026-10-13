import { vi } from 'vitest';

// Browser APIs jsdom lacks. Import this before the component under test.
// matchMedia reports reduced motion, and animations finish at once.
vi.stubGlobal('matchMedia', (query: string) => ({
  matches: query.includes('reduce'),
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
}));

Object.defineProperty(Element.prototype, 'animate', {
  configurable: true,
  value: () => {
    const animation = {
      cancel: () => {},
      finished: Promise.resolve(),
      set onfinish(callback: () => void) {
        queueMicrotask(callback);
      },
    };
    return animation;
  },
});

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  configurable: true,
  value: () => {},
});

Object.defineProperties(HTMLDialogElement.prototype, {
  showModal: {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.open = true;
    },
  },
  close: {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.open = false;
    },
  },
});
