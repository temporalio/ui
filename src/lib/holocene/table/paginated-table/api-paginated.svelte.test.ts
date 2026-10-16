import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Harness, {
  examplePages,
  type SortableItem,
} from './api-paginated-sort-harness.svelte';

describe('API paginated table sorting', () => {
  let target: HTMLDivElement;
  let component: { removeCountSort: () => void; refresh: () => void };
  const onItemsChange = vi.fn();
  const fetchPage = vi.fn(async (_size: number, token: string) => ({
    items: examplePages[token ? 1 : 0],
    nextPageToken: token ? '' : 'page-2',
  }));
  const rowNames = () =>
    Array.from(target.querySelectorAll('tbody tr[data-name]')).map((row) =>
      row.getAttribute('data-name'),
    );
  const sortBanner = () =>
    target.querySelector('[data-testid="table-sort-banner"]');
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
      props: { onFetch: async () => fetchPage, onItemsChange, total: 5 },
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
    expect(sortBanner()).toBeNull();
    expect(header('Count').hasAttribute('aria-sort')).toBe(false);
    clickSort('Count');
    expect(rowNames()).toEqual(['Alpha', 'Charlie', 'Bravo']);
    expect(header('Count').getAttribute('aria-sort')).toBe('ascending');
    expect(sortBanner()?.textContent).toContain(
      'Sorted by Count on this page only (3 of 5)',
    );
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
    expect(sortBanner()?.textContent).toContain(
      'Sorted by Started on this page only (3 of 5)',
    );
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
    expect(sortBanner()?.textContent).toContain('(2 of 5)');
    expect(fetchPage).toHaveBeenLastCalledWith(3, 'page-2');
    target
      .querySelector<HTMLButtonElement>('button[aria-label="Previous"]')!
      .click();
    flushSync();
    expect(rowNames()).toEqual(['Alpha', 'Charlie', 'Bravo']);
    expect(sortBanner()?.textContent).toContain('(3 of 5)');
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it.each(['ascending', 'descending'] as const)(
    'clears a %s sort without fetching or changing pages and stays cleared on refresh',
    async (direction) => {
      clickSort('Count');
      if (direction === 'descending') clickSort('Count');
      target
        .querySelector<HTMLButtonElement>('button[aria-label="Next"]')!
        .click();
      await vi.waitFor(() => expect(rowNames()).toHaveLength(2));

      const clearButton = sortBanner()!.querySelector('button')!;
      const windowKeydown = vi.fn();
      window.addEventListener('keydown', windowKeydown);
      clearButton.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: ' ',
          code: 'Space',
          bubbles: true,
        }),
      );
      expect(windowKeydown).not.toHaveBeenCalled();
      window.removeEventListener('keydown', windowKeydown);
      clearButton.click();
      flushSync();

      expect(sortBanner()).toBeNull();
      expect(header('Count').hasAttribute('aria-sort')).toBe(false);
      expect(rowNames()).toEqual(['Echo', 'Delta']);
      expect(fetchPage).toHaveBeenCalledTimes(2);
      expect(
        onItemsChange.mock.lastCall?.[0].map((item: SortableItem) => item.name),
      ).toEqual(rowNames());

      component.refresh();
      flushSync();
      await vi.waitFor(() =>
        expect(rowNames()).toEqual(['Charlie', 'Alpha', 'Bravo']),
      );
      expect(sortBanner()).toBeNull();
      expect(header('Count').hasAttribute('aria-sort')).toBe(false);
    },
  );

  it('omits the count when the total is unknown', async () => {
    await unmount(component);
    component = mount(Harness, {
      target,
      props: { onFetch: async () => fetchPage },
    });
    flushSync();
    await vi.waitFor(() => expect(rowNames()).toHaveLength(3));

    clickSort('Count');
    expect(
      sortBanner()?.querySelector('[role="status"]')?.textContent?.trim(),
    ).toBe('Sorted by Count on this page only');
  });

  it('keeps the banner without stale counts while refreshing and shows zero for empty results', async () => {
    clickSort('Count');
    let resolveRefresh!: (value: {
      items: SortableItem[];
      nextPageToken: string;
    }) => void;
    fetchPage.mockImplementationOnce(
      () => new Promise((resolve) => (resolveRefresh = resolve)),
    );

    component.refresh();
    flushSync();
    await vi.waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(2));
    expect(
      sortBanner()?.querySelector('[role="status"]')?.textContent?.trim(),
    ).toBe('Sorted by Count on this page only');

    resolveRefresh({ items: [], nextPageToken: '' });
    await vi.waitFor(() =>
      expect(sortBanner()?.textContent).toContain('(0 of 0)'),
    );
  });

  it.each(['ascending', 'descending'] as const)(
    'preserves a bound %s sort when refreshing with new results',
    async (direction) => {
      clickSort('Count');
      if (direction === 'descending') clickSort('Count');
      fetchPage.mockResolvedValueOnce({
        items: examplePages[1],
        nextPageToken: '',
      });

      component.refresh();
      flushSync();

      await vi.waitFor(() =>
        expect(rowNames()).toEqual(
          direction === 'ascending' ? ['Delta', 'Echo'] : ['Echo', 'Delta'],
        ),
      );
      expect(header('Count').getAttribute('aria-sort')).toBe(direction);
      expect(sortBanner()?.textContent).toContain(
        'Sorted by Count on this page only (2 of 2)',
      );
      expect(fetchPage).toHaveBeenCalledTimes(2);
      expect(fetchPage).toHaveBeenLastCalledWith(3, '');
      expect(
        onItemsChange.mock.lastCall?.[0].map((item: SortableItem) => item.name),
      ).toEqual(rowNames());
    },
  );

  it('clears sorting when the parent is remounted, as on a browser reload', async () => {
    clickSort('Count');
    expect(rowNames()).toEqual(['Alpha', 'Charlie', 'Bravo']);

    await unmount(component);
    component = mount(Harness, {
      target,
      props: { onFetch: async () => fetchPage, onItemsChange },
    });
    flushSync();

    await vi.waitFor(() =>
      expect(rowNames()).toEqual(['Charlie', 'Alpha', 'Bravo']),
    );
    expect(header('Count').hasAttribute('aria-sort')).toBe(false);
    expect(sortBanner()).toBeNull();
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
    expect(sortBanner()).toBeNull();
  });
});
