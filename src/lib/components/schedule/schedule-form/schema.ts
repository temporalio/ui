import { z } from 'zod/v3';

import { searchAttributesSchema } from '$lib/stores/search-attributes';
import type { FullSchedule } from '$lib/types/schedule';
import type { SearchAttributes } from '$lib/types/workflows';
import { parsePayloadAttributes } from '$lib/utilities/decode-payload';

import {
  DAYS_OF_MONTH,
  DAYS_OF_WEEK,
  MONTHS,
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
} from './constants';
import {
  DEFAULT_CATCHUP_WINDOW,
  DEFAULT_EXECUTION_TIMEOUT,
  DEFAULT_RUN_TIMEOUT,
  DEFAULT_TASK_TIMEOUT,
  schedulePoliciesSchema,
} from './policies-schema';
import type { DayOfMonth, DayOfWeek, Month } from './types';
import { isValidCronString } from './utilities/cron';

import type { SearchAttribute } from '$types';

export const scheduleSpecItemSchema = z
  .discriminatedUnion('type', [
    z.object({
      type: z.literal('cron'),
      cronString: z.string().default(''),
    }),
    z.object({
      type: z.literal('week'),
      daysOfWeek: z
        .array(z.enum(DAYS_OF_WEEK))
        .optional()
        .default([...DAYS_OF_WEEK]),
      hour: z.number().min(0).max(23).optional().default(0),
      minute: z.number().min(0).max(59).optional().default(0),
    }),
    z.object({
      type: z.literal('month'),
      daysOfMonth: z.array(z.enum(DAYS_OF_MONTH)).optional().default([]),
      months: z.array(z.enum(MONTHS)).optional().default([]),
      hour: z.number().min(0).max(23).optional().default(0),
      minute: z.number().min(0).max(59).optional().default(0),
    }),
    z.object({
      type: z.literal('interval'),
      days: z.number().min(0).optional().default(0),
      hours: z.number().min(0).optional().default(0),
      minutes: z.number().min(0).optional().default(0),
      seconds: z.number().min(0).optional().default(0),
      phase: z.string().optional(),
    }),
  ])
  .superRefine((val, ctx) => {
    switch (val.type) {
      case 'cron': {
        const cronString = val.cronString?.trim();

        if (!cronString) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Cron expression is required',
            path: ['cronString'],
          });
          return;
        }

        if (!isValidCronString(cronString)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid cron expression',
            path: ['cronString'],
          });
          return;
        }

        return;
      }

      case 'week': {
        if (!val.daysOfWeek.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'At least one day must be selected',
            path: ['daysOfWeek'],
          });
          return;
        }

        return;
      }
    }
  });

export type ScheduleSpecItem = z.infer<typeof scheduleSpecItemSchema>;

export const DEFAULT_SPEC_ITEM: ScheduleSpecItem = {
  type: 'cron',
  cronString: '',
};

export const SPEC_ITEM_NO_TYPE: ScheduleSpecItem = {
  ...DEFAULT_SPEC_ITEM,
  type: undefined,
};

export const scheduleFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(232, 'Name is too long'),
    workflowType: z.string().min(1, 'Workflow type is required'),
    workflowId: z.string(),
    taskQueue: z.string().min(1, 'Task queue is required'),
    input: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val.trim() === '') return true;
          try {
            JSON.parse(val);
            return true;
          } catch {
            return false;
          }
        },
        {
          message: 'Input must be valid JSON',
        },
      ),
    editInput: z.boolean(),
    encoding: z.enum(['json/plain', 'json/protobuf'] as const),
    messageType: z.string().optional(),
    specs: z
      .array(scheduleSpecItemSchema)
      .min(1, 'At least one schedule spec is required'),
    timezoneName: z.string(),
    startDate: z.string().optional().default(''),
    endDateType: z.enum(['never', 'on', 'after']),
    endDate: z.string().optional().default(''),
    endAfterOccurrences: z.number().optional(),
    jitter: z.string().optional().default('0'),
    keepOriginalWorkflowId: z.boolean(),
    searchAttributes: searchAttributesSchema,
    workflowSearchAttributes: searchAttributesSchema,
  })
  .merge(schedulePoliciesSchema);

export type ScheduleFormData = z.infer<typeof scheduleFormSchema>;

export const getDefaultValues = (params: {
  schedule: FullSchedule | null;
  searchAttributes: SearchAttribute;
  customSearchAttributes: SearchAttributes;
  scheduleId: string;
}): ScheduleFormData => {
  const {
    schedule,
    searchAttributes = {},
    customSearchAttributes = {},
    scheduleId,
  } = params;

  const decodedSearchAttributes = parsePayloadAttributes({ searchAttributes });
  const decodedWorkflowSearchAttributes = parsePayloadAttributes({
    searchAttributes: schedule?.action?.startWorkflow?.searchAttributes ?? {},
  });

  const indexedFields =
    decodedSearchAttributes?.searchAttributes.indexedFields ??
    ({} as { [k: string]: string });
  const workflowIndexedFields =
    decodedWorkflowSearchAttributes?.searchAttributes.indexedFields ??
    ({} as { [k: string]: string });

  const searchAttributesInput = Object.entries(indexedFields).map(
    ([label, value]) => ({
      label,
      value,
      type: customSearchAttributes[label],
    }),
  );

  const workflowSearchAttributesInput = Object.entries(
    workflowIndexedFields,
  ).map(([label, value]) => ({
    label,
    value,
    type: customSearchAttributes[label],
  }));

  const specs = schedule
    ? parseScheduleSpecs(schedule)
    : [{ ...DEFAULT_SPEC_ITEM }];

  const nowIsoString = new Date().toISOString();

  return {
    name: scheduleId ?? '',
    workflowType: schedule?.action?.startWorkflow?.workflowType?.name ?? '',
    workflowId: schedule?.action?.startWorkflow?.workflowId ?? '',
    taskQueue: schedule?.action?.startWorkflow?.taskQueue?.name ?? '',
    input: '',
    editInput: !schedule,
    encoding: 'json/plain',
    messageType: '',
    specs,
    timezoneName: schedule?.spec?.timezoneName ?? 'UTC',
    startDate: schedule?.spec?.startTime
      ? String(schedule.spec.startTime)
      : nowIsoString,
    endDateType: schedule?.spec?.endTime ? 'on' : 'never',
    endDate: schedule?.spec?.endTime
      ? String(schedule.spec.endTime)
      : nowIsoString,
    endAfterOccurrences: undefined,
    jitter: schedule?.spec?.jitter ? String(schedule.spec.jitter) : '0',
    overlapPolicy: parseOverlapPolicy(schedule?.policies?.overlapPolicy),
    catchupWindow: schedule?.policies?.catchupWindow
      ? String(schedule.policies.catchupWindow)
      : DEFAULT_CATCHUP_WINDOW,
    pauseOnFailure: schedule?.policies?.pauseOnFailure ?? false,
    pauseSchedule: schedule?.state?.paused ?? false,
    taskTimeout: schedule?.action?.startWorkflow?.workflowTaskTimeout
      ? String(schedule.action.startWorkflow.workflowTaskTimeout)
      : DEFAULT_TASK_TIMEOUT,
    runTimeout: schedule?.action?.startWorkflow?.workflowRunTimeout
      ? String(schedule.action.startWorkflow.workflowRunTimeout)
      : DEFAULT_RUN_TIMEOUT,
    executionTimeout: schedule?.action?.startWorkflow?.workflowExecutionTimeout
      ? String(schedule.action.startWorkflow.workflowExecutionTimeout)
      : DEFAULT_EXECUTION_TIMEOUT,
    keepOriginalWorkflowId: schedule?.policies?.keepOriginalWorkflowId ?? false,
    searchAttributes: searchAttributesInput,
    workflowSearchAttributes: workflowSearchAttributesInput,
  };
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

function parseOverlapPolicy(
  value?: string | number | null,
): ScheduleFormData['overlapPolicy'] {
  if (!value) return 'Skip';
  return OVERLAP_POLICY_MAP[String(value)] ?? 'Skip';
}

function parseIntervalString(intervalStr: string): {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
} {
  const totalSeconds = parseInt(intervalStr.replace(/s$/, ''), 10) || 0;
  const days = Math.floor(totalSeconds / SECONDS_PER_DAY);
  const hours = Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
  const minutes = Math.floor(
    (totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE,
  );
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return {
    days: days > 0 ? String(days) : '',
    hours: hours > 0 ? String(hours) : '',
    minutes: minutes > 0 ? String(minutes) : '',
    seconds: seconds > 0 ? String(seconds) : '',
  };
}

function parseScheduleSpecs(schedule: FullSchedule): ScheduleSpecItem[] {
  const specs: ScheduleSpecItem[] = [];

  const cronStrings = schedule?.spec?.cronString ?? [];
  for (const cron of cronStrings) {
    const cleanCron = cron.includes('#') ? cron.split('#')[0].trim() : cron;
    specs.push({
      type: 'cron',
      cronString: cleanCron,
    });
  }

  const intervals = schedule?.spec?.interval ?? [];
  for (const interval of intervals) {
    const intervalStr = interval?.interval?.toString() ?? '0s';
    const phaseStr = interval?.phase?.toString() ?? '';
    const parsed = parseIntervalString(intervalStr);
    specs.push({
      type: 'interval',
      days: Number(parsed.days),
      hours: Number(parsed.hours),
      minutes: Number(parsed.minutes),
      seconds: Number(parsed.seconds),
      phase: phaseStr,
    });
  }

  const calendars =
    schedule?.spec?.structuredCalendar ?? schedule?.spec?.calendar ?? [];
  for (const cal of calendars) {
    const hasDayOfWeek =
      cal?.dayOfWeek &&
      (Array.isArray(cal.dayOfWeek)
        ? cal.dayOfWeek.length > 0
        : !!cal.dayOfWeek);
    const hasDayOfMonth =
      cal?.dayOfMonth &&
      (Array.isArray(cal.dayOfMonth)
        ? cal.dayOfMonth.length > 0
        : !!cal.dayOfMonth);

    if (hasDayOfWeek && !hasDayOfMonth) {
      specs.push({
        type: 'week',
        daysOfWeek: (Array.isArray(cal.dayOfWeek)
          ? cal.dayOfWeek.map(String)
          : [String(cal.dayOfWeek)]
        ).filter((d): d is DayOfWeek =>
          (DAYS_OF_WEEK as readonly string[]).includes(d),
        ),
        hour: Array.isArray(cal.hour) ? Number(cal.hour[0]) : Number(cal.hour),
        minute: Array.isArray(cal.minute)
          ? Number(cal.minute[0])
          : Number(cal.minute),
      });
    } else {
      specs.push({
        type: 'month',
        daysOfMonth: Array.isArray(cal.dayOfMonth)
          ? cal.dayOfMonth.map((d) => String(d) as DayOfMonth)
          : [String(cal.dayOfMonth ?? 1) as DayOfMonth],
        months: Array.isArray(cal.month)
          ? cal.month.map((m) => String(m) as Month)
          : [String(cal.month ?? '') as Month],
        hour: Array.isArray(cal.hour) ? Number(cal.hour[0]) : Number(cal.hour),
        minute: Array.isArray(cal.minute)
          ? Number(cal.minute[0])
          : Number(cal.minute),
      });
    }
  }

  return specs.length > 0 ? specs : [{ ...DEFAULT_SPEC_ITEM }];
}
