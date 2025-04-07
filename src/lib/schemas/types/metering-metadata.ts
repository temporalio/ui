import { z } from 'zod';

/**Metadata relevant for metering purposes*/
export const MeteringMetadata = z
  .object({
    /**
     * Count of local activities which have begun an execution attempt during this workflow task,
     *  and whose first attempt occurred in some previous task. This is used for metering
     *  purposes, and does not affect workflow state.
     *
     *  (-- api-linter: core::0141::forbidden-types=disabled
     *      aip.dev/not-precedent: Negative values make no sense to represent. --)
     */
    nonfirstLocalActivityExecutionAttempts: z
      .number()
      .int()
      .describe(
        'Count of local activities which have begun an execution attempt during this workflow task,\n and whose first attempt occurred in some previous task. This is used for metering\n purposes, and does not affect workflow state.\n\n (-- api-linter: core::0141::forbidden-types=disabled\n     aip.dev/not-precedent: Negative values make no sense to represent. --)',
      )
      .optional(),
  })
  .describe('Metadata relevant for metering purposes');
export type MeteringMetadata = z.infer<typeof MeteringMetadata>;
