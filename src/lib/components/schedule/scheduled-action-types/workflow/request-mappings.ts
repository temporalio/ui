import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';
import type {
  ScheduleActionRequest,
  SchedulePoliciesRequest,
  StartWorkflowRequest,
} from '$lib/types/schedule';
import { encodePayloads } from '$lib/utilities/encode-payload';

import type { FormWorkflowDetails } from './schema';
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
  details: FormWorkflowDetails,
): Pick<SchedulePoliciesRequest, 'keepOriginalWorkflowId'> {
  return {
    keepOriginalWorkflowId: details.keepOriginalWorkflowId,
  };
}

export async function getWorkflowActionRequest(
  details: FormWorkflowDetails,
  existingWorkflow: StartWorkflowRequest | null = null,
): Promise<ScheduleActionRequest> {
  const startWorkflow = existingWorkflow ?? {};

  const payloads =
    details.editInput && details.input
      ? await encodePayloads({
          input: details.input,
          encoding: details.encoding,
          messageType: details.messageType,
        })
      : null;

  return {
    startWorkflow: {
      ...startWorkflow,
      workflowId: details.workflowId,
      workflowType: {
        name: details.workflowType,
      },
      taskQueue: {
        name: details.taskQueue,
      },
      ...(details.editInput && {
        input: payloads ? { payloads } : null,
      }),
      searchAttributes: getSearchAttributes(details.workflowSearchAttributes),
      workflowTaskTimeout: toWorkflowTimeout(details.taskTimeout),
      workflowRunTimeout: toWorkflowTimeout(details.runTimeout),
      workflowExecutionTimeout: toWorkflowTimeout(details.executionTimeout),
    },
  } satisfies ScheduleActionRequest;
}
