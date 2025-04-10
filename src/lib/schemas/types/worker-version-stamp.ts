import { z } from 'zod';

/**
 * Deprecated. This message is replaced with `Deployment` and `VersioningBehavior`.
 *  Identifies the version(s) of a worker that processed a task
 */
export const WorkerVersionStamp = z
  .object({
    /**
     * An opaque whole-worker identifier. Replaces the deprecated `binary_checksum` field when this
     *  message is included in requests which previously used that.
     */
    buildId: z
      .string()
      .describe(
        'An opaque whole-worker identifier. Replaces the deprecated `binary_checksum` field when this\n message is included in requests which previously used that.',
      )
      .optional(),
    /**
     * If set, the worker is opting in to worker versioning. Otherwise, this is used only as a
     *  marker for workflow reset points and the BuildIDs search attribute.
     */
    useVersioning: z
      .boolean()
      .describe(
        'If set, the worker is opting in to worker versioning. Otherwise, this is used only as a\n marker for workflow reset points and the BuildIDs search attribute.',
      )
      .optional(),
  })
  .describe(
    'Deprecated. This message is replaced with `Deployment` and `VersioningBehavior`.\n Identifies the version(s) of a worker that processed a task',
  );
export type WorkerVersionStamp = z.infer<typeof WorkerVersionStamp>;
