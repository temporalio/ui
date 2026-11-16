import { translate } from '$lib/i18n/translate';
import type { EventLink } from '$lib/types';

import { type EventLinkDisplay, toEventLinkView } from './event-link';
import {
  routeForStandaloneActivityDetails,
  routeForStandaloneNexusOperationDetails,
  routeForWorkflow,
} from './route-for';

export type InboundCallerExecution = {
  value: string;
  href?: string;
  typeLabel?: string;
};

export type InboundLinkRow = {
  callerEvent?: EventLinkDisplay;
  callerExecution?: InboundCallerExecution;
  callerNamespace?: EventLinkDisplay;
};

type ExecutionKind = 'workflow' | 'activity' | 'nexusOperation';

const isPresent = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.length > 0;

const executionKinds: Record<string, ExecutionKind> = {
  EXECUTION_TYPE_WORKFLOW: 'workflow',
  EXECUTION_TYPE_ACTIVITY: 'activity',
  EXECUTION_TYPE_NEXUS_OPERATION: 'nexusOperation',
};

const executionHref = (
  kind: ExecutionKind,
  namespace: string,
  id: string,
  runId: string,
): string => {
  switch (kind) {
    case 'workflow':
      return routeForWorkflow({ namespace, workflow: id, run: runId });
    case 'activity':
      return routeForStandaloneActivityDetails({
        namespace,
        activityId: id,
        runId,
      });
    case 'nexusOperation':
      return routeForStandaloneNexusOperationDetails({
        namespace,
        operationId: id,
        runId,
      });
  }
};

const executionTypeLabels: Record<ExecutionKind, () => string> = {
  workflow: () => translate('nexus.target-type-workflow-execution'),
  activity: () => translate('nexus.target-type-standalone-activity'),
  nexusOperation: () =>
    translate('nexus.target-type-standalone-nexus-operation'),
};

const callerExecution = (
  kind: ExecutionKind | undefined,
  namespace: string | null | undefined,
  id: string | null | undefined,
  runId: string | null | undefined,
): InboundCallerExecution | undefined => {
  if (!isPresent(id)) return undefined;

  return {
    value: id,
    href:
      kind && isPresent(namespace) && isPresent(runId)
        ? executionHref(kind, namespace, id, runId)
        : undefined,
    typeLabel: kind ? executionTypeLabels[kind]() : undefined,
  };
};

export const toInboundLinkRow = (
  link: EventLink | undefined,
  namespace?: string,
  systemOperation?: string,
): InboundLinkRow => {
  if (!link) return {};

  const view = toEventLinkView(link, { namespace, perspective: 'caller' });

  if (link.workflowEvent) {
    const { workflowEvent } = link;
    return {
      callerEvent:
        view.event && systemOperation
          ? { ...view.event, value: systemOperation }
          : view.event,
      callerExecution: callerExecution(
        'workflow',
        workflowEvent.namespace,
        workflowEvent.workflowId,
        workflowEvent.runId,
      ),
      callerNamespace: view.namespace,
    };
  }

  if (link.workflow) {
    const { workflow } = link;
    return {
      callerExecution: callerExecution(
        'workflow',
        workflow.namespace,
        workflow.workflowId,
        workflow.runId,
      ),
      callerNamespace: view.namespace,
    };
  }

  if (link.nexusOperation) {
    const { nexusOperation } = link;
    return {
      callerExecution: callerExecution(
        'nexusOperation',
        nexusOperation.namespace,
        nexusOperation.operationId,
        nexusOperation.runId,
      ),
      callerNamespace: view.namespace,
    };
  }

  if (link.activity) {
    const { activity } = link;
    return {
      callerExecution: callerExecution(
        'activity',
        activity.namespace,
        activity.activityId,
        activity.runId,
      ),
      callerNamespace: view.namespace,
    };
  }

  if (link.callback) {
    const { callback } = link;
    return {
      callerEvent: isPresent(callback.requestId)
        ? {
            label: translate('nexus.caller-event'),
            value: callback.requestId,
            href: view.href,
          }
        : undefined,
      callerExecution: callerExecution(
        executionKinds[String(callback.execution?.type)],
        callback.namespace,
        callback.execution?.businessId,
        callback.execution?.runId,
      ),
      callerNamespace: view.namespace,
    };
  }

  return {};
};
