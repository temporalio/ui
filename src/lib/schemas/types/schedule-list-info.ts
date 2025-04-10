import { z } from 'zod';

/**
 * ScheduleListInfo is an abbreviated set of values from Schedule and ScheduleInfo
 *  that's returned in ListSchedules.
 */
export const ScheduleListInfo = z
  .object({
    /**
     * From spec:
     *  Some fields are dropped from this copy of spec: timezone_data
     */
    spec: z
      .any()
      .describe(
        'From spec:\n Some fields are dropped from this copy of spec: timezone_data',
      )
      .optional(),
    /**
     * From action:
     *  Action is a oneof field, but we need to encode this in JSON and oneof fields don't work
     *  well with JSON. If action is start_workflow, this is set:
     */
    workflowType: z
      .any()
      .describe(
        "From action:\n Action is a oneof field, but we need to encode this in JSON and oneof fields don't work\n well with JSON. If action is start_workflow, this is set:",
      )
      .optional(),
    /**From state:*/
    notes: z.string().describe('From state:').optional(),
    paused: z.boolean().optional(),
    /**From info (maybe fewer entries):*/
    recentActions: z
      .array(z.any())
      .describe('From info (maybe fewer entries):')
      .optional(),
    futureActionTimes: z
      .array(z.string().datetime({ offset: true }))
      .optional(),
  })
  .describe(
    "ScheduleListInfo is an abbreviated set of values from Schedule and ScheduleInfo\n that's returned in ListSchedules.",
  );
export type ScheduleListInfo = z.infer<typeof ScheduleListInfo>;
