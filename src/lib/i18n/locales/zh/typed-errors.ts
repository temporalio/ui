export const Namespace = 'typed-errors';

export const Strings = {
  'link-preface': '了解更多关于',
  Unspecified: {
    title: '未指定',
    description: '流程任务失败。请参阅错误详情。',
  },
  UnhandledCommand: {
    title: '未处理的命令',
    description:
      '由于自上次流程任务开始以来有新的可用事件，流程任务失败。已经安排了一个重试流程任务，并有机会处理那些新事件。',
  },
  BadScheduleActivityAttributes: {
    title: '错误的日程活动属性',
    description:
      '由于缺少或不正确的日程活动属性，流程任务失败。',
  },
  BadRequestCancelActivityAttributes: {
    title: '错误的请求取消活动属性',
    description:
      '由于请求取消活动属性不当，流程任务失败。一项活动被排定以取消，但是从未设置预定事件ID。',
  },
  BadStartTimerAttributes: {
    title: '错误的启动计时器属性',
    description:
      '由于预定事件缺少计时器ID，流程任务失败。',
  },
  BadCancelTimerAttributes: {
    title: '错误的取消计时器属性',
    description:
      '尝试取消计时器时因计时器ID未设置而使流程任务失败。',
  },
  BadRecordMarkerAttributes: {
    title: '错误的记录标记属性',
    description:
      '由于缺少或无效标记名称，流程任务失败。',
  },
  BadCompleteWorkflowExecutionAttributes: {
    title: '错误的流程执行完成属性',
    description:
      '由于在完成流程执行上未设置属性而使流程任务失败。',
  },
  BadFailWorkflowExecutionAttributes: {
    title: '错误的流程执行失败属性',
    description:
      '由于未设置失败流程执行属性或发生故障而使流程任务失败。',
  },
  BadCancelWorkflowExecutionAttributes: {
    title: '错误的流程执行取消属性',
    description:
      '由于在取消流程执行上未设置属性而使流程任务失败。',
  },
  BadRequestCancelExternalAttributes: {
    title: '错误的请求取消外部属性',
    description:
      '由于请求取消外部流程上有无效属性，流程任务失败。请检查故障消息以获取更多详细信息。',
  },
  BadContinueAsNewAttributes: {
    title: '错误的新继续属性',
    description:
      '由于未能在继续为新属性上验证而使流程任务失败。请检查故障消息以获取更多详细信息。',
  },
  StartTimerDuplicateId: {
    title: '启动计时器重复ID',
    description:
      '由于具有给定计时器ID的计时器已经启动，因此流程任务失败。',
  },
  ResetStickyTaskQueue: {
    title: '重置粘滞任务队列',
    description:
      '由于需要重置粘滞任务队列而使流程任务失败。系统将自动重试。',
  },
  WorkflowWorkerUnhandledFailure: {
    title: '流程Worker未处理的故障',
    description:
      '流程任务因来自流程代码的未处理故障而失败。',
    action: '确定性约束',
    link: 'https://docs.temporal.io/workflows/#deterministic-constraints',
  },
  WorkflowTaskHeartbeatError: {
    title: '流程任务心跳错误',
    description:
      '在执行长周期本地活动期间，流程任务未能发送心跳。这些本地活动将在下一次流程任务尝试时重新执行。如果此错误持续存在，则这些本地活动将反复运行直至流程超时为止。',
  },
  BadSignalWorkflowExecutionAttributes: {
    title: '错误的流程执行信号属性',
    description:
      '流程任务未能验证用于信号流程执行的属性。请检查故障消息以获取更多详细信息。',
  },
  BadStartChildExecutionAttributes: {
    title: '错误的孩子执行启动属性',
    description:
      '流程任务未能验证用于开始子流程执行所需的属性。请检查故障消息以获取更多详细信息。',
  },
  ForceCloseCommand: {
    title: '强制关闭命令',
    description:
      '流程任务被迫关闭。如果错误可恢复，则将安排重试。',
  },
  FailoverCloseCommand: {
    title: '故障转移关闭命令',
    description:
      '由于空间故障转移而迫使流程任务关闭。将自动安排重试。',
  },
  BadSignalInputSize: {
    title: '错误的信号输入大小',
    description:
      '有效载荷已超过信号上的可用输入大小。',
  },
  ResetWorkflow: {
    title: '重置流程',
    description:
      '系统使此流程任务失败。如果为此流程请求了重置，请检查新流程的进度；否则重置此流程。',
  },
  BadBinary: {
    title: '错误的二进制文件',
    description:
      '系统使此流程任务失败，因为此Worker部署被标记为不良二进制文件。',
  },
  ScheduleActivityDuplicateId: {
    title: '日程活动ID重复',
    description:
      '由于活动ID已经在使用中，流程任务失败，请检查您是否在您的流程中指定了相同的活动ID。',
  },
  BadSearchAttributes: {
    title: '错误的搜索属性',
    description:
      '搜索属性要么缺失要么值超过限制。这可能导致流程任务继续重试而不会成功。',
    action: '配置搜索属性',
    link: 'https://docs.temporal.io/visibility#search-attribute',
  },
  NonDeterministicError: {
    title: '非确定性错误',
    description:
      '非确定性错误导致流程任务失败。这通常意味着流程代码进行了非向后兼容变更而没有适当的版本分支。',
  },
  BadModifyWorkflowPropertiesAttributes: {
    title: '修改流程属性错误属性',
    description:
      '在上插备注的ModifyWorkflowProperty上验证属性时，流程任务失败。请检查故障消息以获取更多详细信息。',
  },
  PendingChildWorkflowsLimitExceeded: {
    title: '待处理子流程数超限',
    description:
      '待处理子流程的容量已达到。流程任务失败以防任何更多子流程被添加。',
  },
  PendingActivitiesLimitExceeded: {
    title: '待处理活动数超限',
    description:
      '待处理活动的容量已到达。流程任务失败以防创建另一项活动。',
  },
  PendingSignalsLimitExceeded: {
    title: '待处理信号数超限',
    description:
      '从此流程发送待处理信号的容量已达到。',
  },
  PendingRequestCancelLimitExceeded: {
    title: '待处理请求取消数超限',
    description:
      '待处理请求取消其他流程的容量已达到。',
  },
  BadUpdateWorkflowExecutionMessage: {
    title: '错误更新',
    description:
      '一个流程执行尝试在接收更新之前完成。',
  },
  UnhandledUpdate: {
    title: '未处理更新',
    description:
      '当Worker上正在处理流程任务时，Temporal服务器收到了一个流程更新。',
  },
  BadScheduleNexusOperationAttributes: {
    title: '错误的日程枢纽操作属性',
    description:
      '一个流程任务带着无效的ScheduleNexusOperation命令完成。',
  },
  PendingNexusOperationsLimitExceeded: {
    title: '待处理枢纽操作数超限',
    description:
      '一个流程任务完成时请求调度枢纽操作超过服务器配置的限制。',
  },
  BadRequestCancelNexusOperationAttributes: {
    title: '错误请求取消枢纽操作属性',
    description:
      '一个流程任务带着无效的RequestCancelNexusOperation命令完成。',
  },
  FeatureDisabled: {
    title: '功能禁用',
    description:
      '一个流程任务完成请求服务器上禁用的功能（无论是在整个系统范围内还是典型地针对流程的空间）。请检查流程任务故障消息以获取更多信息。',
  }
} as const;
