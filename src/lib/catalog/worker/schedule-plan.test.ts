import { describe, expect, it } from 'vitest';

import { managerScheduleEntry } from './examples/schedule-sync/ownership';
import { planCatalogSchedules } from './examples/schedule-sync/plan';
import type { CatalogDesiredSchedule } from './schedule-declarations';

const desiredSchedule = (id: string): CatalogDesiredSchedule => ({
  id,
  namespace: 'default',
  taskQueue: 'ui-catalog',
  workflowType: 'hello',
  exampleId: 'hello',
  spec: { cronExpressions: ['0 * * * *'] },
  args: ['Temporal'],
  paused: false,
});

describe('planCatalogSchedules', () => {
  it('creates a desired schedule the server does not have', () => {
    const schedule = desiredSchedule('hello-hourly');

    expect(planCatalogSchedules({ desired: [schedule], existing: [] })).toEqual(
      {
        create: [schedule],
        update: [],
        delete: [],
        blocked: [],
      },
    );
  });

  it('updates a desired schedule the catalog already owns', () => {
    const schedule = desiredSchedule('hello-hourly');

    expect(
      planCatalogSchedules({
        desired: [schedule],
        existing: [{ id: 'hello-hourly', owned: true, exampleId: 'hello' }],
      }),
    ).toEqual({
      create: [],
      update: [schedule],
      delete: [],
      blocked: [],
    });
  });

  it('blocks a desired id that belongs to a schedule the catalog does not own', () => {
    expect(
      planCatalogSchedules({
        desired: [desiredSchedule('hello-hourly')],
        existing: [{ id: 'hello-hourly', owned: false }],
      }),
    ).toEqual({
      create: [],
      update: [],
      delete: [],
      blocked: [{ id: 'hello-hourly', reason: 'foreign' }],
    });
  });

  it('deletes an owned schedule that no example declares any more', () => {
    expect(
      planCatalogSchedules({
        desired: [],
        existing: [{ id: 'retired-hourly', owned: true, exampleId: 'retired' }],
      }),
    ).toEqual({
      create: [],
      update: [],
      delete: ['retired-hourly'],
      blocked: [],
    });
  });

  it('never deletes a schedule the catalog does not own', () => {
    expect(
      planCatalogSchedules({
        desired: [],
        existing: [{ id: 'someone-elses-hourly', owned: false }],
      }),
    ).toEqual({
      create: [],
      update: [],
      delete: [],
      blocked: [],
    });
  });

  it('keeps the manager schedule because it is part of the desired set', () => {
    const declared = [desiredSchedule('hello-hourly')];
    const manager = managerScheduleEntry(declared, {
      namespace: 'default',
      taskQueue: 'ui-catalog',
      workflowType: 'catalogScheduleSync',
    });
    const plan = planCatalogSchedules({
      desired: [...declared, manager],
      existing: [
        { id: 'hello-hourly', owned: true, exampleId: 'hello' },
        {
          id: 'ui-catalog-schedule-sync',
          owned: true,
          exampleId: 'schedule-sync',
        },
      ],
    });

    expect(plan.delete).toEqual([]);
    expect(plan.update.map(({ id }) => id)).toEqual([
      'hello-hourly',
      'ui-catalog-schedule-sync',
    ]);
  });

  it('sorts every desired schedule into exactly one bucket', () => {
    const created = desiredSchedule('created-hourly');
    const updated = desiredSchedule('updated-hourly');
    const foreign = desiredSchedule('foreign-hourly');
    const plan = planCatalogSchedules({
      desired: [created, updated, foreign],
      existing: [
        { id: 'updated-hourly', owned: true, exampleId: 'hello' },
        { id: 'foreign-hourly', owned: false },
        { id: 'retired-hourly', owned: true, exampleId: 'retired' },
      ],
    });

    expect(plan).toEqual({
      create: [created],
      update: [updated],
      delete: ['retired-hourly'],
      blocked: [{ id: 'foreign-hourly', reason: 'foreign' }],
    });
  });
});
