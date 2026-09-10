import { describe, expect, it } from 'vitest';

import {
  catalogScheduleMemoKey,
  isCatalogOwned,
  managerScheduleEntry,
} from './examples/schedule-sync/ownership';
import type { CatalogDesiredSchedule } from './schedule-declarations';

const declared: CatalogDesiredSchedule[] = [
  {
    id: 'ui-catalog-hello-hourly',
    namespace: 'default',
    taskQueue: 'ui-catalog',
    workflowType: 'hello',
    exampleId: 'hello',
    spec: { cronExpressions: ['0 * * * *'] },
    args: ['Temporal'],
    paused: false,
  },
];

describe('isCatalogOwned', () => {
  it('recognizes a schedule the catalog stamped with its memo', () => {
    expect(
      isCatalogOwned({ [catalogScheduleMemoKey]: { exampleId: 'hello' } }),
    ).toBe(true);
  });

  it('rejects a memo without the catalog key', () => {
    expect(isCatalogOwned({ other: { exampleId: 'hello' } })).toBe(false);
  });

  it('rejects a catalog memo without an example id', () => {
    expect(
      isCatalogOwned({ [catalogScheduleMemoKey]: { exampleId: '' } }),
    ).toBe(false);
    expect(isCatalogOwned({ [catalogScheduleMemoKey]: 'hello' })).toBe(false);
  });

  it('rejects a missing memo', () => {
    expect(isCatalogOwned(undefined)).toBe(false);
    expect(isCatalogOwned(null)).toBe(false);
  });
});

describe('managerScheduleEntry', () => {
  it('describes an hourly manager schedule carrying the declared schedules', () => {
    expect(
      managerScheduleEntry(declared, {
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'catalogScheduleSync',
      }),
    ).toEqual({
      id: 'ui-catalog-schedule-sync',
      namespace: 'default',
      taskQueue: 'ui-catalog',
      workflowType: 'catalogScheduleSync',
      exampleId: 'schedule-sync',
      spec: { cronExpressions: ['0 * * * *'] },
      args: [declared],
      paused: false,
    });
  });
});
