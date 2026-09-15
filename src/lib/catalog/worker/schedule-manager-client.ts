import {
  Client,
  type ConnectionLike,
  ScheduleNotFoundError,
} from '@temporalio/client';

import {
  catalogScheduleMemoKey,
  catalogScheduleOwnership,
} from './examples/schedule-sync/ownership.js';
import type { CatalogDesiredSchedule } from './schedule-declarations.js';
import { toScheduleSpec } from './schedule-spec.js';

/**
 * The four operations {@link bootstrapCatalogScheduleSync} needs, built against
 * an open connection.
 *
 * The bootstrap takes them as callbacks so its decisions stay testable without a
 * server. They are assembled here rather than at each call site so that every
 * caller — the local dev worker, a deploy step in another repository — writes
 * the same schedule: the same ownership memo, the same spec conversion, and the
 * same treatment of a missing schedule as "does not exist" rather than an error.
 */
export const catalogScheduleManagerOperations = (
  connection: ConnectionLike,
) => {
  const handleFor = ({ id, namespace }: CatalogDesiredSchedule) =>
    new Client({ connection, namespace }).schedule.getHandle(id);

  return {
    describeManager: async (entry: CatalogDesiredSchedule) => {
      try {
        const { state } = await handleFor(entry).describe();
        return { exists: true, paused: state.paused };
      } catch (error) {
        if (error instanceof ScheduleNotFoundError)
          return { exists: false, paused: false };
        throw error;
      }
    },

    createManager: async (entry: CatalogDesiredSchedule) => {
      await new Client({
        connection,
        namespace: entry.namespace,
      }).schedule.create({
        scheduleId: entry.id,
        spec: toScheduleSpec(entry.spec),
        action: {
          type: 'startWorkflow',
          workflowType: entry.workflowType,
          taskQueue: entry.taskQueue,
          args: entry.args,
        },
        state: { paused: entry.paused, note: entry.note },
        memo: {
          [catalogScheduleMemoKey]: catalogScheduleOwnership(entry.exampleId),
        },
      });
    },

    // Only the action is rewritten. The spec is left alone because the manager's
    // own cadence is not something a declaration owns, and the state is left
    // alone because a pause is the kill switch.
    updateManagerArgs: async (entry: CatalogDesiredSchedule) => {
      await handleFor(entry).update((previous) => ({
        ...previous,
        action: {
          ...previous.action,
          type: 'startWorkflow',
          workflowType: entry.workflowType,
          taskQueue: entry.taskQueue,
          args: entry.args,
        },
      }));
    },

    triggerManager: async (entry: CatalogDesiredSchedule) => {
      await handleFor(entry).trigger();
    },
  };
};
