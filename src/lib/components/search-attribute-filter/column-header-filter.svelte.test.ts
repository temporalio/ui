import { get, writable, type Writable } from 'svelte/store';

import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import type { SearchAttributeType } from '$lib/types/workflows';
import { createFilter } from '$lib/utilities/query/to-list-workflow-filters';

import ColumnHeaderFilter from './column-header-filter.svelte';

vi.mock(
  '$lib/utilities/query/to-list-workflow-filters',
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import('$lib/utilities/query/to-list-workflow-filters')
    >()),
    updateQueryParamsFromFilter: vi.fn(),
  }),
);

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

const mountFilter = ({
  attribute = 'WorkflowType',
  type = 'Keyword',
  filters = [],
  conditionals,
}: {
  attribute?: string;
  type?: SearchAttributeType;
  filters?: SearchAttributeFilter[];
  conditionals?: string[];
} = {}) => {
  const store: Writable<SearchAttributeFilter[]> = writable(filters);
  const target = document.createElement('div');
  document.body.appendChild(target);
  component = mount(ColumnHeaderFilter, {
    target,
    props: { attribute, type, label: attribute, filters: store, conditionals },
  });
  flushSync();

  const button = document.querySelector<HTMLButtonElement>(
    `[data-testid="column-header-filter-${attribute}"]`,
  );
  if (!button) throw new Error('column header filter button not rendered');

  const open = () => {
    button.click();
    flushSync();
  };

  return { store, button, open };
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

const workflowType = (value = 'hello') =>
  createFilter({
    id: 'wtype',
    attribute: 'WorkflowType',
    type: 'Keyword',
    value,
    conditional: '=',
  });

describe('ColumnHeaderFilter', () => {
  it('shows no filtered indicator or Remove for an unfiltered column', () => {
    const { button, open } = mountFilter();

    expect(button.dataset.filtered).toBe('false');
    expect(byTestId('column-header-filter-indicator')).toBeNull();

    open();

    expect(byTestId('apply-filter-button')).not.toBeNull();
    expect(byTestId('remove-filter-button')).toBeNull();
  });

  it('shows the filtered indicator and Remove when the column is filtered', () => {
    const { button, open } = mountFilter({ filters: [workflowType()] });

    expect(button.dataset.filtered).toBe('true');
    expect(byTestId('column-header-filter-indicator')).not.toBeNull();

    open();

    expect(byTestId('remove-filter-button')).not.toBeNull();
  });

  it('treats a blank, never-applied filter as unfiltered', () => {
    const { button, open } = mountFilter({ filters: [workflowType('')] });

    expect(button.dataset.filtered).toBe('false');

    open();

    expect(byTestId('remove-filter-button')).toBeNull();
  });

  it('removes the column filter and closes the menu', () => {
    const other = createFilter({
      id: 'wid',
      attribute: 'WorkflowId',
      value: 'abc',
      conditional: '=',
    });
    const { store, button, open } = mountFilter({
      filters: [other, workflowType()],
    });

    open();
    byTestId('remove-filter-button')?.click();
    flushSync();

    expect(get(store).map((filter) => filter.id)).toEqual(['wid']);
    expect(button.dataset.filtered).toBe('false');
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('offers Remove only for the filter the menu opened with', () => {
    const { store, open } = mountFilter();

    open();
    store.set([workflowType()]);
    flushSync();

    expect(byTestId('remove-filter-button')).toBeNull();
  });

  it('applies when Enter is pressed on the open filter button', () => {
    const { button, open } = mountFilter({ filters: [workflowType()] });

    open();
    button.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    flushSync();

    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps table keyboard shortcuts from seeing keys on the filter button', () => {
    const { button } = mountFilter();
    const onWindowKeydown = vi.fn();
    window.addEventListener('keydown', onWindowKeydown);

    button.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
    );

    window.removeEventListener('keydown', onWindowKeydown);
    expect(onWindowKeydown).not.toHaveBeenCalled();
  });

  it('does not add a filter when applied without a value', () => {
    const { store, button, open } = mountFilter();

    open();
    byTestId('apply-filter-button')?.click();
    flushSync();

    expect(get(store)).toEqual([]);
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('removes the column filter when its value is cleared and applied', () => {
    const { store, open } = mountFilter({ filters: [workflowType()] });

    open();
    const input = document.querySelector<HTMLInputElement>(
      'form input[type="text"], form input:not([type])',
    );
    if (!input) throw new Error('value input not rendered');
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    flushSync();
    byTestId('apply-filter-button')?.click();
    flushSync();

    expect(get(store)).toEqual([]);
  });

  it('offers only the allowed operators', () => {
    const { open } = mountFilter({ conditionals: ['='] });

    open();

    expect(document.body.textContent).not.toContain('Not equal to');
    expect(document.body.textContent).not.toContain('Is null');
  });

  it('offers every operator by default', () => {
    const { open } = mountFilter();

    open();

    expect(document.body.textContent).toContain('Not equal to');
  });

  it('opens the status editor for a status attribute', () => {
    const { store, open } = mountFilter({ attribute: 'ExecutionStatus' });

    open();

    expect(document.body.textContent).toContain('Filter by Execution Status');
    expect(byTestId('apply-filter-button')).toBeNull();

    byTestId('status-dropdown-filter-chip-Running')?.click();
    flushSync();

    expect(get(store)).toEqual([
      expect.objectContaining({
        attribute: 'ExecutionStatus',
        value: 'Running',
        conditional: '=',
      }),
    ]);
  });

  it('keeps status changes made elsewhere while the menu is open', () => {
    const { store, open } = mountFilter({ attribute: 'ExecutionStatus' });

    open();
    store.set([
      createFilter({
        id: 'running',
        attribute: 'ExecutionStatus',
        value: 'Running',
        conditional: '=',
      }),
    ]);
    flushSync();

    expect(
      document
        .querySelector('[data-testid="status-dropdown-filter-chip-Running"]')
        ?.querySelector('input')?.checked,
    ).toBe(true);

    byTestId('status-dropdown-filter-chip-Failed')?.click();
    flushSync();

    expect(get(store).map((filter) => filter.value)).toEqual([
      'Running',
      'Failed',
    ]);
  });
});
