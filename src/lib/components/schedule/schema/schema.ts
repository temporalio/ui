import { z } from 'zod/v3';

import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';
import { searchAttributesSchema } from '$lib/stores/search-attributes';

import { DAYS_OF_MONTH, DAYS_OF_WEEK, MONTHS } from '../constants';
import { schedulePoliciesSchema } from './policies-schema';
import { isValidCronString } from '../utilities/cron';

export const scheduleSpecItemSchema = z
  .discriminatedUnion('type', [
    z.object({
      type: z.literal('unspecified'),
    }),
    z.object({
      type: z.literal('cron'),
      cronString: z.string().default(''),
    }),
    z.object({
      type: z.literal('week'),
      daysOfWeek: z.array(z.enum(DAYS_OF_WEEK)).min(1),
      time: z.object({
        hour: z.number().min(0).max(23).optional(),
        minute: z.number().min(0).max(59).optional(),
      }),
    }),
    z.object({
      type: z.literal('month'),
      daysOfMonth: z.array(z.enum(DAYS_OF_MONTH)).min(1),
      months: z.array(z.enum(MONTHS)).min(1),
      time: z.object({
        hour: z.number().min(0).max(23).optional(),
        minute: z.number().min(0).max(59).optional(),
      }),
    }),
    z.object({
      type: z.literal('interval'),
      interval: z.string().optional(),
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
        // no extra validation
        return;
      }

      case 'month': {
        // no extra validation
        return;
      }

      case 'interval': {
        const interval = Number(parseDuration(val.interval ?? ''));

        if (!interval) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Interval must be more than 0 seconds.',
            path: ['interval'],
          });
          return;
        }

        return;
      }

      case 'unspecified': {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Spec type is required',
          path: ['type'],
        });
        return;
      }
    }
  });

export type ScheduleSpecItem = z.infer<typeof scheduleSpecItemSchema>;

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
