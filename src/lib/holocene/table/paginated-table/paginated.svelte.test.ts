import { mount, unmount } from 'svelte';
import { describe, expect, it } from 'vitest';

import { page } from '$app/state';

import Paginated from './paginated.svelte';

// jsdom has no ResizeObserver; index.svelte binds element size.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;

const makeItems = () => Array.from({ length: 500 }, (_, i) => i);

const mountPaginated = (search: string, items = makeItems()) => {
  page.url = new URL(`http://localhost:3000/history${search}`);
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = mount(Paginated, {
    target,
    props: {
      items,
      perPageLabel: 'Per page',
      pageButtonLabel: (p: number) => `Page ${p}`,
      nextPageButtonLabel: 'Next',
      previousPageButtonLabel: 'Previous',
    },
  });
  return { target, component };
};

const activePage = (target: HTMLElement): string | undefined =>
  Array.from(target.querySelectorAll('button[aria-label^="Page "]'))
    .find((b) => b.className.includes('bg-interactive-secondary-active'))
    ?.textContent?.trim();

const renderedPageFor = (search: string, items = makeItems()) => {
  const { target, component } = mountPaginated(search, items);
  const rendered = activePage(target);
  unmount(component);
  target.remove();
  return rendered;
};

describe('Paginated', () => {
  it('renders the page named by the url on first paint', () => {
    expect(renderedPageFor('?page=3&per-page=100')).toBe('3');
  });

  it('honors the page across page sizes', () => {
    expect(renderedPageFor('?page=2&per-page=250')).toBe('2');
  });

  it('still renders page 1 when the url asks for it', () => {
    expect(renderedPageFor('?page=1&per-page=100')).toBe('1');
  });

  it('defaults to page 1 when the url omits a page', () => {
    expect(renderedPageFor('?per-page=100')).toBe('1');
  });

  it('clamps a page beyond the last one', () => {
    expect(renderedPageFor('?page=99&per-page=100')).toBe('5');
  });

  it('keeps the page when items are rebuilt with a new identity', () => {
    // A data refresh replaces `items` with a fresh array, reconstructing the
    // pagination store. That reconstruction must not move the user to page 1.
    expect(renderedPageFor('?page=4&per-page=100', makeItems())).toBe('4');
    expect(renderedPageFor('?page=4&per-page=100', makeItems())).toBe('4');
  });
});
