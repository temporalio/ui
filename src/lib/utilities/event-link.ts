import { translate } from '$lib/i18n/translate';
import type { EventLink } from '$lib/types';
import {
  routeForBatchOperation,
  routeForEventHistoryEvent,
  routeForNamespace,
  routeForStandaloneActivityDetails,
  routeForStandaloneNexusOperationDetails,
  routeForWorkflow,
} from '$lib/utilities/route-for';
import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

export type EventLinkVariant =
  | 'workflowEvent'
  | 'workflow'
  | 'nexusOperation'
  | 'activity'
  | 'batchJob'
  | 'unknown';

export type EventLinkDisplay = {
  label: string;
  value: string;
  href?: string;
};

export type EventLinkView = EventLinkDisplay & {
  variant: EventLinkVariant;
  key: string;
  namespace?: EventLinkDisplay;
  event?: EventLinkDisplay;
};

export type EventLinkContext = {
  namespace?: string;
};

const workflowExecutionStarted = 'EVENT_TYPE_WORKFLOW_EXECUTION_STARTED';

const isPresent = (value: string | null | undefined): value is string => {
  return typeof value === 'string' && value.length > 0;
};

const workflowValueFromHref = (href: string, fallback: string): string => {
  return href.split('workflows/')?.[1] || fallback || href;
};

const namespaceDisplay = (
  namespace: string | null | undefined,
): EventLinkDisplay | undefined => {
  if (!isPresent(namespace)) return undefined;

  return {
    label: translate('nexus.link-namespace'),
    value: namespace,
    href: routeForNamespace({ namespace }),
  };
};

const eventDisplay = (
  href: string | undefined,
  eventType: unknown,
  eventId?: unknown,
  requestId?: string | null,
): EventLinkDisplay | undefined => {
  if (eventId === undefined && !requestId && !eventType) {
    return undefined;
  }

  const readableEventType = eventType
    ? String(fromScreamingEnum(eventType, 'EventType'))
    : undefined;
  const value = [
    readableEventType,
    eventId !== undefined ? `(${String(eventId)})` : requestId,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    label: translate('nexus.handler-event'),
    value: value || translate('nexus.link'),
    href,
  };
};

const unknownLink = (index?: number): EventLinkView => {
  return {
    variant: 'unknown',
    key: `unknown:${index ?? 0}`,
    label: translate('nexus.link'),
    value: translate('nexus.link'),
  };
};

export const toEventLinkView = (
  link: EventLink | undefined,
  context: EventLinkContext = {},
  index?: number,
): EventLinkView => {
  if (!link) return unknownLink(index);

  if (link.workflowEvent) {
    const workflowEvent = link.workflowEvent;
    const namespace = workflowEvent.namespace;
    const workflow = workflowEvent.workflowId;
    const run = workflowEvent.runId;
    const hasWorkflowRouteFields =
      isPresent(namespace) && isPresent(workflow) && isPresent(run);
    let href: string | undefined;

    if (hasWorkflowRouteFields && workflowEvent.eventRef?.eventId) {
      href = routeForEventHistoryEvent({
        namespace,
        workflow,
        run,
        eventId: String(workflowEvent.eventRef.eventId),
      });
    } else if (
      hasWorkflowRouteFields &&
      String(workflowEvent.eventRef?.eventType) === workflowExecutionStarted
    ) {
      href = routeForEventHistoryEvent({
        namespace,
        workflow,
        run,
        eventId: '1',
      });
    } else if (
      hasWorkflowRouteFields &&
      workflowEvent.requestIdRef?.requestId
    ) {
      href = routeForEventHistoryEvent({
        namespace,
        workflow,
        run,
        requestId: workflowEvent.requestIdRef.requestId,
      });
    } else if (hasWorkflowRouteFields) {
      href = routeForWorkflow({
        namespace,
        workflow,
        run,
      });
    }

    const fallbackValue =
      workflow || run || namespace || translate('nexus.handler-workflow');
    const value = href
      ? workflowValueFromHref(href, fallbackValue)
      : fallbackValue;

    return {
      variant: 'workflowEvent',
      key: `workflowEvent:${namespace ?? ''}:${workflow ?? ''}:${run ?? ''}:${workflowEvent.eventRef?.eventId ?? workflowEvent.requestIdRef?.requestId ?? index ?? ''}`,
      label: translate('nexus.link'),
      value,
      href,
      namespace: namespaceDisplay(namespace),
      event: eventDisplay(
        href,
        workflowEvent.eventRef?.eventType ??
          workflowEvent.requestIdRef?.eventType,
        workflowEvent.eventRef?.eventId,
        workflowEvent.requestIdRef?.requestId,
      ),
    };
  }

  if (link.workflow) {
    const workflowLink = link.workflow;
    const namespace = workflowLink.namespace;
    const workflow = workflowLink.workflowId;
    const run = workflowLink.runId;
    const hasWorkflowRouteFields =
      isPresent(namespace) && isPresent(workflow) && isPresent(run);
    const href = hasWorkflowRouteFields
      ? routeForWorkflow({
          namespace,
          workflow,
          run,
        })
      : undefined;
    const fallbackValue =
      workflow || run || namespace || translate('common.workflow-id');
    const value = href
      ? workflowValueFromHref(href, fallbackValue)
      : fallbackValue;

    return {
      variant: 'workflow',
      key: `workflow:${namespace ?? ''}:${workflow ?? ''}:${run ?? ''}:${workflowLink.reason ?? index ?? ''}`,
      label: translate('common.workflow-id'),
      value,
      href,
      namespace: namespaceDisplay(namespace),
    };
  }

  if (link.nexusOperation) {
    const nexusOperation = link.nexusOperation;
    const namespace = nexusOperation.namespace;
    const operationId = nexusOperation.operationId;
    const runId = nexusOperation.runId;
    const hasRouteFields =
      isPresent(namespace) && isPresent(operationId) && isPresent(runId);
    const href = hasRouteFields
      ? routeForStandaloneNexusOperationDetails({
          namespace,
          operationId,
          runId,
        })
      : undefined;

    return {
      variant: 'nexusOperation',
      key: `nexusOperation:${namespace ?? ''}:${operationId ?? ''}:${runId ?? ''}:${index ?? ''}`,
      label: translate('nexus.nexus-operation'),
      value:
        operationId || runId || namespace || translate('nexus.nexus-operation'),
      href,
      namespace: namespaceDisplay(namespace),
    };
  }

  if (link.activity) {
    const activity = link.activity;
    const namespace = activity.namespace;
    const activityId = activity.activityId;
    const runId = activity.runId;
    const hasRouteFields =
      isPresent(namespace) && isPresent(activityId) && isPresent(runId);
    const href = hasRouteFields
      ? routeForStandaloneActivityDetails({
          namespace,
          activityId,
          runId,
        })
      : undefined;

    return {
      variant: 'activity',
      key: `activity:${namespace ?? ''}:${activityId ?? ''}:${runId ?? ''}:${index ?? ''}`,
      label: translate('standalone-activities.activity-id'),
      value:
        activityId ||
        runId ||
        namespace ||
        translate('standalone-activities.activity-id'),
      href,
      namespace: namespaceDisplay(namespace),
    };
  }

  if (link.batchJob) {
    const jobId = link.batchJob.jobId;
    const namespace = context.namespace;
    const href =
      isPresent(namespace) && isPresent(jobId)
        ? routeForBatchOperation({ namespace, jobId })
        : undefined;

    return {
      variant: 'batchJob',
      key: `batchJob:${namespace ?? ''}:${jobId ?? ''}:${index ?? ''}`,
      label: translate('common.job-id'),
      value: jobId || translate('common.job-id'),
      href,
      namespace: namespaceDisplay(namespace),
    };
  }

  return unknownLink(index);
};

export const toEventLinkViews = (
  links: EventLink[] | undefined,
  context: EventLinkContext = {},
): EventLinkView[] => {
  return (
    links?.map((link, index) => toEventLinkView(link, context, index)) ?? []
  );
};
