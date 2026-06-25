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
};
