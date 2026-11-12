import { groupEvents } from '$lib/models/event-groups';
import type { EventGroup } from '$lib/models/event-groups/event-groups';
import {
  systemNexusEventType,
  systemNexusTargetLink,
} from '$lib/system-nexus-endpoints';
import type { WorkflowEvent } from '$lib/types/events';

import { type EventLinkDisplay, toEventLinkView } from './event-link';
import {
  isNexusOperationCompletedEvent,
  isNexusOperationScheduledEvent,
} from './is-event-type';
import {
  type CallbackTargetEvent,
  callbackTargetEvent,
  callbackTargetHref,
  callbackTargetName,
  callbackTargetTypeLabel,
} from './nexus-operation-callbacks';
import { routeForEventHistoryEvent } from './route-for';

export type OutboundLinkRow = {
  sourceEvent: Pick<EventLinkDisplay, 'value' | 'href'>;
  eventType: string;
  targetNamespace?: Pick<EventLinkDisplay, 'value' | 'href'>;
  targetExecution: { value: string; href?: string; typeLabel?: string };
  targetEvent?: CallbackTargetEvent;
};

export type OutboundLinkContext = {
  namespace: string;
  workflow: string;
  run: string;
};

export const toOutboundLinkRow = (
  group: EventGroup,
  context: OutboundLinkContext,
): OutboundLinkRow | null => {
  const scheduled = group.eventList.find(isNexusOperationScheduledEvent);
  if (!scheduled) return null;

  const systemEventType = systemNexusEventType(scheduled);
  const link = systemEventType
    ? systemNexusTargetLink(
        scheduled,
        group.eventList.find(isNexusOperationCompletedEvent),
      )
    : group.links?.[0];
  if (!link) return null;

  const view = toEventLinkView(link, { namespace: context.namespace });

  return {
    sourceEvent: {
      value: scheduled.id,
      href: routeForEventHistoryEvent({ ...context, eventId: scheduled.id }),
    },
    eventType: systemEventType ?? scheduled.name,
    targetNamespace: view.namespace && {
      value: view.namespace.value,
      href: view.namespace.href,
    },
    targetExecution: {
      value: callbackTargetName(link, view),
      href: callbackTargetHref(link, view),
      typeLabel: callbackTargetTypeLabel(view.variant),
    },
    targetEvent: callbackTargetEvent(link),
  };
};

export const outboundLinkRows = (
  history: WorkflowEvent[],
  context: OutboundLinkContext,
): OutboundLinkRow[] =>
  groupEvents(history)
    .filter((group) => group.category === 'nexus')
    .map((group) => toOutboundLinkRow(group, context))
    .filter((row): row is OutboundLinkRow => row !== null);
