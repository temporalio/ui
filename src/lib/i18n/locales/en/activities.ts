export const Namespace = 'activities' as const;

export const Strings = {
  'pause-modal-confirmation': 'Pause Activity {{activityId}}',
  'pause-modal-description':
    'Pause stops new attempts, but Activity timeout deadlines continue. Use Update Activity Options to extend timeouts before a long pause.',
  'pause-modal-docs-link': 'Important considerations',
  'unpause-modal-confirmation': 'Unpause Activity {{activityId}}',
  'unpause-modal-description': 'Resume executing this Activity.',
  'paused-since': 'Paused Since',
  'paused-by': 'Paused By',
  'pause-reason': 'Paused Reason',
  'reset-modal-confirmation': 'Reset Activity {{activityId}}',
  'reset-modal-description':
    'Reset the execution of this Activity back to the initial attempt.',
  'reset-heartbeat-details': 'Reset Heartbeat Details (optional)',
  'reset-success': 'Activity {{activityId}} has been reset successfully.',
  'resume-tooltip': 'Resume this Activity',
  'pause-tooltip':
    'Pauses this Activity before its next retry or heartbeat. Timeout deadlines continue while paused.',
  'retry-max-attempts': 'Retry Max Attempts',
  'retry-max-attempts-description':
    'Maximum number of attempts. When exceeded the retries stop even if not expired yet. 1 disables retries. 0 means unlimited (up to the timeouts).',
  'retry-backoff-coefficient': 'Retry Backoff Coefficient',
  'retry-backoff-coefficient-description':
    'Coefficient used to calculate the next retry interval. The next retry interval is previous interval multiplied by the coefficient. Must be 1 or larger.',
  'retry-initial-interval-duration': 'Retry Initial Interval Duration',
  'retry-initial-interval-duration-description':
    'Interval of the first retry. If retryBackoffcoefficient is 1.0, then it is used for all retries.',
  'schedule-to-start-timeout-duration': 'Schedule to Start Timeout Duration',
  'schedule-to-start-timeout-duration-description':
    'Limits time an activity task can stay in a task queue before a worker picks it up. Defaults to "Schedule to Close Timeout" if not specified. Timer starts after any start delay. This timeout is always non-retryable.',
  'schedule-to-close-timeout-duration': 'Schedule to Close Timeout Duration',
  'schedule-to-close-timeout-duration-description':
    'How long the caller is willing to wait for an activity completion. Limits how long retries will be attempted. Timer starts after any start delay.',
  'start-to-close-timeout-duration': 'Start to Close Timeout Duration',
  'start-to-close-timeout-duration-description':
    'Maximum time an activity is allowed to execute after being picked up by a worker. Start time begins after any start delay. This timeout is always retryable.',
  'heartbeat-timeout-duration': 'Heartbeat Timeout Duration',
  'heartbeat-timeout-duration-description':
    'Maximum permitted time between successful Worker Heartbeats.',
  'task-queue-name': 'Task Queue Name',
};
