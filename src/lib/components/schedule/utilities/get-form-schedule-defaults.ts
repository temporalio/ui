import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';
import type { DescribeFullSchedule } from '$lib/types/schedule';
import type { SearchAttributes } from '$lib/types/workflows';
import { parsePayloadAttributes } from '$lib/utilities/decode-payload';
import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

import { isoStringToCalendarDateStr } from './date';
import { getFormSpecsFromDescribeFullSchedule } from './get-form-spec';
import { getFormSpecInitialData } from './get-form-spec-initial-data';
import {
  DEFAULT_CATCHUP_WINDOW,
  DEFAULT_EXECUTION_TIMEOUT,
  DEFAULT_RUN_TIMEOUT,
  DEFAULT_TASK_TIMEOUT,
} from '../constants';
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

function toDurationString(
  value: unknown,
  fallback: DurationString,
): DurationString {
  const parsed = durationSchema.safeParse(value);

  return parsed.success ? parsed.data : fallback;
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

function getEndCondition(
  describeFullSchedule: DescribeFullSchedule | null,
): Pick<FormScheduleSchema, 'endKind' | 'endTime' | 'endAfterOccurrences'> {
  const spec = describeFullSchedule?.schedule?.spec;
  const state = describeFullSchedule?.schedule?.state;

  const remainingActions =
    state?.limitedActions && state?.remainingActions
      ? Number(state.remainingActions)
      : undefined;

  if (remainingActions) {
    return { endKind: 'after', endAfterOccurrences: remainingActions };
  }

  if (spec?.endTime) {
    return {
      endKind: 'on',
      endTime: isoStringToCalendarDateStr(
        String(spec.endTime),
        spec.timezoneName || 'UTC',
      ),
    };
  }

  return { endKind: 'never' };
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
    runTimeout: toDurationString(
      startWorkflow?.workflowRunTimeout,
      DEFAULT_RUN_TIMEOUT,
    ),
    executionTimeout: toDurationString(
      startWorkflow?.workflowExecutionTimeout,
      DEFAULT_EXECUTION_TIMEOUT,
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
