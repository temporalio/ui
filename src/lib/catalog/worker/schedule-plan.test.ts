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
        held: [],
      },
    );
  });

  it('updates a desired schedule the catalog already owns', () => {
    const schedule = desiredSchedule('hello-hourly');

    expect(
      planCatalogSchedules({
        desired: [schedule],
        existing: [
          {
            id: 'hello-hourly',
            owned: true,
            paused: false,
            exampleId: 'hello',
          },
        ],
      }),
    ).toEqual({
      create: [],
      update: [schedule],
      delete: [],
      blocked: [],
      held: [],
    });
  });

  it('blocks a desired id that belongs to a schedule the catalog does not own', () => {
    expect(
      planCatalogSchedules({
        desired: [desiredSchedule('hello-hourly')],
        existing: [{ id: 'hello-hourly', owned: false, paused: false }],
      }),
    ).toEqual({
      create: [],
      update: [],
      delete: [],
      blocked: [{ id: 'hello-hourly', reason: 'foreign' }],
      held: [],
    });
  });

  it('deletes an owned schedule that no example declares any more', () => {
    expect(
      planCatalogSchedules({
        desired: [],
        existing: [
          {
            id: 'retired-hourly',
            owned: true,
            paused: false,
            exampleId: 'retired',
          },
        ],
      }),
    ).toEqual({
      create: [],
      update: [],
      delete: ['retired-hourly'],
      blocked: [],
      held: [],
    });
  });

  it('never deletes a schedule the catalog does not own', () => {
    expect(
      planCatalogSchedules({
        desired: [],
        existing: [{ id: 'someone-elses-hourly', owned: false, paused: false }],
      }),
    ).toEqual({
      create: [],
      update: [],
      delete: [],
      blocked: [],
      held: [],
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
        { id: 'hello-hourly', owned: true, paused: false, exampleId: 'hello' },
        {
          id: 'ui-catalog-schedule-sync',
          owned: true,
          paused: false,
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

  it('holds a declared schedule somebody paused by hand', () => {
    const schedule = desiredSchedule('hello-hourly');
    const plan = planCatalogSchedules({
      desired: [schedule],
      existing: [
        { id: 'hello-hourly', owned: true, paused: true, exampleId: 'hello' },
      ],
    });

    expect(plan.held).toEqual([
      { id: 'hello-hourly', reason: 'paused-by-hand' },
    ]);
    expect(plan.update).toEqual([]);
  });

  it('holds a declared schedule somebody resumed by hand', () => {
    const schedule = { ...desiredSchedule('hello-hourly'), paused: true };
    const plan = planCatalogSchedules({
      desired: [schedule],
      existing: [
        { id: 'hello-hourly', owned: true, paused: false, exampleId: 'hello' },
      ],
    });

    expect(plan.held).toEqual([
      { id: 'hello-hourly', reason: 'resumed-by-hand' },
    ]);
    expect(plan.update).toEqual([]);
  });

  it('holds a paused schedule no example declares any more', () => {
    const plan = planCatalogSchedules({
      desired: [],
      existing: [
        {
          id: 'retired-hourly',
          owned: true,
          paused: true,
          exampleId: 'retired',
        },
      ],
    });

    expect(plan.held).toEqual([
      { id: 'retired-hourly', reason: 'paused-orphan' },
    ]);
    expect(plan.delete).toEqual([]);
  });

  it('blocks a foreign schedule rather than holding it, whatever its state', () => {
    const plan = planCatalogSchedules({
      desired: [desiredSchedule('hello-hourly')],
      existing: [{ id: 'hello-hourly', owned: false, paused: true }],
    });

    expect(plan.blocked).toEqual([{ id: 'hello-hourly', reason: 'foreign' }]);
    expect(plan.held).toEqual([]);
  });

  it('reconciles a held schedule again once its state matches the declaration', () => {
    const schedule = desiredSchedule('hello-hourly');
    const held = planCatalogSchedules({
      desired: [schedule],
      existing: [
        { id: 'hello-hourly', owned: true, paused: true, exampleId: 'hello' },
      ],
    });
    const resumed = planCatalogSchedules({
      desired: [schedule],
      existing: [
        { id: 'hello-hourly', owned: true, paused: false, exampleId: 'hello' },
      ],
    });

    expect(held.update).toEqual([]);
    expect(resumed.held).toEqual([]);
    expect(resumed.update).toEqual([schedule]);
  });

  it('sorts every desired schedule into exactly one bucket', () => {
    const created = desiredSchedule('created-hourly');
    const updated = desiredSchedule('updated-hourly');
    const foreign = desiredSchedule('foreign-hourly');
    const plan = planCatalogSchedules({
      desired: [created, updated, foreign],
      existing: [
        {
          id: 'updated-hourly',
          owned: true,
          paused: false,
          exampleId: 'hello',
        },
        { id: 'foreign-hourly', owned: false, paused: false },
        {
          id: 'retired-hourly',
          owned: true,
          paused: false,
          exampleId: 'retired',
        },
      ],
    });

    expect(plan).toEqual({
      create: [created],
      update: [updated],
      delete: ['retired-hourly'],
      blocked: [{ id: 'foreign-hourly', reason: 'foreign' }],
      held: [],
    });
  });
});
