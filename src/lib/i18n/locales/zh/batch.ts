export { Namespace } from '../en/batch';

export const Strings = {
  'nav-title': '批处理',
  'list-page-title': '批处理操作',
  'describe-page-title': '批处理操作详情',
  'empty-state-title': '暂无批处理操作',
  'back-link': '返回批处理操作',
  'operation-type': '操作类型',
  details: '操作详情',
  identity: '身份标识',
  'total-operations': '操作总数',
  'operations-failed': '{{ count, number }} 个失败',
  'operations-succeeded': '{{ count, number }} 个成功',
  'operations-progress': '已完成 {{ percent }}%',
  results: '操作结果',
  'max-concurrent-alert-title': '已达到并发批处理操作上限',
  'max-concurrent-alert-description':
    '仅允许同时进行 1 个批处理操作。如果当前已有批处理操作在运行，再尝试创建新的批处理操作将会失败。',
  'job-id-input-hint':
    'Job ID 必须唯一。若留空，将使用随机生成的 UUID。',
  'job-id-input-error': 'Job ID 只能包含 URL 安全字符',
} as const;
