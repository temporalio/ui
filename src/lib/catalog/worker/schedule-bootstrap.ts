import {
  catalogScheduleSyncExampleId,
  catalogScheduleSyncScheduleId,
  managerScheduleEntry,
} from './examples/schedule-sync/ownership.js';
import type { CatalogWorkerBinding } from './registry.js';
import {
  type CatalogDesiredSchedule,
  declaredSchedules,
} from './schedule-declarations.js';

export type CatalogScheduleBootstrapEvent = {
  state: 'blocked' | 'created' | 'skipped' | 'triggered' | 'updated';
  scheduleId: string;
  namespace?: string;
  taskQueue?: string;
  declaredCount?: number;
  reason?: string;
  error?: unknown;
};

export const bootstrapCatalogScheduleSync = async ({
  bindings,
  describeManager,
  createManager,
  updateManagerArgs,
  triggerManager,
  onEvent,
}: {
  bindings: readonly CatalogWorkerBinding[];
  describeManager: (
    entry: CatalogDesiredSchedule,
  ) => Promise<{ exists: boolean }>;
  createManager: (entry: CatalogDesiredSchedule) => Promise<void>;
  updateManagerArgs: (entry: CatalogDesiredSchedule) => Promise<void>;
  triggerManager: (entry: CatalogDesiredSchedule) => Promise<void>;
  onEvent: (event: CatalogScheduleBootstrapEvent) => void;
}): Promise<void> => {
  const declared = declaredSchedules(bindings);
  const manager = bindings
    .flatMap(({ target, examples }) =>
      examples.map((example) => ({ target, example })),
    )
    .find(({ example }) => example.id === catalogScheduleSyncExampleId);

  if (!manager || manager.example.execution.kind !== 'workflow') {
    onEvent({
      state: 'skipped',
      scheduleId: catalogScheduleSyncScheduleId,
      reason: `The "${catalogScheduleSyncExampleId}" example is not registered as a workflow on any target`,
    });
    return;
  }

  const entry = managerScheduleEntry(declared, {
    namespace: manager.target.namespace,
    taskQueue: manager.target.taskQueue,
    workflowType: manager.example.execution.workflowType,
  });
  const details = {
    scheduleId: entry.id,
    namespace: entry.namespace,
    taskQueue: entry.taskQueue,
    declaredCount: declared.length,
  };

  try {
    const { exists } = await describeManager(entry);

    if (exists) {
      await updateManagerArgs(entry);
      onEvent({ state: 'updated', ...details });
    } else {
      await createManager(entry);
      onEvent({ state: 'created', ...details });
    }
  } catch (error) {
    onEvent({ state: 'blocked', ...details, error });
    return;
  }

  try {
    await triggerManager(entry);
    onEvent({ state: 'triggered', ...details });
  } catch (error) {
    onEvent({ state: 'blocked', ...details, error });
  }
};
