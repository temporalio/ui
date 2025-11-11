export const Namespace = 'nexus' as const;

export const Strings = {
  nexus: '枢纽',
  'nexus-endpoint': '枢纽端点 | {{id}}',
  endpoint: '端点',
  endpoints: '枢纽端点',
  'all-endpoints': '所有端点',
  'my-endpoints': '我的端点',
  'back-to-endpoints': '返回枢纽端点列表',
  'back-to-endpoint': '返回枢纽端点详情',
  'create-endpoint': '创建枢纽端点',
  'endpoint-name': '端点名称',
  'endpoint-name-placeholder': '枢纽端点必须拥有唯一的名字',
  'select-endpoint': '选择一个端点',
  'task-queue-placeholder': '请输入一个任务队列',
  'endpoint-alias': '端点别名',
  target: '目标',
  'target-description':
    '指定Worker将轮询的目标空间和任务队列。',
  'target-namespace': '目标空间',
  'select-namespace': '选择一个空间',
  'nexus-description':
    '添加链接至您的仓库或说明，以帮助账户中的其他用户使用这个端点。',
  'description-placeholder':
    '// 提供一个readme，让用户了解如何使用这个端点',
  handler: '处理器',
  'delete-endpoint': '删除端点',
  'delete-modal-title': '确认删除枢纽端点?',
  'delete-modal-confirmation':
    '您确定要删除{{endpoint}}吗？任何调用该端点的工作流都将遭遇失败。',
  'delete-modal-confirmation-label':
    '输入“DELETE {{endpoint}}"以删除此端点。',
  'endpoint-name-hint':
    '端点名称必须以A-Z、a-z或_开头，并且只能包含A-Z、a-z、0-9或_字符',
  'access-policy': '访问策略',
  'allowed-caller-namespaces': '允许调用者空间',
  'allowed-caller-namespaces-description':
    '指定允许调用目标空间以使用此端点的空间(s)。',
  'select-namespaces': '选择空间(s)',
  'selected-namespaces_one': '{{count}}个空间被选中',
  'selected-namespaces_other': '{{count}}个空间被选中'
} as const;
