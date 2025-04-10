import { z } from 'zod';

/**
 * Used by the worker versioning APIs, represents an unordered set of one or more versions which are
 *  considered to be compatible with each other. Currently the versions are always worker build IDs.
 */
export const CompatibleVersionSet = z
  .object({
    /**All the compatible versions, unordered, except for the last element, which is considered the set "default".*/
    buildIds: z
      .array(z.string())
      .describe(
        'All the compatible versions, unordered, except for the last element, which is considered the set "default".',
      )
      .optional(),
  })
  .describe(
    'Used by the worker versioning APIs, represents an unordered set of one or more versions which are\n considered to be compatible with each other. Currently the versions are always worker build IDs.',
  );
export type CompatibleVersionSet = z.infer<typeof CompatibleVersionSet>;
