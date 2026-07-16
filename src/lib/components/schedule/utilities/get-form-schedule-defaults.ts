import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';
import type { DescribeFullSchedule } from '$lib/types/schedule';
import type { SearchAttributes } from '$lib/types/workflows';
import { parsePayloadAttributes } from '$lib/utilities/decode-payload';
import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

import { isoStringToCalendarDateStr } from './date';
import { getFormSpecsFromDescribeFullSchedule } from './get-form-spec';
import { getFormSpecInitialData } from './get-form-spec-initial-data';
import { DEFAULT_CATCHUP_WINDOW, DEFAULT_TASK_TIMEOUT } from '../constants';
import { durationString } from '../schema/common';
import {
  type FormScheduleSchema,
  type OverlapPolicy,
  overlapPolicy,
} from '../schema/form';
import type { DurationString } from '../types';

import type { SearchAttribute } from '$types';

export function parseOverlapPolicy(
  value?: string | number | null,
): OverlapPolicy {
  const policy = fromScreamingEnum(
    String(value ?? ''),
    'ScheduleOverlapPolicy',
  );
  const parsed = overlapPolicy.safeParse(policy);

  return parsed.success ? parsed.data : 'Skip';
}

const durationSchema = durationString();

function toDurationString<Fallback extends DurationString | ''>(
  value: unknown,
  fallback: Fallback,
): DurationString | Fallback {
  const parsed = durationSchema.safeParse(value);

  return parsed.success ? parsed.data : fallback;
}

// Run/execution timeouts have no default; leave them empty when unset. A stored
// 0s means "unlimited", so normalize it to empty too.
function toOptionalDurationString(value: unknown): DurationString | '' {
  const parsed = durationSchema.safeParse(value);

  if (!parsed.success || Number(parseDuration(parsed.data)) <= 0) {
    return '';
  }

  return parsed.data;
}

function decodeSearchAttributeRows(
  searchAttributes: SearchAttribute,
  customSearchAttributes: SearchAttributes,
): FormScheduleSchema['searchAttributes'] {
  const decoded = parsePayloadAttributes({ searchAttributes });
  const indexedFields =
    decoded?.searchAttributes.indexedFields ?? ({} as Record<string, string>);

  return Object.entries(indexedFields).map(([label, value]) => ({
    label,
    value,
    type: customSearchAttributes[label],
  }));
}

function getEndKind(
  describeFullSchedule: DescribeFullSchedule | null,
): FormScheduleSchema['endKind'] {
  const state = describeFullSchedule?.schedule?.state;
  const spec = describeFullSchedule?.schedule?.spec;

  if (state?.limitedActions) {
    return 'after';
  }

  if (spec?.endTime) {
    return 'on';
  }

  return 'never';
}

function getEndCondition(
  describeFullSchedule: DescribeFullSchedule | null,
): Pick<FormScheduleSchema, 'endKind' | 'endTime' | 'endAfterOccurrences'> {
  const state = describeFullSchedule?.schedule?.state;
  const spec = describeFullSchedule?.schedule?.spec;
  const remainingActions = Number(state?.remainingActions);

  return {
    endKind: getEndKind(describeFullSchedule),
    endAfterOccurrences:
      Number.isFinite(remainingActions) && remainingActions > 0
        ? remainingActions
        : undefined,
    endTime: isoStringToCalendarDateStr(
      String(spec?.endTime ?? new Date().toISOString()),
      spec?.timezoneName || 'UTC',
    ),
  };
}

function getSpecs(
  describeFullSchedule: DescribeFullSchedule | null,
): FormScheduleSchema['specs'] {
  if (describeFullSchedule) {
    const specs = getFormSpecsFromDescribeFullSchedule(describeFullSchedule);
    if (specs.length) return specs;
  }

  return [getFormSpecInitialData('cron')];
}

export function getFormScheduleDefaults(
  describeFullSchedule: DescribeFullSchedule | null = null,
  {
    searchAttributes = {},
    customSearchAttributes = {},
  }: {
    searchAttributes: SearchAttributes;
    customSearchAttributes: SearchAttributes;
  },
): FormScheduleSchema {
  const schedule = describeFullSchedule?.schedule;
  const startWorkflow = schedule?.action?.startWorkflow;
  const spec = schedule?.spec;
  const policies = schedule?.policies;

  return {
    name: describeFullSchedule?.schedule_id ?? '',
    workflowType: startWorkflow?.workflowType?.name ?? '',
    workflowId: startWorkflow?.workflowId ?? '',
    taskQueue: startWorkflow?.taskQueue?.name ?? '',

    input: '',
    // Re-encoding the input only happens when this is set; default it on for
    // new schedules and off for existing ones, whose payloads aren't decoded
    // back into the form.
    editInput: !describeFullSchedule,
    encoding: 'json/plain',
    messageType: '',

    specs: getSpecs(describeFullSchedule),
    timezoneName: spec?.timezoneName || 'UTC',
    startTime: isoStringToCalendarDateStr(
      String(spec?.startTime || new Date().toISOString()),
      spec?.timezoneName || 'UTC',
    ),
    jitter: Number(parseDuration(spec?.jitter ?? '') || 0),
    ...getEndCondition(describeFullSchedule),

    overlapPolicy: parseOverlapPolicy(policies?.overlapPolicy),
    catchupWindow: toDurationString(
      policies?.catchupWindow,
      DEFAULT_CATCHUP_WINDOW,
    ),
    pauseOnFailure: policies?.pauseOnFailure ?? false,
    pauseSchedule: schedule?.state?.paused ?? false,
    keepOriginalWorkflowId: policies?.keepOriginalWorkflowId ?? false,

    taskTimeout: toDurationString(
      startWorkflow?.workflowTaskTimeout,
      DEFAULT_TASK_TIMEOUT,
    ),
    runTimeout: toOptionalDurationString(startWorkflow?.workflowRunTimeout),
    executionTimeout: toOptionalDurationString(
      startWorkflow?.workflowExecutionTimeout,
    ),

    searchAttributes: decodeSearchAttributeRows(
      describeFullSchedule?.searchAttributes ?? searchAttributes ?? {},
      customSearchAttributes,
    ),

    workflowSearchAttributes: decodeSearchAttributeRows(
      startWorkflow?.searchAttributes ?? {},
      customSearchAttributes,
    ),
  };
}
