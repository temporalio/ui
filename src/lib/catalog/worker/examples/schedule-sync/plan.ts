import type { CatalogDesiredSchedule } from '../../schedule-declarations.js';

export type ExistingCatalogSchedule = {
  id: string;
  owned: boolean;
  exampleId?: string;
};

export type BlockedCatalogSchedule = {
  id: string;
  reason: 'foreign';
};

export type CatalogSchedulePlan = {
  create: CatalogDesiredSchedule[];
  update: CatalogDesiredSchedule[];
  delete: string[];
  blocked: BlockedCatalogSchedule[];
};

export type CatalogSchedulePlanResult = {
  created: string[];
  updated: string[];
  deleted: string[];
  blocked: string[];
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
  };

  for (const schedule of desired) {
    const match = existingById.get(schedule.id);

    if (!match) {
      plan.create.push(schedule);
      continue;
    }

    if (match.owned) {
      plan.update.push(schedule);
      continue;
    }

    plan.blocked.push({ id: schedule.id, reason: 'foreign' });
  }

  for (const entry of existing) {
    if (!entry.owned || desiredIds.has(entry.id)) continue;

    plan.delete.push(entry.id);
  }

  return plan;
};
