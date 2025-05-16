export const Namespace = 'activities' as const;

export const Strings = {
  'pause-modal-confirmation': 'Pause Activity {{activityId}}',
  'pause-modal-description':
    'Resume executing this Activity, starting from where it left off and re-starting the clock toward its timeouts.',
  'paused-since': 'Paused Since',
  'paused-by': 'Paused By',
  'pause-reason': 'Paused Reason',
  'reset-modal-confirmation': 'Reset Activity {{activityId}}',
  'reset-modal-description':
    'Reset the execution of this Activity back to the initial attempt.',
  'apply-to-all-activity-types': 'Apply changes to all {{type}} runs',
  'pause-all-activity-types': 'Pause all {{type}} runs',
  'reset-heartbeat-details': 'Reset Heartbeat Details (optional)',
  'reset-success': 'Activity {{activityId}} has been reset successfully.',
};
