import { z } from 'zod';

/**
 * Information about workflow drainage to help the user determine when it is safe
 *  to decommission a Version. Not present while version is current or ramping.
 *  Experimental. Worker Deployments are experimental and might significantly change in the future.
 */
export const VersionDrainageInfo = z
  .object({
    /**
     * Set to DRAINING when the version first stops accepting new executions (is no longer current or ramping).
     *  Set to DRAINED when no more open pinned workflows exist on this version.
     */
    status: z
      .enum([
        'VERSION_DRAINAGE_STATUS_UNSPECIFIED',
        'VERSION_DRAINAGE_STATUS_DRAINING',
        'VERSION_DRAINAGE_STATUS_DRAINED',
      ])
      .describe(
        'Set to DRAINING when the version first stops accepting new executions (is no longer current or ramping).\n Set to DRAINED when no more open pinned workflows exist on this version.',
      )
      .optional(),
    /**Last time the drainage status changed.*/
    lastChangedTime: z
      .string()
      .datetime({ offset: true })
      .describe('Last time the drainage status changed.')
      .optional(),
    /**Last time the system checked for drainage of this version.*/
    lastCheckedTime: z
      .string()
      .datetime({ offset: true })
      .describe('Last time the system checked for drainage of this version.')
      .optional(),
  })
  .describe(
    'Information about workflow drainage to help the user determine when it is safe\n to decommission a Version. Not present while version is current or ramping.\n Experimental. Worker Deployments are experimental and might significantly change in the future.',
  );
export type VersionDrainageInfo = z.infer<typeof VersionDrainageInfo>;
