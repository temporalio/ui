import { z } from 'zod';

/**Namespace capability details. Should contain what features are enabled in a namespace.*/
export const NamespaceInfo_Capabilities = z
  .object({
    /**True if the namespace supports eager workflow start.*/
    eagerWorkflowStart: z
      .boolean()
      .describe('True if the namespace supports eager workflow start.')
      .optional(),
    /**True if the namespace supports sync update*/
    syncUpdate: z
      .boolean()
      .describe('True if the namespace supports sync update')
      .optional(),
    /**True if the namespace supports async update*/
    asyncUpdate: z
      .boolean()
      .describe('True if the namespace supports async update')
      .optional(),
  })
  .describe(
    'Namespace capability details. Should contain what features are enabled in a namespace.',
  );
export type NamespaceInfo_Capabilities = z.infer<
  typeof NamespaceInfo_Capabilities
>;
