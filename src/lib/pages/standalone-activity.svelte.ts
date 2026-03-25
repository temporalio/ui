import { SvelteDate } from 'svelte/reactivity';

import type { ActivityExecution } from '$lib/types/activity-execution';
import {
  formatSecondsAbbreviated,
  fromDurationToNumber,
} from '$lib/utilities/format-time';

interface ScheduleEntry {
  attempt: number;
  waitSeconds: number;
  runAt: Date;
}

export const MAX_ATTEMPTS = 50;

export class StandaloneActivity {
  private activityExecution: ActivityExecution | undefined = $state();

  public initialInterval: number | undefined = $state();
  public maximumInterval: number | undefined = $state();
  public maximumAttempts: number | undefined = $state();
  public backoffCoefficient: number | undefined = $state();
  public currentInterval: string = $state('-');
  public currentAttempt: number | undefined = $state();
  public scheduleTime: string | undefined = $state();
  public lastAttemptCompletedTime: string | undefined = $state();
  public nextAttemptScheduleTime: string | undefined = $state();
  public startToCloseTimeout: string = $state();
  public scheduleToCloseTimeout: string = $state();
  public scheduleToStartTimeout: string = $state();
  public heartbeatTimeout: string = $state();
  public closeTime: string | undefined = $state();
  public now = $state(SvelteDate.now());

  public running = $derived(
    this.activityExecution?.info?.status ===
      'ACTIVITY_EXECUTION_STATUS_RUNNING',
  );
  public schedule = $derived(
    this.buildSchedule(this.activityExecution?.info?.scheduleTime),
  );
  public upcomingAttempts = $derived(
    this.running
      ? this.buildUpcomingAttempts(
          this.activityExecution?.info?.scheduleTime,
          this.currentAttempt,
        )
      : [],
  );
  public attemptsRemaining = $derived(
    this.maximumAttempts - this.currentAttempt,
  );
  public retriedCount = $derived(this.currentAttempt - 1);
  public timeRemaining = $derived.by(() => {
    if (this.maximumAttempts) {
      let total = 0;
      for (let a = this.currentAttempt; a < this.maximumAttempts; a++) {
        total += Math.min(
          this.initialInterval * Math.pow(this.backoffCoefficient, a - 1),
          this.maximumInterval,
        );
      }
      return formatSecondsAbbreviated(total, false);
    }
  });
  public nextRetrySecondsLeft = $derived.by(() => {
    const nextTime = this.activityExecution?.info?.nextAttemptScheduleTime;
    if (!nextTime) return 0;
    return formatSecondsAbbreviated(
      Math.max(0, (new SvelteDate(nextTime).getTime() - this.now) / 1000),
      false,
    );
  });

  public deadlineTime = $derived.by(() => {
    if (
      !this.maximumAttempts ||
      !this.scheduleTime ||
      (this.startToCloseTimeout === '0s' &&
        this.scheduleToCloseTimeout === '0s')
    )
      return undefined;

    const scheduleToCloseSecondsLeft = fromDurationToNumber(
      this.scheduleToCloseTimeout,
    );

    const startToCloseSecondsLeft = fromDurationToNumber(
      this.startToCloseTimeout,
    );

    const retrySecondsLeft = this.upcomingAttempts.reduce(
      (sum, scheduleEntry) => {
        return sum + scheduleEntry.waitSeconds;
      },
      0,
    );

    const secondsLeft = Math.max(
      scheduleToCloseSecondsLeft,
      startToCloseSecondsLeft,
      retrySecondsLeft,
    );

    const deadline = new SvelteDate(
      new SvelteDate(this.scheduleTime).getTime() + secondsLeft * 1000,
    );

    return deadline;
  });

  public startToCloseSecondsLeft = $derived.by(() => {
    if (this.startToCloseTimeout === '0s') return;
    const startToCloseTimeoutSeconds = fromDurationToNumber(
      this.startToCloseTimeout,
    );

    const startToCloseTimeoutMillis = startToCloseTimeoutSeconds * 1000;

    const endTime = new SvelteDate(
      new SvelteDate(this.activityExecution.info.lastStartedTime).getTime() +
        startToCloseTimeoutMillis,
    );

    return formatSecondsAbbreviated(
      Math.max(0, (new SvelteDate(endTime).getTime() - this.now) / 1000),
      false,
    );
  });

  public scheduleToCloseSecondsLeft = $derived.by(() => {
    if (this.scheduleToCloseTimeout === '0s') return;
    const scheduleToCloseTimeoutSeconds = fromDurationToNumber(
      this.scheduleToCloseTimeout,
    );

    const scheduleToCloseTimeoutMillis = scheduleToCloseTimeoutSeconds * 1000;

    const endTime = new SvelteDate(
      new SvelteDate(this.activityExecution.info.lastStartedTime).getTime() +
        scheduleToCloseTimeoutMillis,
    );

    return formatSecondsAbbreviated(
      Math.max(0, (new SvelteDate(endTime).getTime() - this.now) / 1000),
      false,
    );
  });

  constructor(activityExecution: ActivityExecution | undefined) {
    this.activityExecution = activityExecution;
    this.currentAttempt = activityExecution?.info?.attempt;
    this.initialInterval = fromDurationToNumber(
      activityExecution?.info?.retryPolicy.initialInterval,
    );
    this.maximumInterval = fromDurationToNumber(
      activityExecution?.info?.retryPolicy.maximumInterval,
    );
    this.maximumAttempts = activityExecution?.info?.retryPolicy.maximumAttempts;
    this.backoffCoefficient =
      activityExecution?.info?.retryPolicy.backoffCoefficient;
    this.scheduleTime = activityExecution?.info?.scheduleTime;
    this.currentInterval = formatSecondsAbbreviated(
      fromDurationToNumber(activityExecution?.info?.currentRetryInterval),
      false,
    );
    this.lastAttemptCompletedTime =
      activityExecution?.info?.lastAttemptCompleteTime;
    this.nextAttemptScheduleTime =
      activityExecution?.info?.nextAttemptScheduleTime;
    this.closeTime = activityExecution?.info?.closeTime;
    this.scheduleToCloseTimeout =
      activityExecution?.info.scheduleToCloseTimeout;
    this.startToCloseTimeout = activityExecution?.info?.startToCloseTimeout;
    this.scheduleToStartTimeout =
      activityExecution?.info?.scheduleToStartTimeout;
    this.heartbeatTimeout = activityExecution?.info?.heartbeatTimeout;
  }

  public intervalForAttempt(attempt: number): number {
    return Math.min(
      this.initialInterval * Math.pow(this.backoffCoefficient, attempt - 1),
      this.maximumInterval,
    );
  }

  private buildUpcomingAttempts(
    scheduleTime: string | undefined,
    currentAttempt: number,
  ): ScheduleEntry[] {
    if (!scheduleTime) return [];
    const entries: ScheduleEntry[] = [];
    let offset = 0;
    const totalAttempts = this.maximumAttempts ?? MAX_ATTEMPTS + currentAttempt;

    for (let attempt = currentAttempt; attempt <= totalAttempts; attempt += 1) {
      const runAt = new SvelteDate(scheduleTime);
      const waitSeconds = Math.round(this.intervalForAttempt(attempt));

      runAt.setSeconds(runAt.getSeconds() + offset);

      entries.push({
        attempt,
        waitSeconds,
        runAt,
      });

      offset += waitSeconds;
    }

    return entries;
  }

  private buildSchedule(scheduleTime: string | undefined): ScheduleEntry[] {
    if (!scheduleTime) return [];
    const entries: ScheduleEntry[] = [];
    let offset = 0;
    const totalAttempts = this.maximumAttempts ?? MAX_ATTEMPTS;

    for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
      const runAt = new SvelteDate(scheduleTime);
      const waitSeconds = Math.round(this.intervalForAttempt(attempt));

      runAt.setSeconds(runAt.getSeconds() + offset);

      if (attempt <= MAX_ATTEMPTS) {
        entries.push({
          attempt,
          waitSeconds,
          runAt,
        });
      }

      offset += waitSeconds;
    }

    return entries;
  }
}
