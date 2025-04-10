import { z } from 'zod';

/**[cleanup-wv-pre-release]*/
export const GetWorkerVersioningRulesResponse = z
  .object({
    assignmentRules: z.array(z.any()).optional(),
    compatibleRedirectRules: z.array(z.any()).optional(),
    /**
     * This value can be passed back to UpdateWorkerVersioningRulesRequest to
     *  ensure that the rules were not modified between this List and the Update,
     *  which could lead to lost updates and other confusion.
     */
    conflictToken: z
      .string()
      .describe(
        'This value can be passed back to UpdateWorkerVersioningRulesRequest to\n ensure that the rules were not modified between this List and the Update,\n which could lead to lost updates and other confusion.',
      )
      .optional(),
  })
  .describe('[cleanup-wv-pre-release]');
export type GetWorkerVersioningRulesResponse = z.infer<
  typeof GetWorkerVersioningRulesResponse
>;
