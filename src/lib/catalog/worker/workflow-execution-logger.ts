import type { Logger, LogLevel, LogMetadata } from '@temporalio/common';

type WorkflowExecutionStatus =
  | 'started'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'continued-as-new';

const workflowExecutionStatuses: Record<string, WorkflowExecutionStatus> = {
  'Workflow started': 'started',
  'Workflow completed': 'completed',
  'Workflow failed': 'failed',
  'Workflow completed as cancelled': 'cancelled',
  'Workflow continued as new': 'continued-as-new',
};

const workflowExecutionMetadataKeys = [
  'namespace',
  'taskQueue',
  'workflowId',
  'runId',
  'workflowType',
] as const;

const workflowExecutionMetadata = (metadata?: LogMetadata) => {
  return Object.fromEntries(
    workflowExecutionMetadataKeys.flatMap((key) => {
      const value = metadata?.[key];
      return typeof value === 'string' ? [[key, value]] : [];
    }),
  );
};

export const createCatalogExecutionLogger = (
  fallbackLogger: Logger,
): Logger => {
  const log = (level: LogLevel, message: string, metadata?: LogMetadata) => {
    const status =
      metadata?.sdkComponent === 'worker'
        ? workflowExecutionStatuses[message]
        : undefined;
    if (!status) return fallbackLogger.log(level, message, metadata);

    console.info(
      JSON.stringify({
        component: 'catalog',
        event: 'workflow-execution',
        status,
        ...workflowExecutionMetadata(metadata),
      }),
    );
  };

  return {
    log,
    trace: (message, metadata) => log('TRACE', message, metadata),
    debug: (message, metadata) => log('DEBUG', message, metadata),
    info: (message, metadata) => log('INFO', message, metadata),
    warn: (message, metadata) => log('WARN', message, metadata),
    error: (message, metadata) => log('ERROR', message, metadata),
  };
};
