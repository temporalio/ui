import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';
import { translate } from '$lib/i18n/translate';
import type {
  ScheduleActionRequest,
  StartWorkflowRequest,
} from '$lib/types/schedule';
import { encodePayloads } from '$lib/utilities/encode-payload';
import { getErrorMessage } from '$lib/utilities/error-message';

import type { FormWorkflowDetails } from './schema';
import type { WorkflowScheduledActionRequest } from './types';
import { getSearchAttributes } from '../../utilities/get-search-attributes';
import type {
  ScheduledActionFormData,
  SupportedScheduledAction,
} from '../types';

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
): WorkflowScheduledActionRequest['policies'] {
  return {
    keepOriginalWorkflowId: details.keepOriginalWorkflowId,
  };
}

export async function toWorkflowScheduleRequest(
  data: ScheduledActionFormData<'workflow'>,
  resolvedAction: SupportedScheduledAction<'workflow'>,
): Promise<WorkflowScheduledActionRequest> {
  return {
    action: await getWorkflowActionRequest(
      data.details,
      resolvedAction.schedule?.schedule.action.startWorkflow ?? null,
    ),
    policies: getWorkflowPoliciesRequest(data.details),
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
        }).catch((cause: unknown) => {
          throw new Error(
            `${translate('data-encoder.encode-error')}: ${getErrorMessage(cause)}`,
            { cause },
          );
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
