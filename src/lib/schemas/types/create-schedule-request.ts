import { z } from 'zod';

/**
 * (-- api-linter: core::0203::optional=disabled
 *      aip.dev/not-precedent: field_behavior annotation not available in our gogo fork --)
 */
export const CreateScheduleRequest = z
  .object({
    /**The namespace the schedule should be created in.*/
    namespace: z
      .string()
      .describe('The namespace the schedule should be created in.')
      .optional(),
    /**The id of the new schedule.*/
    scheduleId: z.string().describe('The id of the new schedule.').optional(),
    /**The schedule spec, policies, action, and initial state.*/
    schedule: z
      .any()
      .describe('The schedule spec, policies, action, and initial state.')
      .optional(),
    /**Optional initial patch (e.g. to run the action once immediately).*/
    initialPatch: z
      .any()
      .describe(
        'Optional initial patch (e.g. to run the action once immediately).',
      )
      .optional(),
    /**The identity of the client who initiated this request.*/
    identity: z
      .string()
      .describe('The identity of the client who initiated this request.')
      .optional(),
    /**A unique identifier for this create request for idempotence. Typically UUIDv4.*/
    requestId: z
      .string()
      .describe(
        'A unique identifier for this create request for idempotence. Typically UUIDv4.',
      )
      .optional(),
    /**Memo and search attributes to attach to the schedule itself.*/
    memo: z
      .any()
      .describe('Memo and search attributes to attach to the schedule itself.')
      .optional(),
    searchAttributes: z.any().optional(),
  })
  .describe(
    '(-- api-linter: core::0203::optional=disabled\n     aip.dev/not-precedent: field_behavior annotation not available in our gogo fork --)',
  );
export type CreateScheduleRequest = z.infer<typeof CreateScheduleRequest>;
