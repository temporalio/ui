import { z } from 'zod';

/**See https://docs.temporal.io/docs/concepts/queries/*/
export const WorkflowQuery = z
  .object({
    /**The workflow-author-defined identifier of the query. Typically a function name.*/
    queryType: z
      .string()
      .describe(
        'The workflow-author-defined identifier of the query. Typically a function name.',
      )
      .optional(),
    /**Serialized arguments that will be provided to the query handler.*/
    queryArgs: z
      .any()
      .describe(
        'Serialized arguments that will be provided to the query handler.',
      )
      .optional(),
    /**
     * Headers that were passed by the caller of the query and copied by temporal
     *  server into the workflow task.
     */
    header: z
      .any()
      .describe(
        'Headers that were passed by the caller of the query and copied by temporal\n server into the workflow task.',
      )
      .optional(),
  })
  .describe('See https://docs.temporal.io/docs/concepts/queries/');
export type WorkflowQuery = z.infer<typeof WorkflowQuery>;
