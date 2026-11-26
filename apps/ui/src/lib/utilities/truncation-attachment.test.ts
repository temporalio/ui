import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTruncationAttachment } from './truncation-attachment';

let resizeCallbacks: ResizeObserverCallback[] = [];
const disconnectResizeObserver = vi.fn();

class FakeResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeCallbacks.push(callback);
  }
  observe() {}
  unobserve() {}
  disconnect = disconnectResizeObserver;
}

const setWidths = (
  element: HTMLElement,
  { scrollWidth, clientWidth }: { scrollWidth: number; clientWidth: number },
) => {
  Object.defineProperty(element, 'scrollWidth', {
    configurable: true,
    value: scrollWidth,
  });
  Object.defineProperty(element, 'clientWidth', {
    configurable: true,
    value: clientWidth,
  });
};

const triggerResize = () => {
  for (const callback of resizeCallbacks) {
    callback([], {} as ResizeObserver);
  }
};

describe('createTruncationAttachment', () => {
  beforeEach(() => {
    resizeCallbacks = [];
    disconnectResizeObserver.mockClear();
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports the initial truncation state', () => {
    const element = document.createElement('div');
    setWidths(element, { scrollWidth: 200, clientWidth: 100 });
    const onTruncationChange = vi.fn();

    createTruncationAttachment({ onTruncationChange })(element);

    expect(onTruncationChange).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('reports only when the truncation state changes on resize', () => {
    const element = document.createElement('div');
    setWidths(element, { scrollWidth: 100, clientWidth: 100 });
    const onTruncationChange = vi.fn();

    createTruncationAttachment({ onTruncationChange })(element);
    triggerResize();
    setWidths(element, { scrollWidth: 100, clientWidth: 50 });
    triggerResize();

    expect(onTruncationChange.mock.calls).toEqual([[false], [true]]);
  });

  it('re-measures when the text changes', async () => {
    const element = document.createElement('div');
    element.textContent = 'short';
    setWidths(element, { scrollWidth: 100, clientWidth: 100 });
    const onTruncationChange = vi.fn();

    createTruncationAttachment({ onTruncationChange })(element);
    setWidths(element, { scrollWidth: 300, clientWidth: 100 });
    element.textContent = 'a much longer piece of text';
    await Promise.resolve();

    expect(onTruncationChange).toHaveBeenLastCalledWith(true);
  });

  it('disconnects observers on cleanup', () => {
    const element = document.createElement('div');
    setWidths(element, { scrollWidth: 100, clientWidth: 100 });

    const cleanup = createTruncationAttachment({
      onTruncationChange: vi.fn(),
    })(element);
    if (typeof cleanup === 'function') {
      cleanup();
    }

    expect(disconnectResizeObserver).toHaveBeenCalled();
  });
});
