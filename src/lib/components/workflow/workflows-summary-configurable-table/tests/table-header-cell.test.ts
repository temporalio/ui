import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { WorkflowHeaderLabels } from '$lib/stores/workflow-table-columns';

import TableHeaderCell from '../table-header-cell.svelte';

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
