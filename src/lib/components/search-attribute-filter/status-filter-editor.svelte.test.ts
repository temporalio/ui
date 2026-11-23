import { writable } from 'svelte/store';

import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  MENU_CONTEXT,
  type MenuContext,
} from '$lib/holocene/menu/menu-container.svelte';
import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import {
  activityStatusFilter,
  nexusOperationStatusFilter,
  type StatusFilter,
  workerStatusFilter,
  workflowStatusFilter,
} from '$lib/models/status-filter';
import { createFilter } from '$lib/utilities/query/to-list-workflow-filters';

import StatusFilterEditor from './status-filter-editor.svelte';

let component: ReturnType<typeof mount> | undefined;

const mountEditor = ({
  statusFilter = workflowStatusFilter,
  filters = [],
}: {
  statusFilter?: StatusFilter;
  filters?: SearchAttributeFilter[];
} = {}) => {
  const props = $state({
    statusFilter,
    filters,
    onUpdate: vi.fn((next: SearchAttributeFilter[]) => {
      props.filters = next;
    }),
  });
  const target = document.createElement('div');
  document.body.appendChild(target);
  component = mount(StatusFilterEditor, {
    target,
    props,
    context: new Map<string, MenuContext>([
      [
        MENU_CONTEXT,
        {
          open: writable(true),
          keepOpen: writable(true),
          menuElement: writable(null),
        },
      ],
    ]),
  });
  flushSync();
  return { target, props, onUpdate: props.onUpdate };
};

const checkbox = (target: HTMLElement, status: string) =>
  target.querySelector<HTMLInputElement>(
    `[data-testid="status-dropdown-filter-chip-${status}"] input[type="checkbox"]`,
  );

const select = (target: HTMLElement, status: string) => {
  target
    .querySelector<HTMLElement>(
      `[data-testid="status-dropdown-filter-chip-${status}"]`,
    )
    ?.click();
  flushSync();
};

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  document.body.innerHTML = '';
});

describe('StatusFilterEditor', () => {
  it.each([
    ['ExecutionStatus', workflowStatusFilter, 'Filter by Execution Status'],
    ['WorkerStatus', workerStatusFilter, 'Filter by Worker Status'],
  ])('labels the %s editor', (_, statusFilter, heading) => {
    const { target } = mountEditor({ statusFilter });

    expect(target.querySelector('h3')?.textContent?.trim()).toBe(heading);
  });

  it.each([
    [
      'workflow',
      workflowStatusFilter,
      [
        'All',
        'Running',
        'Paused',
        'TimedOut',
        'Completed',
        'Failed',
        'ContinuedAsNew',
        'Canceled',
        'Terminated',
      ],
    ],
    [
      'activity',
      activityStatusFilter,
      [
        'All',
        'Running',
        'Paused',
        'Completed',
        'Failed',
        'Canceled',
        'Terminated',
        'TimedOut',
      ],
    ],
    [
      'Nexus operation',
      nexusOperationStatusFilter,
      [
        'All',
        'Running',
        'Completed',
        'Failed',
        'Canceled',
        'Terminated',
        'TimedOut',
      ],
    ],
    ['worker', workerStatusFilter, ['All', 'Running', 'ShuttingDown']],
  ])('offers only %s statuses', (_, statusFilter, expected) => {
    const { target } = mountEditor({ statusFilter });

    const options = Array.from(
      target.querySelectorAll('[data-testid^="status-dropdown-filter-chip-"]'),
    ).map((el) =>
      el
        .getAttribute('data-testid')
        ?.replace('status-dropdown-filter-chip-', ''),
    );

    expect(options).toEqual(expected);
  });

  it('checks All when no status is selected', () => {
    const { target } = mountEditor();

    expect(checkbox(target, 'All')?.checked).toBe(true);
    expect(checkbox(target, 'Running')?.checked).toBe(false);
  });

  it('checks All again after the last status is unselected', () => {
    const running = createFilter({
      attribute: 'ExecutionStatus',
      value: 'Running',
      conditional: '=',
    });
    const { target, onUpdate } = mountEditor({ filters: [running] });

    expect(checkbox(target, 'All')?.checked).toBe(false);

    select(target, 'Running');

    expect(onUpdate).toHaveBeenLastCalledWith([]);
    expect(checkbox(target, 'All')?.checked).toBe(true);
  });

  it('groups a second status into an OR with the first', () => {
    const { target, onUpdate } = mountEditor();

    select(target, 'Running');
    select(target, 'Failed');

    expect(onUpdate).toHaveBeenLastCalledWith([
      expect.objectContaining({
        value: 'Running',
        operator: 'OR',
        parenthesis: '(',
      }),
      expect.objectContaining({ value: 'Failed', parenthesis: ')' }),
    ]);
  });

  it('never changes filters it has already handed to onUpdate', () => {
    const { target, onUpdate } = mountEditor();

    select(target, 'Running');
    const [[firstUpdate]] = onUpdate.mock.calls;
    const [running] = firstUpdate;
    const before = { ...running };

    select(target, 'Failed');

    expect(running).toEqual(before);
    expect(onUpdate).toHaveBeenLastCalledWith([
      expect.objectContaining({ value: 'Running', operator: 'OR' }),
      expect.objectContaining({ value: 'Failed' }),
    ]);
  });

  it('reflects filters changed by its parent', () => {
    const { target, props } = mountEditor();

    props.filters = [
      createFilter({
        attribute: 'ExecutionStatus',
        value: 'Running',
        conditional: '=',
      }),
    ];
    flushSync();

    expect(checkbox(target, 'Running')?.checked).toBe(true);
    expect(checkbox(target, 'All')?.checked).toBe(false);
  });

  it('does not change the filters it was seeded with', () => {
    const running = createFilter({
      attribute: 'ExecutionStatus',
      value: 'Running',
      conditional: '=',
    });
    const before = { ...running };
    const { target } = mountEditor({ filters: [running] });

    select(target, 'Failed');

    expect(running).toEqual(before);
  });
});
