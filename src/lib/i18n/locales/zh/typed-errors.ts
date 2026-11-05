export { Namespace } from '../en/typed-errors';

export const Strings = {
  'link-preface': '了解更多：',
  Unspecified: {
    title: '未指定',
    description: '工作流任务失败了。详情请查看错误信息。',
  },
  UnhandledCommand: {
    title: '未处理的命令',
    description:
      '工作流任务失败，原因是在上一个工作流任务开始之后出现了新的可用事件。系统已调度重试工作流任务，工作流将有机会处理这些新事件。',
  },
  BadScheduleActivityAttributes: {
    title: '调度活动属性错误',
    description:
      '工作流任务失败，原因是 ScheduleActivity 属性缺失或不正确。',
  },
  BadRequestCancelActivityAttributes: {
    title: '取消活动请求属性错误',
    description:
      '工作流任务失败，原因是 RequestCancelActivity 属性有误。已调度一个要取消的活动，但被调度事件的 ID 从未被设置。',
  },
  BadStartTimerAttributes: {
    title: '启动计时器属性错误',
    description:
      '工作流任务失败，原因是被调度的事件缺少计时器 ID。',
  },
  BadCancelTimerAttributes: {
    title: '取消计时器属性错误',
    description:
      '工作流任务在尝试取消计时器时失败，原因是计时器 ID 未设置。',
  },
  BadRecordMarkerAttributes: {
    title: '记录标记属性错误',
    description:
      '工作流任务失败，原因是 Marker 名称缺失或无效。',
  },
  BadCompleteWorkflowExecutionAttributes: {
    title: '完成工作流执行属性错误',
    description:
      '工作流任务失败，原因是 CompleteWorkflowExecution 上有未设置的属性。',
  },
  BadFailWorkflowExecutionAttributes: {
    title: '工作流执行失败属性错误',
    description:
      '工作流任务失败，原因是 FailWorkflowExecution 属性或失败信息未设置。',
  },
  BadCancelWorkflowExecutionAttributes: {
    title: '取消工作流执行属性错误',
    description:
      '工作流任务失败，原因是 CancelWorkflowExecution 上有未设置的属性。',
  },
  BadRequestCancelExternalWorkflowExecutionAttributes: {
    title: '取消外部请求属性错误',
    description:
      '工作流任务失败，原因是取消外部工作流的请求中存在无效属性。详情请查看失败消息。',
  },
  BadContinueAsNewAttributes: {
    title: '以新执行继续属性错误',
    description:
      '工作流任务失败，原因是某个 ContinueAsNew 属性未通过校验。详情请查看失败消息。',
  },
  StartTimerDuplicateId: {
    title: '启动计时器 ID 重复',
    description:
      '工作流任务失败，原因是具有该计时器 ID 的计时器已经启动。',
  },
  ResetStickyTaskQueue: {
    title: '重置粘性任务队列',
    description:
      '工作流任务失败，原因是粘性任务队列需要重置。系统会自动重试。',
  },
  WorkflowWorkerUnhandledFailure: {
    title: '工作流 Worker 未处理失败',
    description:
      '工作流任务失败，原因是工作流代码产生了未处理的失败。',
  },
  WorkflowTaskHeartbeatError: {
    title: '工作流任务心跳错误',
    description:
      '工作流任务在执行长时间运行的本地活动时未能发送心跳。这些本地活动将在下一次工作流任务尝试时重新执行。如果此错误持续出现，这些本地活动将反复运行，直到工作流超时。',
  },
  BadSignalWorkflowExecutionAttributes: {
    title: '信号工作流执行属性错误',
    description:
      '工作流任务未能通过 SignalWorkflowExecution 的属性校验。详情请查看失败消息。',
  },
  BadStartChildExecutionAttributes: {
    title: '启动子执行属性错误',
    description:
      '工作流任务未能通过 StartChildWorkflowExecution 所需属性的校验。详情请查看失败消息。',
  },
  ForceCloseCommand: {
    title: '强制关闭命令',
    description:
      '工作流任务被强制关闭。如果错误可恢复，系统将调度一次重试。',
  },
  FailoverCloseCommand: {
    title: '故障转移关闭命令',
    description:
      '工作流任务因命名空间故障转移而被强制关闭。系统会自动调度重试。',
  },
  BadSignalInputSize: {
    title: '信号输入大小超限',
    description:
      '负载超过了信号（Signal）可用的输入大小上限。',
  },
  BadBinary: {
    title: '坏二进制文件',
    description:
      '系统使此工作流任务失败，原因是此 Worker 的部署被标记为坏二进制文件。',
  },
  ScheduleActivityDuplicateId: {
    title: '调度活动 ID 重复',
    description:
      '工作流任务失败，原因是活动 ID 已被占用。请检查是否在工作流中指定了相同的活动 ID。',
  },
  BadSearchAttributes: {
    title: '搜索属性错误',
    description:
      '搜索属性缺失，或其值超过了限制。这可能导致工作流任务持续重试而无法成功。',
    action: '配置搜索属性',
    link: 'https://docs.temporal.io/visibility#search-attribute',
  },
  NonDeterministicError: {
    title: '非确定性错误',
    description:
      '非确定性错误导致工作流任务失败。这通常意味着工作流代码在没有正确的版本分支的情况下做了不向后兼容的修改。',
    action: '确定性约束',
    link: 'https://docs.temporal.io/workflows/#deterministic-constraints',
  },
  BadModifyWorkflowPropertiesAttributes: {
    title: '修改工作流属性错误',
    description:
      '工作流任务在 upsert 备注时未能通过 ModifyWorkflowProperty 上的属性校验。详情请查看失败消息。',
  },
  PendingChildWorkflowsLimitExceeded: {
    title: '等待中的子工作流超出上限',
    description:
      '等待中的子工作流数量已达上限。为阻止继续添加子工作流，此工作流任务被置为失败。',
  },
  PendingActivitiesLimitExceeded: {
    title: '等待中的活动超出上限',
    description:
      '等待中的活动数量已达上限。为阻止再创建活动，此工作流任务被置为失败。',
  },
  PendingSignalsLimitExceeded: {
    title: '等待中的信号超出上限',
    description:
      '此工作流待发送的等待中信号数量已达上限。',
  },
  PendingRequestCancelLimitExceeded: {
    title: '等待中的取消请求超出上限',
    description:
      '等待中的取消其他工作流的请求数量已达上限。',
  },
  BadUpdateWorkflowExecutionMessage: {
    title: '更新无效',
    description:
      '某个工作流执行在尚未接收 Update 的情况下就试图完成。',
  },
  UnhandledUpdate: {
    title: '未处理的更新',
    description:
      'Temporal Server 在 Worker 上正在处理工作流任务时收到了一个工作流更新。',
  },
  BadScheduleNexusOperationAttributes: {
    title: '调度 Nexus 操作属性错误',
    description:
      '某个工作流任务带着无效的 ScheduleNexusOperation 命令完成了。',
  },
  PendingNexusOperationsLimitExceeded: {
    title: '等待中的 Nexus 操作超出上限',
    description:
      '某个工作流任务在请求调度 Nexus 操作时超过了服务器配置的上限。',
  },
  BadRequestCancelNexusOperationAttributes: {
    title: '取消 Nexus 操作请求属性错误',
    description:
      '某个工作流任务带着无效的 RequestCancelNexusOperation 命令完成了。',
  },
  FeatureDisabled: {
    title: '功能已禁用',
    description:
      '某个工作流任务请求的功能在服务器上被禁用（可能是全局禁用，更常见的是对该工作流的命名空间禁用）。更多信息请查看工作流任务的失败消息。',
  },
  GrpcMessageTooLarge: {
    title: 'gRPC 消息过大',
    description:
      '工作流任务失败，原因是 gRPC 消息超过了允许的最大大小。',
  },
  PayloadsTooLarge: {
    title: '负载过大',
    description:
      '工作流任务失败，原因是其负载超过了允许的最大大小。',
  },
  ExternalStorageFailure: {
    title: '外部存储失败',
    description:
      '工作流任务失败，原因是外部存储发生故障。',
  },
  WorkflowPauseRequestedBeforeTaskStarted: {
    title: '任务启动前已请求暂停工作流',
    description:
      '工作流任务失败，原因是在任务启动之前工作流已被请求暂停。',
  },
  RequestTooLarge: {
    title: '请求过大',
    description:
      '工作流任务失败，原因是请求超过了允许的最大大小。',
  },
  WorkflowTaskTimedOut: {
    title: '工作流任务超时',
    description: '工作流任务发生了超时。',
  },
} as const;
