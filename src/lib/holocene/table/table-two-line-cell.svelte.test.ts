import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import TableTwoLineCell from './table-two-line-cell.svelte';

const primary = createRawSnippet(() => ({
  render: () => '<a href="/workflow">workflow-id</a>',
}));
const secondary = createRawSnippet(() => ({
  render: () => '<span>Workflow Execution</span>',
}));

let component: ReturnType<typeof mount> | undefined;

const mountCell = (props: Record<string, unknown> = {}) => {
  const table = document.createElement('table');
  const row = table.createTBody().insertRow();
  document.body.appendChild(table);
  component = mount(TableTwoLineCell, { target: row, props });
  flushSync();
  const cell = row.querySelector('td') as HTMLTableCellElement;
  return {
    cell,
    primaryLine: cell.querySelector(
      '[data-testid="two-line-cell-primary"]',
    ) as HTMLElement,
    secondaryLine: cell.querySelector(
      '[data-testid="two-line-cell-secondary"]',
    ) as HTMLElement,
  };
};

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  document.body.innerHTML = '';
});

describe('TableTwoLineCell', () => {
  it('renders the primary and secondary content on separate lines', () => {
    const { primaryLine, secondaryLine } = mountCell({ primary, secondary });

    expect(primaryLine.querySelector('a')?.textContent).toBe('workflow-id');
    expect(secondaryLine.textContent).toContain('Workflow Execution');
  });

  it('renders the secondary line one text size smaller than the primary line', () => {
    const { primaryLine, secondaryLine } = mountCell({ primary, secondary });

    expect(primaryLine.classList.contains('text-xs')).toBe(false);
    expect(secondaryLine.classList.contains('text-xs')).toBe(true);
    expect(secondaryLine.classList.contains('text-secondary')).toBe(true);
  });

  it('pads the cell 8px top and bottom', () => {
    const { cell } = mountCell({ primary, secondary });

    expect(cell.classList.contains('py-2')).toBe(true);
  });

  it('reserves both lines when there is no content', () => {
    const { primaryLine, secondaryLine } = mountCell();

    expect(primaryLine.classList.contains('min-h-[1lh]')).toBe(true);
    expect(secondaryLine.classList.contains('min-h-[1lh]')).toBe(true);
    expect(primaryLine.textContent?.trim()).toBe('');
    expect(secondaryLine.textContent?.trim()).toBe('');
  });

  it('passes attributes and classes through to the cell', () => {
    const { cell } = mountCell({
      primary,
      'data-testid': 'target-execution',
      class: 'w-40',
    });

    expect(cell.dataset.testid).toBe('target-execution');
    expect(cell.classList.contains('w-40')).toBe(true);
    expect(cell.classList.contains('py-2')).toBe(true);
  });
});
