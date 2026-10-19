import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';
import type {
  ScheduleActionRequest,
  SchedulePoliciesRequest,
  StartWorkflowRequest,
} from '$lib/types/schedule';
import { encodePayloads } from '$lib/utilities/encode-payload';

import type { FormWorkflowConfiguration } from './schema';
import { getSearchAttributes } from '../../utilities/get-search-attributes';

// Omit zero/empty workflow timeouts so the server applies its defaults
// (execution/run: unlimited, task: 10s) rather than sending an explicit 0.
function toWorkflowTimeout(value: string | undefined): string | undefined {
  if (!value || Number(parseDuration(value)) <= 0) {
    return undefined;
  }

  return value;
}

export function getWorkflowPoliciesRequest(
  configuration: FormWorkflowConfiguration,
): Pick<SchedulePoliciesRequest, 'keepOriginalWorkflowId'> {
  return {
    keepOriginalWorkflowId: configuration.keepOriginalWorkflowId,
  };
}

export async function getWorkflowActionRequest(
  configuration: FormWorkflowConfiguration,
  existingWorkflow: StartWorkflowRequest | null = null,
): Promise<ScheduleActionRequest> {
  const startWorkflow = existingWorkflow ?? {};

  const payloads =
    configuration.editInput && configuration.input
      ? await encodePayloads({
          input: configuration.input,
          encoding: configuration.encoding,
          messageType: configuration.messageType,
        })
      : null;

  return {
    startWorkflow: {
      ...startWorkflow,
      workflowId: configuration.workflowId,
      workflowType: {
        name: configuration.workflowType,
      },
      taskQueue: {
        name: configuration.taskQueue,
      },
      ...(configuration.editInput && {
        input: payloads ? { payloads } : null,
      }),
      searchAttributes: getSearchAttributes(
        configuration.workflowSearchAttributes,
      ),
      workflowTaskTimeout: toWorkflowTimeout(configuration.taskTimeout),
      workflowRunTimeout: toWorkflowTimeout(configuration.runTimeout),
      workflowExecutionTimeout: toWorkflowTimeout(
        configuration.executionTimeout,
      ),
    },
  } satisfies ScheduleActionRequest;
}
