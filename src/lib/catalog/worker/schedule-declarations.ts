import type { CatalogWorkerBinding } from './registry.js';
import type { BrowserScheduleSpec, JsonValue } from '../browser/types.js';

export type CatalogDesiredSchedule = {
  id: string;
  namespace: string;
  taskQueue: string;
  workflowType: string;
  exampleId: string;
  spec: BrowserScheduleSpec;
  args: JsonValue[];
  paused: boolean;
  note?: string;
};

export const declaredSchedules = (
  bindings: readonly CatalogWorkerBinding[],
): CatalogDesiredSchedule[] => {
  const declared: CatalogDesiredSchedule[] = [];

  for (const { target, examples } of bindings) {
    for (const { id, execution, inputDefault } of examples) {
      if (execution.kind !== 'workflow' || !execution.schedule) continue;

      const { schedule } = execution;
      const args =
        schedule.input ?? (Array.isArray(inputDefault) ? inputDefault : []);

      declared.push({
        id: schedule.id,
        namespace: target.namespace,
        taskQueue: target.taskQueue,
        workflowType: execution.workflowType,
        exampleId: id,
        spec: schedule.spec,
        args,
        paused: schedule.paused,
        ...(schedule.note === undefined ? {} : { note: schedule.note }),
      });
    }
  }

  return declared;
};
