import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Harness, {
  examplePages,
  type SortableItem,
} from './paginated-table/api-paginated-sort-harness.svelte';

type Page = {
  items: SortableItem[];
  nextPageToken: string;
};

const createDeferred = () => {
  let resolve!: (page: Page) => void;
  const promise = new Promise<Page>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

describe('Table updating transition', () => {
  let target: HTMLDivElement;
  let component: { refresh: () => void };
  let scrollIntoViewDescriptor: PropertyDescriptor | undefined;
  const fetchPage = vi.fn(async () => ({
    items: examplePages[0],
    nextPageToken: 'page-2',
  }));

  const loadingRow = () => target.querySelector('thead tr[aria-hidden="true"]');
  const hasLoadingClass = (className: string) =>
    loadingRow()?.classList.contains(className);

  const startUpdate = async () => {
    const request = createDeferred();
    const fetchCallCount = fetchPage.mock.calls.length;
    fetchPage.mockImplementationOnce(() => request.promise);
    target
      .querySelector<HTMLButtonElement>('button[aria-label="Next"]')!
      .click();
    flushSync();
    await vi.advanceTimersByTimeAsync(0);
    flushSync();
    expect(fetchPage).toHaveBeenCalledTimes(fetchCallCount + 1);
    return request;
  };

  beforeEach(async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'scrollIntoView',
    );
    HTMLElement.prototype.scrollIntoView = vi.fn();
    target = document.createElement('div');
    document.body.appendChild(target);
    component = mount(Harness, {
      target,
      props: { onFetch: async () => fetchPage },
    });
    flushSync();
    await vi.waitFor(() =>
      expect(target.querySelectorAll('tbody tr[data-name]')).toHaveLength(3),
    );
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await unmount(component);
    target.remove();
    if (scrollIntoViewDescriptor) {
      Object.defineProperty(
        HTMLElement.prototype,
        'scrollIntoView',
        scrollIntoViewDescriptor,
      );
    } else {
      delete (HTMLElement.prototype as { scrollIntoView?: unknown })
        .scrollIntoView;
    }
    vi.useRealTimers();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('suppresses entry until the 150ms delay completes', async () => {
    await startUpdate();

    expect(hasLoadingClass('opacity-0')).toBe(true);
    await vi.advanceTimersByTimeAsync(149);
    expect(hasLoadingClass('opacity-0')).toBe(true);
    await vi.advanceTimersByTimeAsync(1);
    expect(hasLoadingClass('opacity-100')).toBe(true);
    expect(hasLoadingClass('duration-[250ms]')).toBe(true);
  });

  it('runs the 250ms entry and 350ms exit phases', async () => {
    const request = await startUpdate();
    await vi.advanceTimersByTimeAsync(150);

    expect(hasLoadingClass('opacity-100')).toBe(true);
    expect(hasLoadingClass('duration-[250ms]')).toBe(true);

    request.resolve({ items: examplePages[0], nextPageToken: 'page-2' });
    await vi.advanceTimersByTimeAsync(0);

    expect(hasLoadingClass('opacity-0')).toBe(true);
    expect(hasLoadingClass('duration-[350ms]')).toBe(true);
    await vi.advanceTimersByTimeAsync(349);
    expect(loadingRow()).not.toBeNull();
    await vi.advanceTimersByTimeAsync(1);
    expect(loadingRow()).toBeNull();
  });

  it('restores the visible loading row when updating resumes during exit', async () => {
    const request = await startUpdate();
    await vi.advanceTimersByTimeAsync(150);
    request.resolve({ items: examplePages[0], nextPageToken: 'page-2' });
    await vi.advanceTimersByTimeAsync(0);

    expect(hasLoadingClass('opacity-0')).toBe(true);
    expect(hasLoadingClass('duration-[350ms]')).toBe(true);
    await vi.advanceTimersByTimeAsync(50);
    await startUpdate();

    expect(hasLoadingClass('opacity-100')).toBe(true);
    expect(hasLoadingClass('duration-[250ms]')).toBe(true);
    await vi.advanceTimersByTimeAsync(150);
    expect(hasLoadingClass('opacity-100')).toBe(true);
  });
});
