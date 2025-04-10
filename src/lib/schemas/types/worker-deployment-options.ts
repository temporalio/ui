import { z } from 'zod';

/**
 * Worker Deployment options set in SDK that need to be sent to server in every poll.
 *  Experimental. Worker Deployments are experimental and might significantly change in the future.
 */
export const WorkerDeploymentOptions = z
  .object({
    /**Required. Worker Deployment name.*/
    deploymentName: z
      .string()
      .describe('Required. Worker Deployment name.')
      .optional(),
    /**
     * The Build ID of the worker. Required when `worker_versioning_mode==VERSIONED`, in which case,
     *  the worker will be part of a Deployment Version identified by "<deployment_name>.<build_id>".
     */
    buildId: z
      .string()
      .describe(
        'The Build ID of the worker. Required when `worker_versioning_mode==VERSIONED`, in which case,\n the worker will be part of a Deployment Version identified by "<deployment_name>.<build_id>".',
      )
      .optional(),
    /**
     * Required. Versioning Mode for this worker. Must be the same for all workers with the
     *  same `deployment_name` and `build_id` combination, across all Task Queues.
     *  When `worker_versioning_mode==VERSIONED`, the worker will be part of a Deployment Version
     *  identified by "<deployment_name>.<build_id>".
     */
    workerVersioningMode: z
      .enum([
        'WORKER_VERSIONING_MODE_UNSPECIFIED',
        'WORKER_VERSIONING_MODE_UNVERSIONED',
        'WORKER_VERSIONING_MODE_VERSIONED',
      ])
      .describe(
        'Required. Versioning Mode for this worker. Must be the same for all workers with the\n same `deployment_name` and `build_id` combination, across all Task Queues.\n When `worker_versioning_mode==VERSIONED`, the worker will be part of a Deployment Version\n identified by "<deployment_name>.<build_id>".',
      )
      .optional(),
  })
  .describe(
    'Worker Deployment options set in SDK that need to be sent to server in every poll.\n Experimental. Worker Deployments are experimental and might significantly change in the future.',
  );
export type WorkerDeploymentOptions = z.infer<typeof WorkerDeploymentOptions>;
