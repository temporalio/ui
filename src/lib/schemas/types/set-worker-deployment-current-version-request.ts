import { z } from 'zod';

/**Set/unset the Current Version of a Worker Deployment.*/
export const SetWorkerDeploymentCurrentVersionRequest = z
  .object({
    namespace: z.string().optional(),
    deploymentName: z.string().optional(),
    /**
     * Required. Can be one of the following:
     *  - A Deployment Version identifier in the form "<deployment_name>.<build_id>".
     *  - Or, the "__unversioned__" special value, to represent all the unversioned workers (those
     *    with `UNVERSIONED` (or unspecified) `WorkerVersioningMode`.)
     */
    version: z
      .string()
      .describe(
        'Required. Can be one of the following:\n - A Deployment Version identifier in the form "<deployment_name>.<build_id>".\n - Or, the "__unversioned__" special value, to represent all the unversioned workers (those\n   with `UNVERSIONED` (or unspecified) `WorkerVersioningMode`.)',
      )
      .optional(),
    /**
     * Optional. This can be the value of conflict_token from a Describe, or another Worker
     *  Deployment API. Passing a non-nil conflict token will cause this request to fail if the
     *  Deployment's configuration has been modified between the API call that generated the
     *  token and this one.
     */
    conflictToken: z
      .string()
      .describe(
        "Optional. This can be the value of conflict_token from a Describe, or another Worker\n Deployment API. Passing a non-nil conflict token will cause this request to fail if the\n Deployment's configuration has been modified between the API call that generated the\n token and this one.",
      )
      .optional(),
    /**Optional. The identity of the client who initiated this request.*/
    identity: z
      .string()
      .describe(
        'Optional. The identity of the client who initiated this request.',
      )
      .optional(),
    /**
     * Optional. By default this request would be rejected if not all the expected Task Queues are
     *  being polled by the new Version, to protect against accidental removal of Task Queues, or
     *  worker health issues. Pass `true` here to bypass this protection.
     *  The set of expected Task Queues is the set of all the Task Queues that were ever poller by
     *  the existing Current Version of the Deployment, with the following exclusions:
     *    - Task Queues that are not used anymore (inferred by having empty backlog and a task
     *      add_rate of 0.)
     *    - Task Queues that are moved to another Worker Deployment (inferred by the Task Queue
     *      having a different Current Version than the Current Version of this deployment.)
     *  WARNING: Do not set this flag unless you are sure that the missing task queue pollers are not
     *  needed. If the request is unexpectedly rejected due to missing pollers, then that means the
     *  pollers have not reached to the server yet. Only set this if you expect those pollers to
     *  never arrive.
     */
    ignoreMissingTaskQueues: z
      .boolean()
      .describe(
        'Optional. By default this request would be rejected if not all the expected Task Queues are\n being polled by the new Version, to protect against accidental removal of Task Queues, or\n worker health issues. Pass `true` here to bypass this protection.\n The set of expected Task Queues is the set of all the Task Queues that were ever poller by\n the existing Current Version of the Deployment, with the following exclusions:\n   - Task Queues that are not used anymore (inferred by having empty backlog and a task\n     add_rate of 0.)\n   - Task Queues that are moved to another Worker Deployment (inferred by the Task Queue\n     having a different Current Version than the Current Version of this deployment.)\n WARNING: Do not set this flag unless you are sure that the missing task queue pollers are not\n needed. If the request is unexpectedly rejected due to missing pollers, then that means the\n pollers have not reached to the server yet. Only set this if you expect those pollers to\n never arrive.',
      )
      .optional(),
  })
  .describe('Set/unset the Current Version of a Worker Deployment.');
export type SetWorkerDeploymentCurrentVersionRequest = z.infer<
  typeof SetWorkerDeploymentCurrentVersionRequest
>;
