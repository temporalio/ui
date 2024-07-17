export const Namespace = 'workers' as const;

export const Strings = {
  workers: 'Workers',
  version: '版本',
  versioning: '版本控制',
  retirability: '可退役能力',
  buildId: '构建ID',
  'assignment-rules': '分配规则',
  'redirect-rules': '重定向规则',
  default: '默认',
  overall: '总体',
  'compatible-build-ids': '兼容构建ID',
  'version-sets': '版本集',
  'no-version-sets-found': '找不到版本集',
  'no-assignment-rules-found': '找不到分配规则',
  'no-redirect-rules-found': '找不到重定向规则',
  'show-inactive-assignment-rules': '显示非活跃分配规则',
  'last-used-version': '最后使用的版本',
  'next-version': '下一版本',
  'ready-to-be-retired': '准备退役',
  'max-version-sets-title': '兼容版本集的数量已达上限',
  'max-version-sets-description':
    '您可以通过动态配置属性limit.versionCompatibleSetsPerQueue增加兼容版本集的数量。'
} as const;
