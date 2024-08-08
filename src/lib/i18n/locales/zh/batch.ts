export const Namespace = 'batch' as const;

export const Strings = {
  'nav-title': '批处理',
  'list-page-title': '批处理操作列表',
  'describe-page-title': '批处理操作',
  'empty-state-title': '无批处理操作',
  'back-link': '返回批处理操作列表',
  'operation-type': '操作类型',
  details: '操作详情',
  identity: '标识符',
  'total-operations': '操作总数',
  'operations-failed': '{{ count, number }} 失败',
  'operations-succeeded': '{{ count, number }} 成功',
  'operations-progress': '{{ percent }}% 完成',
  results: '操作结果',
  'max-concurrent-alert-title': '达到批处理操作并发数上限',
  'max-concurrent-alert-description':
    '只允许一个正在进行的批处理操作。如果你试图在当前已有一个批处理操作正在运行时创建一个新的批处理操作，它将会失败。',
  'job-id-input-hint':
    '工作ID必须是唯一的。如果留空，将使用随机生成的UUID。',
  'job-id-input-error': '工作ID必须只包含URL安全字符。',
} as const;
