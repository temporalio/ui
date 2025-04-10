import { z } from 'zod';

/**Holds all the extra information about workflow execution that is not part of Visibility.*/
export const WorkflowExecutionExtendedInfo = z
  .object({
    /**
     * Workflow execution expiration time is defined as workflow start time plus expiration timeout.
     *  Workflow start time may change after workflow reset.
     */
    executionExpirationTime: z
      .string()
      .datetime({ offset: true })
      .describe(
        'Workflow execution expiration time is defined as workflow start time plus expiration timeout.\n Workflow start time may change after workflow reset.',
      )
      .optional(),
    /**Workflow run expiration time is defined as current workflow run start time plus workflow run timeout.*/
    runExpirationTime: z
      .string()
      .datetime({ offset: true })
      .describe(
        'Workflow run expiration time is defined as current workflow run start time plus workflow run timeout.',
      )
      .optional(),
    /**indicates if the workflow received a cancel request*/
    cancelRequested: z
      .boolean()
      .describe('indicates if the workflow received a cancel request')
      .optional(),
    /**Last workflow reset time. Nil if the workflow was never reset.*/
    lastResetTime: z
      .string()
      .datetime({ offset: true })
      .describe(
        'Last workflow reset time. Nil if the workflow was never reset.',
      )
      .optional(),
    /**Original workflow start time.*/
    originalStartTime: z
      .string()
      .datetime({ offset: true })
      .describe('Original workflow start time.')
      .optional(),
    /**Reset Run ID points to the new run when this execution is reset. If the execution is reset multiple times, it points to the latest run.*/
    resetRunId: z
      .string()
      .describe(
        'Reset Run ID points to the new run when this execution is reset. If the execution is reset multiple times, it points to the latest run.',
      )
      .optional(),
  })
  .describe(
    'Holds all the extra information about workflow execution that is not part of Visibility.',
  );
export type WorkflowExecutionExtendedInfo = z.infer<
  typeof WorkflowExecutionExtendedInfo
>;
