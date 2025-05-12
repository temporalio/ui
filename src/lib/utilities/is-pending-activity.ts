import { z } from 'zod';

import type { PendingActivity, PendingNexusOperation } from '$lib/types/events';

/**
 * Zod schema for validating a PendingActivity object
 * Requires an object with an activityType property that's not undefined
 */
const pendingActivitySchema = z
  .object({
    activityType: z.unknown().refine((val) => val !== undefined),
  })
  .strict()
  .passthrough();

/**
 * Zod schema for validating a PendingNexusOperation object
 * Requires an object with both operation and endpoint properties that are not undefined
 */
const pendingNexusOperationSchema = z
  .object({
    operation: z.unknown().refine((val) => val !== undefined),
    endpoint: z.unknown().refine((val) => val !== undefined),
  })
  .strict()
  .passthrough();

/**
 * Checks if the provided value is a PendingActivity
 * @param event - The value to check
 * @returns A type guard indicating if the value is a PendingActivity
 */
export const isPendingActivity = (event: unknown): event is PendingActivity =>
  pendingActivitySchema.safeParse(event).success;

/**
 * Checks if the provided value is a PendingNexusOperation
 * @param event - The value to check
 * @returns A type guard indicating if the value is a PendingNexusOperation
 */
export const isPendingNexusOperation = (
  event: unknown,
): event is PendingNexusOperation =>
  pendingNexusOperationSchema.safeParse(event).success;
