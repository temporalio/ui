import { z } from 'zod/v3';

import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';
import { searchAttributesSchema } from '$lib/stores/search-attributes';

import { durationString, jsonString, structuredCalendarSchema } from './common';
import { MIN_CATCHUP_SECONDS } from '../constants';

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

const schedulePoliciesSchema = z.object({
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

export type SchedulePoliciesSchema = z.infer<typeof schedulePoliciesSchema>;

const specFormSchema = z.object({
  kind: z.enum(['cron', 'interval', 'week', 'month', 'frozen']),
  cronString: z.string().trim().default(''),
  interval: z
    .object({
      interval: durationString().optional(),
      phase: durationString().optional(),
    })
    .default({}),
  calendar: structuredCalendarSchema(),
});

export type SpecFormSchema = z.infer<typeof specFormSchema>;

export const scheduleFormSchema = z
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
    timezoneName: z.string().trim().default('UTC'),
    startTime: z.string().datetime().default(new Date().toISOString()),
    endKind: z.enum(['never', 'on', 'after']).default('never'),
    endTime: z.string().datetime().optional(),
    endAfterOccurences: z.number().optional(),
    jitter: durationString().optional(),
    searchAttributes: searchAttributesSchema.default([]),
    workflowSearchAttributes: searchAttributesSchema.default([]),
    specs: z
      .array(specFormSchema)
      .min(1, 'At least one schedule spec is required'),
  })
  .merge(schedulePoliciesSchema);

export type ScheduleFormSchema = z.infer<typeof scheduleFormSchema>;
