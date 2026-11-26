import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';
import type { SearchAttributes } from '$lib/types/workflows';

import {
  decodeSearchAttributeRows,
  toDurationString,
} from '../../../../utilities/form-defaults';
import {
  DEFAULT_TASK_TIMEOUT,
  MAX_TASK_TIMEOUT_SECONDS,
} from '../../constants';
import type { FormWorkflowDetails } from '../../schema';
import type { WorkflowSchedule } from '../../types';

function toOptionalDurationString(value: unknown) {
  const duration = toDurationString(value, '');

  return duration && Number(parseDuration(duration)) > 0 ? duration : '';
}

function toTaskTimeoutString(value: unknown) {
  const duration = toDurationString(value, DEFAULT_TASK_TIMEOUT);

  if (Number(parseDuration(duration)) > MAX_TASK_TIMEOUT_SECONDS) {
    return `${MAX_TASK_TIMEOUT_SECONDS}s` as const;
  }

  return duration;
}

export function getWorkflowDetailsDefaults(
  schedule: WorkflowSchedule | null,
  customSearchAttributes: SearchAttributes,
): FormWorkflowDetails {
  const startWorkflow = schedule?.schedule.action.startWorkflow;

  return {
    workflowType: startWorkflow?.workflowType?.name ?? '',
    workflowId: startWorkflow?.workflowId ?? '',
    taskQueue: startWorkflow?.taskQueue?.name ?? '',
    input: '',
    editInput: schedule === null,
    encoding: 'json/plain',
    messageType: '',
    keepOriginalWorkflowId:
      schedule?.schedule.policies?.keepOriginalWorkflowId ?? false,
    taskTimeout: toTaskTimeoutString(startWorkflow?.workflowTaskTimeout),
    runTimeout: toOptionalDurationString(startWorkflow?.workflowRunTimeout),
    executionTimeout: toOptionalDurationString(
      startWorkflow?.workflowExecutionTimeout,
    ),
    workflowSearchAttributes: decodeSearchAttributeRows(
      startWorkflow?.searchAttributes ?? {},
      customSearchAttributes,
    ),
  };
}
