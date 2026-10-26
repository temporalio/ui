import { proxyActivities, sleep } from '@temporalio/workflow';

import type * as activities from './activity.js';

// Keep each activity at ActivityTaskScheduled so its pending line is easy to see.
// The catalog worker deliberately does not poll this queue.
const UNPOLLED_TASK_QUEUE = 'catalog-scheduled-activity-timeline-unpolled';

export async function scheduledActivityTimeline(
  initialDelaySeconds = 15,
  intervalSeconds = 3,
  activityCount = 5,
): Promise<string[]> {
  await sleep(`${initialDelaySeconds} seconds`);

  return Promise.all(
    Array.from({ length: activityCount }, async (_, index) => {
      if (index > 0) await sleep(`${index * intervalSeconds} seconds`);

      return proxyActivities<typeof activities>({
        taskQueue: UNPOLLED_TASK_QUEUE,
        startToCloseTimeout: '10 seconds',
        summary: `Scheduled activity ${index + 1}`,
      }).timelineUnpolledActivity(index + 1);
    }),
  );
}
