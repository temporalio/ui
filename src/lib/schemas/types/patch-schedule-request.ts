import { z } from 'zod';

export const PatchScheduleRequest = z.object({
  /**The namespace of the schedule to patch.*/
  namespace: z
    .string()
    .describe('The namespace of the schedule to patch.')
    .optional(),
  /**The id of the schedule to patch.*/
  scheduleId: z
    .string()
    .describe('The id of the schedule to patch.')
    .optional(),
  patch: z.any().optional(),
  /**The identity of the client who initiated this request.*/
  identity: z
    .string()
    .describe('The identity of the client who initiated this request.')
    .optional(),
  /**A unique identifier for this update request for idempotence. Typically UUIDv4.*/
  requestId: z
    .string()
    .describe(
      'A unique identifier for this update request for idempotence. Typically UUIDv4.',
    )
    .optional(),
});
export type PatchScheduleRequest = z.infer<typeof PatchScheduleRequest>;
