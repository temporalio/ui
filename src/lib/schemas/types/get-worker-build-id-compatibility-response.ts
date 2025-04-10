import { z } from 'zod';

/**[cleanup-wv-pre-release]*/
export const GetWorkerBuildIdCompatibilityResponse = z
  .object({
    /**
     * Major version sets, in order from oldest to newest. The last element of the list will always
     *  be the current default major version. IE: New workflows will target the most recent version
     *  in that version set.
     *
     *  There may be fewer sets returned than exist, if the request chose to limit this response.
     */
    majorVersionSets: z
      .array(z.any())
      .describe(
        'Major version sets, in order from oldest to newest. The last element of the list will always\n be the current default major version. IE: New workflows will target the most recent version\n in that version set.\n\n There may be fewer sets returned than exist, if the request chose to limit this response.',
      )
      .optional(),
  })
  .describe('[cleanup-wv-pre-release]');
export type GetWorkerBuildIdCompatibilityResponse = z.infer<
  typeof GetWorkerBuildIdCompatibilityResponse
>;
