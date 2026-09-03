import { proxyActivities, workflowInfo } from '@temporalio/workflow';

import { managerScheduleEntry } from './ownership.js';
import {
  type CatalogSchedulePlanResult,
  planCatalogSchedules,
} from './plan.js';
import type { CatalogDesiredSchedule } from '../../schedule-declarations.js';

const { applyCatalogSchedulePlan, listCatalogSchedules } = proxyActivities<
  typeof import('./activities.js')
>({ startToCloseTimeout: '30 seconds' });

export async function catalogScheduleSync(
  declared: CatalogDesiredSchedule[] = [],
): Promise<CatalogSchedulePlanResult> {
  const { namespace, taskQueue, workflowType } = workflowInfo();
  const desired = [
    ...declared,
    managerScheduleEntry(declared, { namespace, taskQueue, workflowType }),
  ];
  const namespaces = [
    ...new Set(desired.map((schedule) => schedule.namespace)),
  ];
  const merged: CatalogSchedulePlanResult = {
    created: [],
    updated: [],
    deleted: [],
    blocked: [],
    errors: [],
  };

  for (const target of namespaces) {
    const existing = await listCatalogSchedules({ namespace: target });
    const plan = planCatalogSchedules({
      desired: desired.filter((schedule) => schedule.namespace === target),
      existing,
    });
    const result = await applyCatalogSchedulePlan({ namespace: target, plan });

    merged.created.push(...result.created);
    merged.updated.push(...result.updated);
    merged.deleted.push(...result.deleted);
    merged.blocked.push(...result.blocked);
    merged.errors.push(...result.errors);
  }

  return merged;
}
