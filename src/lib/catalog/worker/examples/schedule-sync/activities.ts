import { Client, Connection } from '@temporalio/client';

import {
  catalogScheduleMemoKey,
  catalogScheduleOwnership,
  isCatalogOwned,
} from './ownership.js';
import type {
  CatalogSchedulePlan,
  CatalogSchedulePlanResult,
  ExistingCatalogSchedule,
} from './plan.js';
import { parseCatalogConnectionConfig } from '../../connection-config.js';
import { toScheduleSpec } from '../../schedule-spec.js';

const describeError = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const withCatalogClient = async <Result>(
  namespace: string,
  use: (client: Client) => Promise<Result>,
): Promise<Result> => {
  const config = parseCatalogConnectionConfig(process.env);
  const connection = await Connection.connect({
    address: config.address,
    ...(config.apiKey ? { apiKey: config.apiKey } : {}),
    ...(config.tls ? { tls: config.tls } : {}),
  });

  try {
    return await use(new Client({ connection, namespace }));
  } finally {
    await connection.close();
  }
};

export const listCatalogSchedules = async ({
  namespace,
}: {
  namespace: string;
}): Promise<ExistingCatalogSchedule[]> =>
  withCatalogClient(namespace, async (client) => {
    const existing: ExistingCatalogSchedule[] = [];

    for await (const summary of client.schedule.list()) {
      const memo: unknown = summary.memo;
      const owned = isCatalogOwned(memo);

      existing.push({
        id: summary.scheduleId,
        owned,
        paused: summary.state.paused,
        ...(owned ? { exampleId: memo[catalogScheduleMemoKey].exampleId } : {}),
      });
    }

    return existing;
  });

export const applyCatalogSchedulePlan = async ({
  namespace,
  plan,
}: {
  namespace: string;
  plan: CatalogSchedulePlan;
}): Promise<CatalogSchedulePlanResult> =>
  withCatalogClient(namespace, async (client) => {
    const result: CatalogSchedulePlanResult = {
      created: [],
      updated: [],
      deleted: [],
      blocked: plan.blocked.map(({ id }) => id),
      held: plan.held.map(({ id }) => id),
      errors: [],
    };

    for (const schedule of plan.create) {
      try {
        await client.schedule.create({
          scheduleId: schedule.id,
          spec: toScheduleSpec(schedule.spec),
          action: {
            type: 'startWorkflow',
            workflowType: schedule.workflowType,
            taskQueue: schedule.taskQueue,
            args: schedule.args,
          },
          state: { paused: schedule.paused, note: schedule.note },
          memo: {
            [catalogScheduleMemoKey]: catalogScheduleOwnership(
              schedule.exampleId,
            ),
          },
        });
        result.created.push(schedule.id);
      } catch (error) {
        result.errors.push(`${schedule.id}: ${describeError(error)}`);
      }
    }

    for (const schedule of plan.update) {
      try {
        await client.schedule.getHandle(schedule.id).update((previous) => ({
          ...previous,
          spec: toScheduleSpec(schedule.spec),
          action: {
            ...previous.action,
            type: 'startWorkflow',
            workflowType: schedule.workflowType,
            taskQueue: schedule.taskQueue,
            args: schedule.args,
          },
          state: {
            ...previous.state,
            paused: schedule.paused,
            note: schedule.note,
          },
        }));
        result.updated.push(schedule.id);
      } catch (error) {
        result.errors.push(`${schedule.id}: ${describeError(error)}`);
      }
    }

    for (const scheduleId of plan.delete) {
      try {
        await client.schedule.getHandle(scheduleId).delete();
        result.deleted.push(scheduleId);
      } catch (error) {
        result.errors.push(`${scheduleId}: ${describeError(error)}`);
      }
    }

    if (result.errors.length > 0) {
      throw new Error(
        `Catalog schedule reconciliation failed: ${result.errors.join('; ')}`,
      );
    }

    return result;
  });
