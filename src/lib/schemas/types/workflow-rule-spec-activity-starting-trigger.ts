import { z } from 'zod';

/**Activity trigger will be triggered when an activity is about to start.*/
export const WorkflowRuleSpec_ActivityStartingTrigger = z
  .object({
    /**
     * Activity predicate is a SQL-like string filter parameter.
     *  It is used to match against workflow data.
     *  The following activity attributes are supported as part of the predicate:
     *  - ActivityType: An Activity Type is the mapping of a name to an Activity Definition..
     *  - ActivityId: The ID of the activity.
     *  - ActivityAttempt: The number attempts of the activity.
     *  - BackoffInterval: The current amount of time between scheduled attempts of the activity.
     *  - ActivityStatus: The status of the activity. Can be one of "Scheduled", "Started", "Paused".
     *  - TaskQueue: The name of the task queue the workflow specified that the activity should run on.
     *  Activity predicate support the following operators:
     *   * =, !=, >, >=, <, <=
     *   * AND, OR, ()
     *   * BETWEEN ... AND
     *     STARTS_WITH
     */
    predicate: z
      .string()
      .describe(
        'Activity predicate is a SQL-like string filter parameter.\n It is used to match against workflow data.\n The following activity attributes are supported as part of the predicate:\n - ActivityType: An Activity Type is the mapping of a name to an Activity Definition..\n - ActivityId: The ID of the activity.\n - ActivityAttempt: The number attempts of the activity.\n - BackoffInterval: The current amount of time between scheduled attempts of the activity.\n - ActivityStatus: The status of the activity. Can be one of "Scheduled", "Started", "Paused".\n - TaskQueue: The name of the task queue the workflow specified that the activity should run on.\n Activity predicate support the following operators:\n  * =, !=, >, >=, <, <=\n  * AND, OR, ()\n  * BETWEEN ... AND\n    STARTS_WITH',
      )
      .optional(),
  })
  .describe(
    'Activity trigger will be triggered when an activity is about to start.',
  );
export type WorkflowRuleSpec_ActivityStartingTrigger = z.infer<
  typeof WorkflowRuleSpec_ActivityStartingTrigger
>;
