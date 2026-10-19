import { z } from 'zod/v3';

import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';
import { searchAttributesSchema } from '$lib/stores/search-attributes';

import {
  durationString,
  durationStringWithDefault,
  structuredCalendarSchema,
} from './common';
import { DEFAULT_CATCHUP_WINDOW, MIN_CATCHUP_SECONDS } from '../constants';
import {
  formWorkflowConfigurationSchema,
  formWorkflowOptionsSchema,
} from '../scheduled-action-types/workflow/schema';
import { isValidCronString } from '../utilities/cron';
import { getNowCalendarDateStr } from '../utilities/date';

export const overlapPolicy = z
  .enum([
    'Skip',
    'BufferOne',
    'BufferAll',
    'CancelOther',
    'TerminateOther',
    'AllowAll',
  ])
  .default('Skip');

export type OverlapPolicy = z.infer<typeof overlapPolicy>;

export const formSchedulePoliciesSchema = z
  .object({
    overlapPolicy,
    pauseOnFailure: z.boolean().default(false),
    pauseSchedule: z.boolean().default(false),
    catchupWindow: durationStringWithDefault(DEFAULT_CATCHUP_WINDOW).refine(
      (durationStr) => {
        const seconds = Number(parseDuration(durationStr));

        return seconds >= MIN_CATCHUP_SECONDS;
      },
      {
        message: 'Catchup window must be at least 10 seconds.',
      },
    ),
  })
  .merge(formWorkflowOptionsSchema);

export type FormSchedulePoliciesSchema = z.infer<
  typeof formSchedulePoliciesSchema
>;

const formSpecKind = z.enum([
  'none',
  'cron',
  'interval',
  'week',
  'month',
  'frozen',
]);
export type FormSpecKind = z.infer<typeof formSpecKind>;

// The bare object schema, without the cross-field validation below. Parsing a
// partial seed through this injects the field defaults without tripping the
// refinements (e.g. "cron string is required"), yielding a complete spec.
export const formSpecObject = z.object({
  kind: formSpecKind,
  cronString: z.string().trim().default(''),
  interval: z
    .object({
      interval: durationString().optional(),
      phase: durationString().optional(),
    })
    .default({}),
  calendar: structuredCalendarSchema(),
});

export const formSpecSchema = formSpecObject.superRefine((spec, ctx) => {
  switch (spec.kind) {
    case 'none': {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Type is required ',
        path: ['kind'],
      });
      return;
    }

    case 'cron': {
      if (!spec.cronString) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cron expression is required',
          path: ['cronString'],
        });
      }

      if (!isValidCronString(spec.cronString)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Cron string format invalid. Format: minute (0-59) hour (0-23) day-of-month (1-31) month (1-12) day-of-week (0-6) separated by a space',
          path: ['cronString'],
        });
      }

      return;
    }

    case 'frozen': {
      return;
    }

    case 'interval': {
      if (
        !spec.interval?.interval ||
        !Number(parseDuration(spec.interval.interval))
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Interval is required',
          path: ['interval.interval'],
        });
      }

      return;
    }

    case 'month': {
      return;
    }

    case 'week': {
      return;
    }
  }
});

export type FormSpecSchema = z.infer<typeof formSpecSchema>;
const formScheduleTimingSchema = z.object({
  timezoneName: z.string().trim().default('UTC'),
  startTime: z
    .string()
    .trim()
    .date('Invalid start time')
    .default(getNowCalendarDateStr()),
  endKind: z.enum(['never', 'on', 'after']).default('never'),
  endTime: z
    .string()
    .trim()
    .date('Invalid end time')
    .default(getNowCalendarDateStr()),
  endAfterOccurrences: z.number().optional(),
});

export const formScheduleSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(232, 'Name is too long'),
    jitter: z.number().int().min(0).optional(),
    searchAttributes: searchAttributesSchema.default([]),
    specs: z
      .array(formSpecSchema)
      .min(1, 'At least one schedule spec is required'),
  })
  .merge(formSchedulePoliciesSchema)
  .merge(formScheduleTimingSchema)
  .merge(formWorkflowConfigurationSchema)
  .superRefine((schedule, ctx) => {
    if (schedule.endKind === 'on' && !schedule.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time is required',
        path: ['endTime'],
      });
    }

    if (schedule.endKind === 'after') {
      if (typeof schedule.endAfterOccurrences !== 'number') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Number of occurrences is required',
          path: ['endAfterOccurrences'],
        });
      }

      if (
        typeof schedule.endAfterOccurrences === 'number' &&
        schedule.endAfterOccurrences <= 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Number of occurrences must be greater than 0',
          path: ['endAfterOccurrences'],
        });
      }
    }
  });

export type FormScheduleSchema = z.infer<typeof formScheduleSchema>;
