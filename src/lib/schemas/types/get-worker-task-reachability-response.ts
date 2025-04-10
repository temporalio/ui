import { z } from 'zod';

/**
 * [cleanup-wv-pre-release]
 *  Deprecated. Use `DescribeTaskQueue`.
 */
export const GetWorkerTaskReachabilityResponse = z
  .object({
    /**
     * Task reachability, broken down by build id and then task queue.
     *  When requesting a large number of task queues or all task queues associated with the given build ids in a
     *  namespace, all task queues will be listed in the response but some of them may not contain reachability
     *  information due to a server enforced limit. When reaching the limit, task queues that reachability information
     *  could not be retrieved for will be marked with a single TASK_REACHABILITY_UNSPECIFIED entry. The caller may issue
     *  another call to get the reachability for those task queues.
     *
     *  Open source users can adjust this limit by setting the server's dynamic config value for
     *  `limit.reachabilityTaskQueueScan` with the caveat that this call can strain the visibility store.
     */
    buildIdReachability: z
      .array(z.any())
      .describe(
        "Task reachability, broken down by build id and then task queue.\n When requesting a large number of task queues or all task queues associated with the given build ids in a\n namespace, all task queues will be listed in the response but some of them may not contain reachability\n information due to a server enforced limit. When reaching the limit, task queues that reachability information\n could not be retrieved for will be marked with a single TASK_REACHABILITY_UNSPECIFIED entry. The caller may issue\n another call to get the reachability for those task queues.\n\n Open source users can adjust this limit by setting the server's dynamic config value for\n `limit.reachabilityTaskQueueScan` with the caveat that this call can strain the visibility store.",
      )
      .optional(),
  })
  .describe('[cleanup-wv-pre-release]\n Deprecated. Use `DescribeTaskQueue`.');
export type GetWorkerTaskReachabilityResponse = z.infer<
  typeof GetWorkerTaskReachabilityResponse
>;
