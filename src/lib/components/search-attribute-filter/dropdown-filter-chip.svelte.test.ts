import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import { createFilter } from '$lib/utilities/query/to-list-workflow-filters';

import DropdownFilterChip from './dropdown-filter-chip.svelte';

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', NoopObserver);
  vi.stubGlobal('IntersectionObserver', NoopObserver);
});

let component: ReturnType<typeof mount> | undefined;

const mountChip = (filter: SearchAttributeFilter) => {
  const target = document.createElement('div');
  document.body.appendChild(target);
  component = mount(DropdownFilterChip, {
    target,
    props: { filter, onUpdate: vi.fn(), onRemove: vi.fn() },
  });
  flushSync();
  return target;
};

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

const chipText = (target: HTMLElement) =>
  target.querySelector('button')?.textContent?.replace(/\s+/g, ' ').trim();

describe('DropdownFilterChip', () => {
  it('shows a STARTS_WITH filter without NOT', () => {
    const target = mountChip(
      createFilter({
        attribute: 'WorkflowId',
        conditional: 'STARTS_WITH',
        value: 'abc',
      }),
    );

    expect(chipText(target)).toBe('WorkflowId starts with "abc"');
  });

  it('prefixes a negated filter with NOT', () => {
    const target = mountChip(
      createFilter({
        attribute: 'WorkflowId',
        conditional: 'STARTS_WITH',
        value: 'abc',
        negated: true,
      }),
    );

    expect(chipText(target)).toBe('NOT WorkflowId starts with "abc"');
  });

  it('shows a NOT IN status filter with its conditional', () => {
    const target = mountChip(
      createFilter({
        attribute: 'ExecutionStatus',
        conditional: 'NOT IN',
        value: '("Terminated", "Canceled")',
      }),
    );

    expect(chipText(target)).toBe(
      'ExecutionStatus NOT IN ("Terminated", "Canceled")',
    );
  });

  it('prefixes a negated status filter with NOT', () => {
    const target = mountChip(
      createFilter({
        attribute: 'ExecutionStatus',
        conditional: 'IN',
        value: '("Terminated", "Canceled")',
        negated: true,
      }),
    );

    expect(chipText(target)).toBe(
      'NOT ExecutionStatus IN ("Terminated", "Canceled")',
    );
  });
});
