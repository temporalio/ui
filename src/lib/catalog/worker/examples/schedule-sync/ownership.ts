import type { JsonValue } from '../../../browser/types.js';
import type { CatalogDesiredSchedule } from '../../schedule-declarations.js';

export const catalogScheduleMemoKey = 'uiCatalog';

export const catalogScheduleSyncExampleId = 'schedule-sync';

export const catalogScheduleSyncScheduleId = 'ui-catalog-schedule-sync';

export const catalogScheduleSyncCronExpression = '0 * * * *';

export type CatalogScheduleOwnership = {
  exampleId: string;
  targetId?: string;
};

export const isCatalogOwned = (
  memo: unknown,
): memo is Record<string, CatalogScheduleOwnership> => {
  if (typeof memo !== 'object' || memo === null) return false;

  const ownership = (memo as Record<string, unknown>)[catalogScheduleMemoKey];

  if (typeof ownership !== 'object' || ownership === null) return false;

  const { exampleId } = ownership as Record<string, unknown>;

  return typeof exampleId === 'string' && exampleId.length > 0;
};

export const catalogScheduleOwnership = (
  exampleId: string,
): CatalogScheduleOwnership => ({ exampleId });

export const managerScheduleEntry = (
  declared: readonly CatalogDesiredSchedule[],
  {
    namespace,
    taskQueue,
    workflowType,
  }: { namespace: string; taskQueue: string; workflowType: string },
): CatalogDesiredSchedule => ({
  id: catalogScheduleSyncScheduleId,
  namespace,
  taskQueue,
  workflowType,
  exampleId: catalogScheduleSyncExampleId,
  spec: { cronExpressions: [catalogScheduleSyncCronExpression] },
  args: [declared as unknown as JsonValue],
  paused: false,
});
