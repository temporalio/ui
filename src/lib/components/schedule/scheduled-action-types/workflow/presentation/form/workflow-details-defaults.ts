import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';
import type { SearchAttributes } from '$lib/types/workflows';

import {
  decodeSearchAttributeRows,
  toDurationString,
} from '../../../../utilities/form-defaults';
import type { ActionFormMode } from '../../../types';
import { DEFAULT_TASK_TIMEOUT } from '../../constants';
import type { FormWorkflowDetails } from '../../schema';
import type { WorkflowSchedule } from '../../types';

function toOptionalDurationString(value: unknown) {
  const duration = toDurationString(value, '');

  return duration && Number(parseDuration(duration)) > 0 ? duration : '';
}

export function getWorkflowDetailsDefaults(
  mode: ActionFormMode<WorkflowSchedule>,
  customSearchAttributes: SearchAttributes,
): FormWorkflowDetails {
  const startWorkflow = mode.isEditing
    ? mode.schedule.schedule.action.startWorkflow
    : null;

  return {
    workflowType: startWorkflow?.workflowType?.name ?? '',
    workflowId: startWorkflow?.workflowId ?? '',
    taskQueue: startWorkflow?.taskQueue?.name ?? '',
    input: '',
    editInput: !mode.isEditing,
    encoding: 'json/plain',
    messageType: '',
    keepOriginalWorkflowId: mode.isEditing
      ? (mode.schedule.schedule.policies?.keepOriginalWorkflowId ?? false)
      : false,
    taskTimeout: toDurationString(
      startWorkflow?.workflowTaskTimeout,
      DEFAULT_TASK_TIMEOUT,
    ),
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
