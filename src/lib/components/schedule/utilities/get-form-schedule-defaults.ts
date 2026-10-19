import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';
import type { DescribeFullSchedule } from '$lib/types/schedule';
import type { SearchAttributes } from '$lib/types/workflows';
import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

import { isoStringToCalendarDateStr } from './date';
import { decodeSearchAttributeRows, toDurationString } from './form-defaults';
import { getFormSpecsFromDescribeFullSchedule } from './get-form-spec';
import { getFormSpecInitialData } from './get-form-spec-initial-data';
import { DEFAULT_CATCHUP_WINDOW } from '../constants';
import { getWorkflowConfigurationDefaults } from '../scheduled-action-types/workflow/defaults';
import {
  type FormScheduleSchema,
  type OverlapPolicy,
  overlapPolicy,
} from '../schema/form';

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
  const spec = schedule?.spec;
  const policies = schedule?.policies;

  return {
    name: describeFullSchedule?.schedule_id ?? '',
    ...getWorkflowConfigurationDefaults(
      describeFullSchedule,
      customSearchAttributes,
    ),

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

    searchAttributes: decodeSearchAttributeRows(
      describeFullSchedule?.searchAttributes ?? searchAttributes ?? {},
      customSearchAttributes,
    ),
  };
}
