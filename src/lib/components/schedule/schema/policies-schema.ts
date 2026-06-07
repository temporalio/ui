import { z } from 'zod/v3';

import { MIN_CATCHUP_SECONDS } from '../constants';

const durationToSeconds = (value: string): number | null => {
  if (!value) return null;
  const seconds = Number(value.replace(/s$/, ''));
  return Number.isFinite(seconds) ? seconds : null;
};

const optionalDuration = (message: string) =>
  z
    .string()
    .optional()
    .default('')
    .refine(
      (value) => {
        if (!value) return true;
        const seconds = durationToSeconds(value);
        return seconds !== null && seconds >= 0;
      },
      { message },
    );

export const schedulePoliciesSchema = z.object({
  overlapPolicy: z
    .enum([
      'Skip',
      'BufferOne',
      'BufferAll',
      'CancelOther',
      'TerminateOther',
      'AllowAll',
    ])
    .optional()
    .default('Skip'),
  pauseOnFailure: z.boolean(),
  pauseSchedule: z.boolean().optional().default(false),
  catchupWindow: z
    .string()
    .optional()
    .default('')
    .refine(
      (value) => {
        if (!value) return true;
        const seconds = durationToSeconds(value);
        return seconds !== null && seconds >= MIN_CATCHUP_SECONDS;
      },
      { message: 'Catchup window must be at least 10 seconds.' },
    ),
  taskTimeout: optionalDuration('Task timeout must be a valid duration.'),
  runTimeout: optionalDuration('Run timeout must be a valid duration.'),
  executionTimeout: optionalDuration(
    'Execution timeout must be a valid duration.',
  ),
});

export type SchedulePoliciesData = z.infer<typeof schedulePoliciesSchema>;
