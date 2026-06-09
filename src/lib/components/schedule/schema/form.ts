import { z } from 'zod/v3';

import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';
import { searchAttributesSchema } from '$lib/stores/search-attributes';

import { durationString, jsonString, structuredCalendarSchema } from './common';
import { MIN_CATCHUP_SECONDS } from '../constants';
import { isValidCronString } from '../utilities/cron';

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

export const formSchedulePoliciesSchema = z.object({
  overlapPolicy,
  pauseOnFailure: z.boolean().default(false),
  pauseSchedule: z.boolean().default(false),
  catchupWindow: durationString()
    .optional()
    .refine(
      (durationStr) => {
        const seconds = Number(parseDuration(durationStr));

        return seconds >= MIN_CATCHUP_SECONDS;
      },
      {
        message: 'Catchup window must be at least 10 seconds.',
      },
    ),
  taskTimeout: durationString().optional(),
  runTimeout: durationString().optional(),
  executionTimeout: durationString().optional(),
  keepOriginalWorkflowId: z.boolean().optional(),
});

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

export const formSpecSchema = z
  .object({
    kind: formSpecKind,
    cronString: z.string().trim().default(''),
    interval: z
      .object({
        interval: durationString().optional(),
        phase: durationString().optional(),
      })
      .default({}),
    calendar: structuredCalendarSchema(),
  })
  .superRefine((spec, ctx) => {
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
        } else if (!isValidCronString(spec.cronString)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Must be a valid cron string',
            path: ['cronString'],
          });
        }
        return;
      }

      case 'frozen': {
        return;
      }

      case 'interval': {
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

export const formScheduleTimingSchema = z.object({
  timezoneName: z.string().trim().default('UTC'),
  startTime: z.string().datetime().default(new Date().toISOString()),
  endKind: z.enum(['never', 'on', 'after']).default('never'),
  endTime: z.string().datetime().optional(),
  endAfterOccurrences: z.number().optional(),
});

export type FormScheduleTimingSchema = z.infer<typeof formScheduleTimingSchema>;

export const formScheduleSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(232, 'Name is too long'),
    workflowType: z.string().trim().min(1, 'Workflow type is required'),
    workflowId: z.string().trim().default(''),
    taskQueue: z.string().trim().min(1, 'Task queue is required'),
    input: jsonString().optional(),
    editInput: z.boolean().default(false),
    encoding: z.enum(['json/plain', 'json/protobuf']).default('json/plain'),
    messageType: z.string().trim().optional(),
    jitter: durationString().optional(),
    searchAttributes: searchAttributesSchema.default([]),
    workflowSearchAttributes: searchAttributesSchema.default([]),
    specs: z
      .array(formSpecSchema)
      .min(1, 'At least one schedule spec is required'),
  })
  .merge(formSchedulePoliciesSchema)
  .merge(formScheduleTimingSchema);

export type FormScheduleSchema = z.infer<typeof formScheduleSchema>;
