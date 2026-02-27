import type {
  Callbacks,
  PendingActivity,
  PendingActivityInfo,
  PendingActivityState,
  PendingChildren,
  PendingNexusOperation,
} from '$lib/types/events';
import type { Callback } from '$lib/types/nexus';
import type {
  DecodedWorkflowSearchAttributes,
  ListWorkflowExecutionsResponse,
  WorkflowExecution,
  WorkflowExecutionAPIResponse,
  WorkflowSearchAttributes,
} from '$lib/types/workflows';
import { decodePayload } from '$lib/utilities/decode-payload';
import {
  toCallbackStateReadable,
  toPendingActivityStateReadable,
  toPendingNexusOperationStateReadable,
  toWorkflowStatusReadable,
} from '$lib/utilities/screaming-enums';
import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

import { simplifyAttributes } from './event-history/simplify-attributes';

export const toPendingActivities = (
  pendingActivity: PendingActivityInfo[] = [],
): PendingActivity[] => {
  return pendingActivity.map((activity): PendingActivity => {
    const attributes = simplifyAttributes(activity, true);
    const id = activity.activityId;
    const state = activity.state as unknown as PendingActivityState;
    return {
      ...attributes,
      id,
      state: toPendingActivityStateReadable(state),
    };
  });
};

const toPendingNexusOperations = (
  operations?: PendingNexusOperation[],
): PendingNexusOperation[] => {
  if (!operations) return [];
  return operations.map((operation): PendingNexusOperation => {
    return {
      ...operation,
      state: toPendingNexusOperationStateReadable(operation.state),
    };
  });
};

const toCallbacks = (callbacks?: Callbacks): Callbacks => {
  if (!callbacks) return [];
  return callbacks.map((callback): Callback => {
    return {
      ...callback,
      state: toCallbackStateReadable(callback.state),
    };
  });
};

const toSearchAttributes = (
  apiSearchAttributes: WorkflowSearchAttributes,
): DecodedWorkflowSearchAttributes => {
  if (!apiSearchAttributes || !apiSearchAttributes.indexedFields) return {};
  const decoded = Object.entries(apiSearchAttributes.indexedFields).reduce(
    (searchAttributes, [searchAttributeName, payload]) => {
      return {
        ...searchAttributes,
        [searchAttributeName]: decodePayload(payload),
      };
    },
    {},
  );

  return {
    indexedFields: decoded,
  };
};

const getStartDelay = ({
  executionTime,
  startTime,
}: {
  executionTime: string;
  startTime: string;
}): string => {
  if (!executionTime || !startTime) return undefined;
  const delayMs =
    new Date(executionTime).getTime() - new Date(startTime).getTime();
  if (delayMs > 0) {
    return Math.round(delayMs / 1000) + 's';
  }
  return undefined;
};

export const toWorkflowExecution = (
  response?: WorkflowExecutionAPIResponse,
): WorkflowExecution => {
  const searchAttributes = toSearchAttributes(
    response.workflowExecutionInfo.searchAttributes,
  );
  const memo = response.workflowExecutionInfo.memo;
  const name = response.workflowExecutionInfo.type.name;
  const id = response.workflowExecutionInfo.execution.workflowId;
  const runId = response.workflowExecutionInfo.execution.runId;
  const startTime = response.workflowExecutionInfo.startTime;
  const endTime = response.workflowExecutionInfo.closeTime;
  const executionTime = response.workflowExecutionInfo.executionTime;
  const status = toWorkflowStatusReadable(
    response.workflowExecutionInfo.status,
  );
  const isRunning = status === 'Running';
  const isPaused = status === 'Paused';
  const historyEvents = response.workflowExecutionInfo.historyLength;
  const historySizeBytes = response.workflowExecutionInfo.historySizeBytes;
  const url = `/workflows/${id}/${runId}`;
  const taskQueue =
    response?.executionConfig?.taskQueue?.name ||
    response?.workflowExecutionInfo?.taskQueue;
  const mostRecentWorkerVersionStamp =
    response?.workflowExecutionInfo?.mostRecentWorkerVersionStamp;
  const assignedBuildId = response?.workflowExecutionInfo?.assignedBuildId;
  const parentNamespaceId = response?.workflowExecutionInfo?.parentNamespaceId;
  const parent = response?.workflowExecutionInfo?.parentExecution;
  const stateTransitionCount =
    response.workflowExecutionInfo.stateTransitionCount;
  const defaultWorkflowTaskTimeout =
    response.executionConfig?.defaultWorkflowTaskTimeout;
  const workflowExecutionTimeout =
    response.executionConfig?.workflowExecutionTimeout;
  const pendingActivities: PendingActivity[] = toPendingActivities(
    response.pendingActivities,
  );
  const pendingChildren: PendingChildren[] = response?.pendingChildren ?? [];
  const pendingNexusOperations: PendingNexusOperation[] =
    toPendingNexusOperations(response?.pendingNexusOperations);
  const pendingWorkflowTask = response?.pendingWorkflowTask;
  const callbacks = toCallbacks(response?.callbacks);
  const rootExecution = response.workflowExecutionInfo?.rootExecution;
  const versioningInfo = response.workflowExecutionInfo?.versioningInfo;
  const priority = response.workflowExecutionInfo?.priority;
  const workflowExtendedInfo = response.workflowExtendedInfo ?? {};
  const startDelay = getStartDelay({ executionTime, startTime });

  let summary;
  let details;
  if (response?.executionConfig?.userMetadata) {
    summary = response?.executionConfig?.userMetadata?.summary;
    details = response?.executionConfig?.userMetadata?.details;
  }

  return {
    name,
    id,
    runId,
    startTime,
    endTime,
    executionTime,
    status,
    historyEvents,
    historySizeBytes,
    searchAttributes,
    memo,
    rootExecution,
    url,
    taskQueue,
    assignedBuildId,
    mostRecentWorkerVersionStamp,
    pendingActivities,
    pendingChildren,
    pendingNexusOperations,
    pendingWorkflowTask,
    callbacks,
    versioningInfo,
    priority,
    summary,
    details,
    parentNamespaceId,
    parent,
    stateTransitionCount,
    isRunning,
    isPaused,
    defaultWorkflowTaskTimeout,
    workflowExecutionTimeout,
    workflowExtendedInfo,
    startDelay,
    get canBeTerminated(): boolean {
      return (isRunning || isPaused) && writeActionsAreAllowed();
    },
  };
};

export const toWorkflowExecutions = (
  response: Pick<ListWorkflowExecutionsResponse, 'executions'>,
): WorkflowExecution[] => {
  return (response.executions || []).map((workflowExecutionInfo) =>
    toWorkflowExecution({ workflowExecutionInfo }),
  );
};
