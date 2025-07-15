import type {
  EventAttributeKey,
  EventAttributesWithType,
  EventWithMetadata,
  HistoryEvent,
  WorkflowEvent,
  WorkflowEvents,
} from '$lib/types/events';
import {
  convertPayloadToJsonWithCodec,
  type DecodeFunctions,
  decodePayloadAttributes,
} from '$lib/utilities/decode-payload';
import { formatDate } from '$lib/utilities/format-date';
import { isWorkflowTaskFailedEventDueToReset } from '$lib/utilities/get-workflow-task-failed-event';
import { has } from '$lib/utilities/has';
import { findAttributesAndKey } from '$lib/utilities/is-event-type';
import { toEventNameReadable } from '$lib/utilities/screaming-enums';

import { getEventBillableActions } from './get-event-billable-actions';
import { getEventCategory } from './get-event-categorization';
import { getEventClassification } from './get-event-classification';
import { simplifyAttributes } from './simplify-attributes';

export async function getEventAttributes(
  { historyEvent, namespace, settings, accessToken }: EventWithMetadata,
  {
    convertWithCodec = convertPayloadToJsonWithCodec,
    decodeAttributes = decodePayloadAttributes,
  }: DecodeFunctions = {},
): Promise<EventAttributesWithType<EventAttributeKey>> {
  const { key, attributes } = findAttributesAndKey(historyEvent);
  const convertedAttributes = await convertWithCodec({
    attributes,
    namespace,
    settings,
    accessToken,
  });

  const decodedAttributes = decodeAttributes(convertedAttributes) as object;

  return {
    type: key,
    ...decodedAttributes,
  };
}

export const toBillableEvent = (
  event: WorkflowEvent,
  shouldNotAddBillableAction: (event: WorkflowEvent) => boolean = () => false,
  processedWorkflowTaskIds?: Set<string>,
) => {
  return {
    ...event,
    billableActions: shouldNotAddBillableAction(event)
      ? 0
      : getEventBillableActions(event, processedWorkflowTaskIds),
  };
};

export const toEvent = (
  historyEvent: HistoryEvent,
  options: {
    shouldNotAddBillableAction?: (event: WorkflowEvent) => boolean;
    processedWorkflowTaskIds?: Set<string>;
  } = {},
): WorkflowEvent => {
  const id = String(historyEvent.eventId);
  const eventType = toEventNameReadable(historyEvent.eventType);
  const timestamp = formatDate(String(historyEvent.eventTime));
  const classification = getEventClassification(eventType);
  const category = getEventCategory(eventType);

  const { key, attributes } = findAttributesAndKey(historyEvent);
  const completionLinks =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (attributes as any)?.completionCallbacks?.[0]?.links ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (attributes as any)?.attachedCompletionCallbacks?.[0]?.links;
  const links = historyEvent?.links || completionLinks || [];
  const event = {
    ...historyEvent,
    name: eventType,
    id,
    eventType,
    timestamp,
    classification,
    category,
    links,
    billableActions: 0,
    attributes: simplifyAttributes({ type: key, ...attributes }),
  };
  return toBillableEvent(
    event,
    options.shouldNotAddBillableAction,
    options.processedWorkflowTaskIds,
  );
};

export const toEventHistory = (events: HistoryEvent[]): WorkflowEvents => {
  const failedEvent = events.findLast(isWorkflowTaskFailedEventDueToReset);
  const shouldNotAddBillableAction = (event: WorkflowEvent): boolean => {
    if (failedEvent) return Number(event.id) < Number(failedEvent.eventId);
    return false;
  };

  const processedWorkflowTaskIds = new Set<string>();
  return events.map((event) =>
    toEvent(event, { shouldNotAddBillableAction, processedWorkflowTaskIds }),
  );
};

export const isEvent = (event: unknown): event is WorkflowEvent => {
  if (event === null) return false;
  if (typeof event !== 'object') return false;
  if (Array.isArray(event)) return false;
  if (has(event, 'eventType')) return true;
  return false;
};

export const fromEventToRawEvent = (event: WorkflowEvent): HistoryEvent => {
  const workflowEvent = { ...event };
  delete workflowEvent.name;
  delete workflowEvent.id;
  delete workflowEvent.timestamp;
  delete workflowEvent.classification;
  delete workflowEvent.category;
  delete workflowEvent.attributes;
  return workflowEvent;
};
