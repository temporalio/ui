import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Harness, {
  examplePages,
  type SortableItem,
} from './api-paginated-sort-harness.svelte';

describe('API paginated table sorting', () => {
  let target: HTMLDivElement;
  let component: { removeCountSort: () => void };
  const onItemsChange = vi.fn();
  const fetchPage = vi.fn(async (_size: number, token: string) => ({
    items: examplePages[token ? 1 : 0],
    nextPageToken: token ? '' : 'page-2',
  }));
  const rowNames = () =>
    Array.from(target.querySelectorAll('tbody tr[data-name]')).map((row) =>
      row.getAttribute('data-name'),
    );
  const header = (label: string) =>
    Array.from(target.querySelectorAll('th')).find(
      (cell) => cell.textContent?.trim() === label,
    )!;
  const clickSort = (label: string) => {
    header(label).querySelector('button')!.click();
    flushSync();
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    Element.prototype.scrollIntoView = vi.fn();
    target = document.createElement('div');
    document.body.appendChild(target);
    component = mount(Harness, {
      target,
      props: { onFetch: async () => fetchPage, onItemsChange },
    });
    flushSync();
    await vi.waitFor(() => expect(rowNames()).toHaveLength(3));
  });

  afterEach(async () => {
    await unmount(component);
    target.remove();
    vi.unstubAllGlobals();
  });

  it('toggles numeric sort, exposes aria-sort, and keeps consumers in the visible order', () => {
    expect(rowNames()).toEqual(['Charlie', 'Alpha', 'Bravo']);
    expect(header('Count').hasAttribute('aria-sort')).toBe(false);
    clickSort('Count');
    expect(rowNames()).toEqual(['Alpha', 'Charlie', 'Bravo']);
    expect(header('Count').getAttribute('aria-sort')).toBe('ascending');
    expect(
      onItemsChange.mock.lastCall?.[0].map((item: SortableItem) => item.name),
    ).toEqual(rowNames());
    expect(
      target
        .querySelector('[data-header-items]')
        ?.getAttribute('data-header-items'),
    ).toBe('Alpha,Charlie,Bravo');
    expect(
      target
        .querySelector('[data-action-items]')
        ?.getAttribute('data-action-items'),
    ).toBe('Alpha,Charlie,Bravo');
    clickSort('Count');
    expect(rowNames()).toEqual(['Bravo', 'Charlie', 'Alpha']);
    expect(header('Count').getAttribute('aria-sort')).toBe('descending');
    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(examplePages[0].map((item) => item.name)).toEqual([
      'Charlie',
      'Alpha',
      'Bravo',
    ]);
  });

  it('switches columns and keeps missing dates at the bottom in both directions', () => {
    clickSort('Count');
    clickSort('Started');
    expect(rowNames()).toEqual(['Bravo', 'Charlie', 'Alpha']);
    expect(header('Count').hasAttribute('aria-sort')).toBe(false);
    clickSort('Started');
    expect(rowNames()).toEqual(['Charlie', 'Bravo', 'Alpha']);
    expect(header('Actions').querySelector('button')).toBeNull();
  });

  it('retains sorting across fetched and cached pages without changing pagination requests', async () => {
    clickSort('Count');
    target
      .querySelector<HTMLButtonElement>('button[aria-label="Next"]')!
      .click();
    await vi.waitFor(() => expect(rowNames()).toEqual(['Delta', 'Echo']));
    expect(fetchPage).toHaveBeenLastCalledWith(3, 'page-2');
    target
      .querySelector<HTMLButtonElement>('button[aria-label="Previous"]')!
      .click();
    flushSync();
    expect(rowNames()).toEqual(['Alpha', 'Charlie', 'Bravo']);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it('does not sort when the resize handle is used and stops table shortcuts on the sort button', () => {
    const button = header('Count').querySelector('button')!;
    const windowKeydown = vi.fn();
    window.addEventListener('keydown', windowKeydown);
    button.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }),
    );
    expect(windowKeydown).not.toHaveBeenCalled();
    window.removeEventListener('keydown', windowKeydown);
    header('Count')
      .querySelector<HTMLElement>('[role="separator"]')!
      .dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          code: 'ArrowRight',
          bubbles: true,
        }),
      );
    flushSync();
    expect(rowNames()).toEqual(['Charlie', 'Alpha', 'Bravo']);
    expect(header('Count').hasAttribute('aria-sort')).toBe(false);
  });

  it('falls back to API order when the sorted column is removed', () => {
    clickSort('Count');
    component.removeCountSort();
    flushSync();
    expect(rowNames()).toEqual(['Charlie', 'Alpha', 'Bravo']);
    expect(header('Count').querySelector('button')).toBeNull();
    expect(header('Count').hasAttribute('aria-sort')).toBe(false);
  });
});
