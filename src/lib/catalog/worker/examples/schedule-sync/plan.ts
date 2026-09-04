import type { CatalogDesiredSchedule } from '../../schedule-declarations.js';

export type ExistingCatalogSchedule = {
  id: string;
  owned: boolean;
  paused: boolean;
  exampleId?: string;
};

export type BlockedCatalogSchedule = {
  id: string;
  reason: 'foreign';
};

/**
 * A schedule whose running state was changed by a person rather than by a
 * declaration. The manager reports it and writes nothing to it until the state
 * matches the declaration again, so pausing a misbehaving schedule in the UI is
 * enough to stop it without editing code and restarting the worker.
 */
export type HeldCatalogSchedule = {
  id: string;
  reason: 'paused-by-hand' | 'paused-orphan' | 'resumed-by-hand';
};

export type CatalogSchedulePlan = {
  create: CatalogDesiredSchedule[];
  update: CatalogDesiredSchedule[];
  delete: string[];
  blocked: BlockedCatalogSchedule[];
  held: HeldCatalogSchedule[];
};

export type CatalogSchedulePlanResult = {
  created: string[];
  updated: string[];
  deleted: string[];
  blocked: string[];
  held: string[];
  errors: string[];
};

export const planCatalogSchedules = ({
  desired,
  existing,
}: {
  desired: readonly CatalogDesiredSchedule[];
  existing: readonly ExistingCatalogSchedule[];
}): CatalogSchedulePlan => {
  const existingById = new Map(existing.map((entry) => [entry.id, entry]));
  const desiredIds = new Set(desired.map(({ id }) => id));
  const plan: CatalogSchedulePlan = {
    create: [],
    update: [],
    delete: [],
    blocked: [],
    held: [],
  };

  for (const schedule of desired) {
    const match = existingById.get(schedule.id);

    if (!match) {
      plan.create.push(schedule);
      continue;
    }

    if (!match.owned) {
      plan.blocked.push({ id: schedule.id, reason: 'foreign' });
      continue;
    }

    // Drift in either direction is somebody's decision. The whole schedule is
    // skipped rather than just the flag: rewriting the spec of a schedule
    // someone paused mid-incident is the same surprise in a different form.
    if (match.paused !== schedule.paused) {
      plan.held.push({
        id: schedule.id,
        reason: match.paused ? 'paused-by-hand' : 'resumed-by-hand',
      });
      continue;
    }

    plan.update.push(schedule);
  }

  for (const entry of existing) {
    if (!entry.owned || desiredIds.has(entry.id)) continue;

    // An orphan has no declaration to compare against, so a pause is the only
    // signal available. Deleting something a person deliberately stopped is the
    // destructive half of this pair, so a paused orphan is reported instead.
    if (entry.paused) {
      plan.held.push({ id: entry.id, reason: 'paused-orphan' });
      continue;
    }

    plan.delete.push(entry.id);
  }

  return plan;
};
