import { z } from 'zod';

export const UpdateScheduleRequest = z.object({
  /**The namespace of the schedule to update.*/
  namespace: z
    .string()
    .describe('The namespace of the schedule to update.')
    .optional(),
  /**The id of the schedule to update.*/
  scheduleId: z
    .string()
    .describe('The id of the schedule to update.')
    .optional(),
  /**
   * The new schedule. The four main fields of the schedule (spec, action,
   *  policies, state) are replaced completely by the values in this message.
   */
  schedule: z
    .any()
    .describe(
      'The new schedule. The four main fields of the schedule (spec, action,\n policies, state) are replaced completely by the values in this message.',
    )
    .optional(),
  /**
   * This can be the value of conflict_token from a DescribeScheduleResponse,
   *  which will cause this request to fail if the schedule has been modified
   *  between the Describe and this Update.
   *  If missing, the schedule will be updated unconditionally.
   */
  conflictToken: z
    .string()
    .describe(
      'This can be the value of conflict_token from a DescribeScheduleResponse,\n which will cause this request to fail if the schedule has been modified\n between the Describe and this Update.\n If missing, the schedule will be updated unconditionally.',
    )
    .optional(),
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
  /**
   * Schedule search attributes to be updated.
   *  Do not set this field if you do not want to update the search attributes.
   *  A non-null empty object will set the search attributes to an empty map.
   *  Note: you cannot only update the search attributes with `UpdateScheduleRequest`,
   *  you must also set the `schedule` field; otherwise, it will unset the schedule.
   */
  searchAttributes: z
    .any()
    .describe(
      'Schedule search attributes to be updated.\n Do not set this field if you do not want to update the search attributes.\n A non-null empty object will set the search attributes to an empty map.\n Note: you cannot only update the search attributes with `UpdateScheduleRequest`,\n you must also set the `schedule` field; otherwise, it will unset the schedule.',
    )
    .optional(),
});
export type UpdateScheduleRequest = z.infer<typeof UpdateScheduleRequest>;
