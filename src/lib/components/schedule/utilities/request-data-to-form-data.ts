import type { FullSchedule } from '$lib/types/schedule';
import type { SearchAttributes } from '$lib/types/workflows';
import { parsePayloadAttributes } from '$lib/utilities/decode-payload';

import { getInitialSpecData } from './spec';
import {
  DEFAULT_CATCHUP_WINDOW,
  DEFAULT_EXECUTION_TIMEOUT,
  DEFAULT_RUN_TIMEOUT,
  DEFAULT_TASK_TIMEOUT,
} from '../constants';
import type { ScheduleFormData } from '../schema/form-schema';
import { protoSpecToFormSpecs } from '../schema/proto-spec-schema';

import type { SearchAttribute } from '$types';

const stringOrDefault = (
  value: string | number | object | null | undefined,
  fallback: string,
): string => (value ? String(value) : fallback);

const decodeSearchAttributeRows = (
  searchAttributes: SearchAttribute,
  customSearchAttributes: SearchAttributes,
): ScheduleFormData['searchAttributes'] => {
  const decoded = parsePayloadAttributes({ searchAttributes });
  const indexedFields =
    decoded?.searchAttributes.indexedFields ?? ({} as Record<string, string>);

  return Object.entries(indexedFields).map(([label, value]) => ({
    label,
    value,
    type: customSearchAttributes[label],
  }));
};

const parseEndCondition = (
  schedule: FullSchedule | null,
  nowIsoString: string,
): Pick<
  ScheduleFormData,
  'endDateType' | 'endDate' | 'endAfterOccurrences'
> => {
  const remainingActions =
    schedule?.state?.limitedActions && schedule?.state?.remainingActions
      ? Number(schedule.state.remainingActions)
      : undefined;

  const endDate = stringOrDefault(schedule?.spec?.endTime, nowIsoString);

  if (remainingActions) {
    return {
      endDateType: 'after',
      endDate,
      endAfterOccurrences: remainingActions,
    };
  }

  if (schedule?.spec?.endTime) {
    return { endDateType: 'on', endDate, endAfterOccurrences: undefined };
  }

  return { endDateType: 'never', endDate, endAfterOccurrences: undefined };
};

const OVERLAP_POLICY_MAP: Record<string, ScheduleFormData['overlapPolicy']> = {
  SCHEDULE_OVERLAP_POLICY_SKIP: 'Skip',
  SCHEDULE_OVERLAP_POLICY_BUFFER_ONE: 'BufferOne',
  SCHEDULE_OVERLAP_POLICY_BUFFER_ALL: 'BufferAll',
  SCHEDULE_OVERLAP_POLICY_CANCEL_OTHER: 'CancelOther',
  SCHEDULE_OVERLAP_POLICY_TERMINATE_OTHER: 'TerminateOther',
  SCHEDULE_OVERLAP_POLICY_ALLOW_ALL: 'AllowAll',
  Skip: 'Skip',
  BufferOne: 'BufferOne',
  BufferAll: 'BufferAll',
  CancelOther: 'CancelOther',
  TerminateOther: 'TerminateOther',
  AllowAll: 'AllowAll',
};

export function parseOverlapPolicy(
  value?: string | number | null,
): ScheduleFormData['overlapPolicy'] {
  if (!value) return 'Skip';

  return OVERLAP_POLICY_MAP[String(value)] ?? 'Skip';
}

function parseScheduleSpecs(schedule: FullSchedule) {
  const specs = protoSpecToFormSpecs(schedule?.spec ?? null);

  if (specs.length) {
    return specs;
  }

  return [getInitialSpecData('cron')];
}

type ScheduleToFormDataParams = {
  schedule: FullSchedule | null;
  searchAttributes?: SearchAttribute;
  customSearchAttributes?: SearchAttributes;
  scheduleId: string;
};

export function scheduleToFormData({
  schedule,
  searchAttributes = {},
  customSearchAttributes = {},
  scheduleId,
}: ScheduleToFormDataParams): ScheduleFormData {
  const startWorkflow = schedule?.action?.startWorkflow;
  const spec = schedule?.spec;
  const policies = schedule?.policies;
  const nowIsoString = new Date().toISOString();

  return {
    name: scheduleId ?? '',
    workflowType: startWorkflow?.workflowType?.name ?? '',
    workflowId: startWorkflow?.workflowId ?? '',
    taskQueue: startWorkflow?.taskQueue?.name ?? '',

    input: '',
    editInput: !schedule,
    encoding: 'json/plain',
    messageType: '',

    specs: schedule
      ? parseScheduleSpecs(schedule)
      : [getInitialSpecData('cron')],
    timezoneName: spec?.timezoneName ?? 'UTC',
    startDate: stringOrDefault(spec?.startTime, nowIsoString),
    jitter: stringOrDefault(spec?.jitter, '0'),
    ...parseEndCondition(schedule, nowIsoString),

    overlapPolicy: parseOverlapPolicy(policies?.overlapPolicy),
    catchupWindow: stringOrDefault(
      policies?.catchupWindow,
      DEFAULT_CATCHUP_WINDOW,
    ),
    pauseOnFailure: policies?.pauseOnFailure ?? false,
    pauseSchedule: schedule?.state?.paused ?? false,
    keepOriginalWorkflowId: policies?.keepOriginalWorkflowId ?? false,

    taskTimeout: stringOrDefault(
      startWorkflow?.workflowTaskTimeout,
      DEFAULT_TASK_TIMEOUT,
    ),
    runTimeout: stringOrDefault(
      startWorkflow?.workflowRunTimeout,
      DEFAULT_RUN_TIMEOUT,
    ),
    executionTimeout: stringOrDefault(
      startWorkflow?.workflowExecutionTimeout,
      DEFAULT_EXECUTION_TIMEOUT,
    ),

    searchAttributes: decodeSearchAttributeRows(
      searchAttributes,
      customSearchAttributes,
    ),
    workflowSearchAttributes: decodeSearchAttributeRows(
      startWorkflow?.searchAttributes ?? {},
      customSearchAttributes,
    ),
  };
}
