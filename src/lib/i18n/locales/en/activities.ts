export const Namespace = 'activities' as const;

export const Strings = {
  'pause-modal-confirmation': 'Pause Activity {{activityId}}',
  'pause-modal-description': 'Pause executing this Activity.',
  'unpause-modal-confirmation': 'Unpause Activity {{activityId}}',
  'unpause-modal-description': 'Resume executing this Activity.',
  'paused-since': 'Paused Since',
  'paused-by': 'Paused By',
  'pause-reason': 'Paused Reason',
  'reset-modal-confirmation': 'Reset Activity {{activityId}}',
  'reset-modal-description':
    'Reset the execution of this Activity back to the initial attempt.',
  'apply-to-all-activity-types': 'Apply changes to all {{type}} runs',
  'pause-all-activity-types': 'Pause all {{type}} runs',
  'unpause-all-activity-types': 'Unpause all {{type}} runs',
  'reset-heartbeat-details': 'Reset Heartbeat Details (optional)',
  'reset-success': 'Activity {{activityId}} has been reset successfully.',
  'activity-options': 'Activity Options',
  'start-to-close-timeout': 'Start to Close Timeout',
  'schedule-to-start-timeout': 'Schedule to Start Timeout',
  'schedule-to-close-timeout': 'Schedule to Close Timeout',
  'heartbeat-timeout': 'Heartbeat Timeout',
  'retry-policy-initial-interval': 'Retry Policy Initial Interval',
  'retry-policy-backoff-coefficient': 'Retry Policy Backoff Coefficient',
  'retry-policy-maximum-interval': 'Retry Policy Maximum Interval',
  'retry-policy-maximum-attempts': 'Retry Policy Maximum Attempts',
};
