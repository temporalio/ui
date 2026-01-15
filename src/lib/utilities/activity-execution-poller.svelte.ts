import { writable, type Writable } from 'svelte/store';

import {
  getActivityExecution,
  pollActivityExecution,
} from '$lib/services/standalone-activities';
import type { ActivityExecution } from '$lib/types/activity-execution';

import { isEmptyObject } from './is';

export const activityExecution: Writable<ActivityExecution | undefined> =
  writable();

export class ActivityExecutionPoller {
  private abortController: AbortController;
  private namespace: string;
  private activityId: string;
  private runId: string;
  private token: string;
  private onUpdate: (activityExecution: ActivityExecution) => void;

  constructor(
    namespace: string,
    activityId: string,
    abortController: AbortController,
    onUpdate: (activityExecution: ActivityExecution) => void,
  ) {
    this.namespace = namespace;
    this.activityId = activityId;
    this.abortController = abortController;
    this.onUpdate = onUpdate;
  }

  async start() {
    const activityExecution = await getActivityExecution(
      this.namespace,
      this.activityId,
    );

    this.onUpdate(activityExecution);

    if (activityExecution.info.status === 'ACTIVITY_EXECUTION_STATUS_RUNNING') {
      this.runId = activityExecution.runId;
      this.token = activityExecution.longPollToken;

      while (!this.abortController.signal.aborted) {
        try {
          const polledActivityExecution = await pollActivityExecution(
            this.namespace,
            this.activityId,
            this.runId,
            this.token,
            this.abortController.signal,
          );
          if (!isEmptyObject(polledActivityExecution)) {
            this.token = polledActivityExecution.longPollToken;
            this.onUpdate(polledActivityExecution);
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') break;
          console.error('Polling error:', error);
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }
  }
}
