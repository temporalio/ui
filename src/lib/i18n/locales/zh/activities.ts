export { Namespace } from '../en/activities';

export const Strings = {
  'pause-modal-confirmation': '暂停活动 {{activityId}}',
  'pause-modal-description':
    '暂停会停止新的尝试，但活动的超时期限仍会继续计时。如需长时间暂停，请先使用「更新活动选项」延长超时设置。',
  'pause-modal-docs-link': '重要注意事项',
  'unpause-modal-confirmation': '恢复活动 {{activityId}}',
  'unpause-modal-description': '恢复执行此活动。',
  'paused-since': '暂停开始于',
  'paused-by': '暂停操作者',
  'pause-reason': '暂停原因',
  'reset-modal-confirmation': '重置活动 {{activityId}}',
  'reset-modal-description': '将此活动的执行重置回首次尝试。',
  'reset-heartbeat-details': '重置心跳详情（可选）',
  'reset-success': '活动 {{activityId}} 已成功重置。',
  'update-options-success': '活动 {{activityId}} 的选项已更新。',
  'update-options-error': '活动 {{activityId}} 的选项更新失败：{{error}}',
  'resume-tooltip': '恢复此活动',
  'pause-tooltip':
    '在下次重试或心跳前暂停此活动。暂停期间超时期限仍会继续计时。',
  'retry-max-attempts': '重试最大尝试次数',
  'retry-max-attempts-error': '请输入大于等于 0 的整数。',
  'retry-max-attempts-description':
    '最大尝试次数。超过后即使尚未过期，重试也会停止。1 表示禁用重试，0 表示不限制（受超时时间约束）。',
  'retry-backoff-coefficient': '重试退避系数',
  'retry-backoff-coefficient-error': '请输入大于等于 1 的数字。',
  'retry-backoff-coefficient-description':
    '用于计算下次重试间隔的系数。下次重试间隔 = 上次间隔 × 系数。必须大于等于 1。',
  'retry-initial-interval-duration': '重试初始间隔时长',
  'retry-initial-interval-duration-description':
    '首次重试的间隔。若 retryBackoffcoefficient 为 1.0，则所有重试都使用该间隔。',
  'schedule-to-start-timeout-duration': '调度到开始超时时长',
  'schedule-to-start-timeout-duration-description':
    '限制活动任务在被 Worker 领取前可在任务队列中停留的时间。未指定时默认为「调度到关闭超时」。计时器在任何启动延迟之后开始。此超时始终不可重试。',
  'schedule-to-close-timeout-duration': '调度到关闭超时时长',
  'schedule-to-close-timeout-duration-description':
    '调用方愿意等待活动完成的时间。它限制了重试持续尝试的时长。计时器在任何启动延迟之后开始。',
  'start-to-close-timeout-duration': '开始到关闭超时时长',
  'start-to-close-timeout-duration-description':
    '活动被 Worker 领取后允许执行的最长时间。开始时间从启动延迟之后算起。此超时始终可重试。',
  'heartbeat-timeout-duration': '心跳超时时长',
  'heartbeat-timeout-duration-description':
    '两次成功的 Worker 心跳之间允许的最长时间。',
  'task-queue-name': '任务队列名称',
  'heartbeat-timeout': '心跳超时',
  'retry-initial-interval': '重试初始间隔',
  'retry-maximum-interval': '重试最大间隔',
  'updated-activity-options': '已更新的活动选项',
} as const;
