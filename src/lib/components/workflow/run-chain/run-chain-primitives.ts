import type { HistoryEvent } from '$lib/types/events';
import { findAttributesAndKey } from '$lib/utilities/is-event-type';

import type { ChainStep } from './run-chain';

/** Keep only operation metadata; never retain payloads while scanning history. */
export function updateOtherChainStep(
  steps: Map<string, ChainStep>,
  event: HistoryEvent,
  time: number,
) {
  const create = (
    kind: ChainStep['kind'],
    name: string,
    status = 'Scheduled',
    id = event.eventId,
  ) => {
    const step: ChainStep = {
      id,
      name,
      kind,
      status,
      startTime: time,
      lane: 0,
    };
    if (status === 'Completed' || status === 'Failed') step.closeTime = time;
    steps.set(id, step);
    return true;
  };
  const close = (id: unknown, status: string) => {
    const step = steps.get(String(id));
    if (step) {
      step.status = status;
      step.closeTime = time;
    }
    return true;
  };

  const child = event.startChildWorkflowExecutionInitiatedEventAttributes;
  if (child)
    return create(
      'child-workflow',
      child.workflowType?.name || 'Child workflow',
    );
  const signal = event.signalExternalWorkflowExecutionInitiatedEventAttributes;
  if (signal) return create('signal', signal.signalName || 'Outgoing signal');
  const received = event.workflowExecutionSignaledEventAttributes;
  if (received)
    return create(
      'signal',
      received.signalName || 'Incoming signal',
      'Completed',
    );
  const nexus = event.nexusOperationScheduledEventAttributes;
  if (nexus)
    return create(
      'nexus',
      [nexus.service, nexus.operation].filter(Boolean).join('.') ||
        'Nexus operation',
    );
  const marker = event.markerRecordedEventAttributes;
  if (marker)
    return create(
      marker.markerName === 'LocalActivity' ? 'local-activity' : 'other',
      marker.markerName || 'Marker',
      marker.failure ? 'Failed' : 'Completed',
    );

  const admitted = event.workflowExecutionUpdateAdmittedEventAttributes;
  if (admitted)
    return create(
      'update',
      admitted.request?.input?.name || 'Update',
      'Scheduled',
      `update:${admitted.request?.meta?.updateId || event.eventId}`,
    );
  const accepted = event.workflowExecutionUpdateAcceptedEventAttributes;
  if (accepted) {
    const id = `update:${accepted.acceptedRequest?.meta?.updateId || accepted.protocolInstanceId}`;
    const existing = steps.get(id);
    if (existing) {
      steps.delete(id);
      steps.set(event.eventId, {
        ...existing,
        id: event.eventId,
        status: 'Running',
      });
      return true;
    }
    return create(
      'update',
      accepted.acceptedRequest?.input?.name || 'Update',
      'Running',
    );
  }
  const updated = event.workflowExecutionUpdateCompletedEventAttributes;
  if (updated)
    return close(
      updated.acceptedEventId,
      updated.outcome?.failure ? 'Failed' : 'Completed',
    );

  const childEnd =
    event.childWorkflowExecutionCompletedEventAttributes ||
    event.childWorkflowExecutionFailedEventAttributes ||
    event.childWorkflowExecutionTimedOutEventAttributes ||
    event.childWorkflowExecutionCanceledEventAttributes ||
    event.childWorkflowExecutionTerminatedEventAttributes ||
    event.startChildWorkflowExecutionFailedEventAttributes;
  if (childEnd)
    return close(
      childEnd.initiatedEventId,
      event.childWorkflowExecutionTimedOutEventAttributes
        ? 'Timed out'
        : event.childWorkflowExecutionCanceledEventAttributes
          ? 'Canceled'
          : event.childWorkflowExecutionCompletedEventAttributes
            ? 'Completed'
            : 'Failed',
    );
  const signalEnd =
    event.externalWorkflowExecutionSignaledEventAttributes ||
    event.signalExternalWorkflowExecutionFailedEventAttributes;
  if (signalEnd)
    return close(
      signalEnd.initiatedEventId,
      event.signalExternalWorkflowExecutionFailedEventAttributes
        ? 'Failed'
        : 'Completed',
    );
  const nexusEnd =
    event.nexusOperationCompletedEventAttributes ||
    event.nexusOperationFailedEventAttributes ||
    event.nexusOperationTimedOutEventAttributes ||
    event.nexusOperationCanceledEventAttributes;
  if (nexusEnd)
    return close(
      nexusEnd.scheduledEventId,
      event.nexusOperationTimedOutEventAttributes
        ? 'Timed out'
        : event.nexusOperationCanceledEventAttributes
          ? 'Canceled'
          : event.nexusOperationFailedEventAttributes
            ? 'Failed'
            : 'Completed',
    );
  const started =
    event.childWorkflowExecutionStartedEventAttributes ||
    event.nexusOperationStartedEventAttributes;
  if (started) {
    const id =
      event.childWorkflowExecutionStartedEventAttributes?.initiatedEventId ??
      event.nexusOperationStartedEventAttributes?.scheduledEventId;
    const step = steps.get(String(id));
    if (step) step.status = 'Running';
    return true;
  }

  const cancel =
    event.requestCancelExternalWorkflowExecutionInitiatedEventAttributes;
  if (cancel) return create('other', 'External cancellation');
  const cancelEnd =
    event.externalWorkflowExecutionCancelRequestedEventAttributes ||
    event.requestCancelExternalWorkflowExecutionFailedEventAttributes;
  if (cancelEnd)
    return close(
      cancelEnd.initiatedEventId,
      event.requestCancelExternalWorkflowExecutionFailedEventAttributes
        ? 'Failed'
        : 'Completed',
    );

  const nexusCancel = event.nexusOperationCancelRequestedEventAttributes;
  if (nexusCancel)
    return create(
      'other',
      'Nexus cancellation',
      'Scheduled',
      `nexus-cancel:${nexusCancel.scheduledEventId}`,
    );
  const nexusCancelEnd =
    event.nexusOperationCancelRequestCompletedEventAttributes ||
    event.nexusOperationCancelRequestFailedEventAttributes;
  if (nexusCancelEnd)
    return close(
      `nexus-cancel:${nexusCancelEnd.scheduledEventId}`,
      event.nexusOperationCancelRequestFailedEventAttributes
        ? 'Failed'
        : 'Completed',
    );

  // Other recorded commands/markers remain visible without treating workflow
  // task bookkeeping or an operation's lifecycle events as additional work.
  const { key } = findAttributesAndKey(event);
  if (
    key &&
    (/^(upsertWorkflowSearchAttributes|workflowPropertiesModified|workflowExecutionOptionsUpdated|workflowExecutionCancelRequested|activityTaskCancelRequested|nexusOperationCancelRequested|nexusOperationCancelRequestFailed)/.test(
      key,
    ) ||
      !/^(activityTask|timer|workflowTask|workflowExecution|childWorkflow|startChildWorkflow|signalExternalWorkflow|externalWorkflow|requestCancelExternalWorkflow|nexusOperation)/.test(
        key,
      ))
  ) {
    return create(
      'other',
      key.replace(/EventAttributes$/, ''),
      /Failed/.test(key) ? 'Failed' : 'Completed',
    );
  }
  return false;
}
