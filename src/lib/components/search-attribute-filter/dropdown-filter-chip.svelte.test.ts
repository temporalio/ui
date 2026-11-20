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
  Object.defineProperty(Element.prototype, 'animate', {
    configurable: true,
    value: () => ({ cancel() {} }) as Animation,
  });
});

let component: ReturnType<typeof mount> | undefined;

const mountChip = (filter: SearchAttributeFilter, onRemove = vi.fn()) => {
  const target = document.createElement('div');
  document.body.appendChild(target);
  component = mount(DropdownFilterChip, {
    target,
    props: { filter, onUpdate: vi.fn(), onRemove },
  });
  flushSync();
  return target;
};

const openChip = (target: HTMLElement) => {
  target.querySelector('button')?.click();
  flushSync();
};

const byTestId = (testId: string) =>
  document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  document.body.innerHTML = '';
  delete (Element.prototype as { animate?: unknown }).animate;
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

  it('opens the editor for a filter it can edit', () => {
    const target = mountChip(
      createFilter({
        attribute: 'WorkflowId',
        conditional: 'STARTS_WITH',
        value: 'abc',
      }),
    );

    openChip(target);

    expect(byTestId('apply-filter-button')).not.toBeNull();
    expect(byTestId('read-only-filter')).toBeNull();
  });

  it.each([
    createFilter({
      attribute: 'WorkflowId',
      conditional: 'STARTS_WITH',
      value: 'abc',
      negated: true,
    }),
    createFilter({
      attribute: 'ExecutionStatus',
      conditional: 'NOT IN',
      value: '("Terminated", "Canceled")',
    }),
  ])('only offers Remove for $attribute $conditional', (filter) => {
    const onRemove = vi.fn();
    const target = mountChip(filter, onRemove);

    openChip(target);

    expect(byTestId('apply-filter-button')).toBeNull();
    expect(byTestId('read-only-filter')).not.toBeNull();

    byTestId('remove-filter-button')?.click();
    flushSync();

    expect(onRemove).toHaveBeenCalledOnce();
  });
});
