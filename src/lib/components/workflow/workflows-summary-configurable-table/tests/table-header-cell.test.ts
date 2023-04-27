import { describe, test } from 'vitest';

import TableHeaderCell from '../table-header-cell.svelte';
import { WorkflowHeaderLabels } from '$lib/stores/workflow-table-columns';

let target: HTMLElement;

beforeEach(() => {
  target = document.createElement('div');
  target.setAttribute('id', 'target');
  document.body.appendChild(target);
});

afterEach(() => {
  target.remove();
});

describe(TableHeaderCell.name, () => {
  test.each(WorkflowHeaderLabels)('%s renders', (label) => {
    const column = { label, pinned: false };
    const instance = new TableHeaderCell({ target, props: { column } });

    expect(instance).toBeTruthy();
    expect(target.innerHTML).toMatchSnapshot();
  });
});
