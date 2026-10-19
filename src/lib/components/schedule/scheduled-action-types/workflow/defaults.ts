import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';
import type { DescribeFullSchedule } from '$lib/types/schedule';
import type { SearchAttributes } from '$lib/types/workflows';

import type { FormWorkflowConfiguration } from './schema';
import { DEFAULT_TASK_TIMEOUT } from '../../constants';
import {
  decodeSearchAttributeRows,
  toDurationString,
} from '../../utilities/form-defaults';

function toOptionalDurationString(value: unknown) {
  const duration = toDurationString(value, '');

  return duration && Number(parseDuration(duration)) > 0 ? duration : '';
}

export function getWorkflowConfigurationDefaults(
  describeFullSchedule: DescribeFullSchedule | null,
  customSearchAttributes: SearchAttributes,
): FormWorkflowConfiguration {
  const startWorkflow = describeFullSchedule?.schedule?.action?.startWorkflow;

  return {
    workflowType: startWorkflow?.workflowType?.name ?? '',
    workflowId: startWorkflow?.workflowId ?? '',
    taskQueue: startWorkflow?.taskQueue?.name ?? '',
    input: '',
    editInput: !describeFullSchedule,
    encoding: 'json/plain',
    messageType: '',
    keepOriginalWorkflowId:
      describeFullSchedule?.schedule?.policies?.keepOriginalWorkflowId ?? false,
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
