import type { WorkflowExecution } from '$lib/types/workflows';

import { getValidTimeMs } from './format-time';

export const getWorkflowCurrentTime = (
  workflow: WorkflowExecution | null | undefined,
  fallbackNow: number = Date.now(),
): number =>
  getValidTimeMs(
    workflow?.workflowExtendedInfo?.timeSkippingInfo?.currentTime,
  ) ?? fallbackNow;

export const getWorkflowLatestTime = (
  workflow: WorkflowExecution | null | undefined,
  fallbackNow: number = Date.now(),
  latestEventTimeMs?: number,
): number => {
  const endTimeMs = getValidTimeMs(workflow?.endTime);
  if (endTimeMs !== undefined) {
    return endTimeMs;
  }

  const virtualTimeMs = getValidTimeMs(
    workflow?.workflowExtendedInfo?.timeSkippingInfo?.currentTime,
  );
  if (virtualTimeMs === undefined) {
    return fallbackNow;
  }

  return Math.max(virtualTimeMs, latestEventTimeMs ?? virtualTimeMs);
};

export const isWorkflowTimeSkippingEnabled = (
  workflow: WorkflowExecution,
): boolean =>
  workflow.workflowExtendedInfo.timeSkippingInfo?.effectiveConfig?.enabled ??
  false;
