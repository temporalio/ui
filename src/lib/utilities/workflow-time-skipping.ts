import type { WorkflowExecution } from '$lib/types/workflows';

export const isWorkflowTimeSkippingEnabled = (
  workflow: WorkflowExecution,
): boolean =>
  workflow.workflowExtendedInfo.timeSkippingInfo?.effectiveConfig?.enabled ??
  false;
