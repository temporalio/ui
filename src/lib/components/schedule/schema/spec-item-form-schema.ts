import { z } from 'zod/v3';

import { parseDuration } from '$lib/holocene/duration-input/duration-input.svelte';

import { DAYS_OF_MONTH, DAYS_OF_WEEK, MONTHS } from '../constants';
import { isValidCronString } from '../utilities/cron';

export const scheduleSpecItemFormSchema = z
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

export type ScheduleSpecItem = z.infer<typeof scheduleSpecItemFormSchema>;
