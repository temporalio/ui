import {
  Client,
  Connection,
  WorkflowExecutionAlreadyStartedError,
} from '@temporalio/client';
import { z } from 'zod';

import { assertValidExampleInput, requireWorkflowExample } from './catalog';
import type { ScenarioContext, ScenarioResult } from './scenario';

export const exampleEntrySchema = z.object({
  id: z.string(),
  workflowId: z.string().optional(),
  /** Replaces the example's own default input when given. */
  input: z.array(z.unknown()).optional(),
  role: z.string().optional(),
  note: z.string().optional(),
});

export type ExampleEntry = z.infer<typeof exampleEntrySchema>;

/**
 * Starts the catalog examples a demo names. The catalog's generated artifact
 * supplies the workflow type and task queue, so a definition never repeats them
 * and cannot drift from the example it names. The catalog worker runs them,
 * which the worker stage starts.
 */
export const startCatalogExamples = async (
  { address, namespace, log }: ScenarioContext,
  entries: readonly ExampleEntry[],
): Promise<ScenarioResult> => {
  // Resolved before connecting, so a bad example id or a bad input reports
  // itself instead of surfacing as a connection failure.
  const planned = [];

  for (const entry of entries) {
    const example = requireWorkflowExample(entry.id);
    const args = entry.input ?? example.defaultInput;

    await assertValidExampleInput(example, args);

    planned.push({
      entry,
      example,
      args,
      workflowId: entry.workflowId ?? `catalog-${entry.id}`,
    });
  }

  const connection = await Connection.connect({ address });
  const client = new Client({ connection, namespace });

  const workflows: ScenarioResult['workflows'] = [];
  const observations: string[] = [];
  const exampleIds: string[] = [];

  for (const { entry, example, args, workflowId } of planned) {
    exampleIds.push(example.id);

    try {
      const handle = await client.workflow.start(example.workflowType, {
        taskQueue: example.taskQueue,
        workflowId,
        args,
      });

      workflows.push({
        role: entry.role ?? example.title,
        workflowId: handle.workflowId,
        runId: handle.firstExecutionRunId,
        note: entry.note ?? example.description,
        catalogExampleId: example.id,
      });

      log(`Started catalog example ${example.id} as ${workflowId}`);
    } catch (error) {
      if (!(error instanceof WorkflowExecutionAlreadyStartedError)) throw error;

      const running = await client.workflow
        .getHandle(workflowId)
        .describe()
        .catch(() => undefined);

      workflows.push({
        role: entry.role ?? example.title,
        workflowId,
        runId: running?.runId ?? '',
        note: entry.note ?? example.description,
        catalogExampleId: example.id,
      });

      observations.push(
        `${workflowId} was already running, so this run left it alone.`,
      );
      log(`Kept the running ${workflowId}`);
    }
  }

  if (exampleIds.length) {
    observations.push(
      `These are catalog examples (${exampleIds.join(', ')}), so the catalog page runs the same code.`,
    );
  }

  return {
    workflows,
    observations,
    shutdown: async () => {
      await connection.close();
    },
  };
};
