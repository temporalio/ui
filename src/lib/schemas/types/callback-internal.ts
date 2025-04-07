import { z } from 'zod';

/**
 * Callbacks to be delivered internally within the system.
 *  This variant is not settable in the API and will be rejected by the service with an INVALID_ARGUMENT error.
 *  The only reason that this is exposed is because callbacks are replicated across clusters via the
 *  WorkflowExecutionStarted event, which is defined in the public API.
 */
export const Callback_Internal = z
  .object({
    /**Opaque internal data.*/
    data: z.string().describe('Opaque internal data.').optional(),
  })
  .describe(
    'Callbacks to be delivered internally within the system.\n This variant is not settable in the API and will be rejected by the service with an INVALID_ARGUMENT error.\n The only reason that this is exposed is because callbacks are replicated across clusters via the\n WorkflowExecutionStarted event, which is defined in the public API.',
  );
export type Callback_Internal = z.infer<typeof Callback_Internal>;
