import type {
  ActivityTaskCompletedEvent,
  ActivityTaskScheduledEvent,
  WorkflowEvents,
} from '$lib/types/events';
import { decodeEventAttributes } from '$lib/utilities/decode-payload';
import {
  isActivityTaskCompletedEvent,
  isActivityTaskScheduledEvent,
} from '$lib/utilities/is-event-type';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

export type LLMMetadata = {
  model?: string;
  provider?: string;
  promptTokens?: number | string;
  completionTokens?: number | string;
  totalTokens?: number | string;
  cost?: number | string;
  score?: number | string;
  traceUrl?: string;
  latencyMs?: number | string;
  status?: string;
  statusDetail?: string;
  costCurrency?: string;
  streaming?: boolean;
  timeToFirstTokenMs?: number | string;
  promptKey?: string;
  responseKey?: string;
};

export type WorkflowChatTurn = {
  id: string;
  activityId: string;
  activityType: string;
  timestamp: string;
  userContent: string;
  assistantContent: string;
  llm: LLMMetadata;
};

type Decoder = typeof decodeEventAttributes;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

const unwrapDecodedPayload = (value: unknown): unknown => {
  if (!isRecord(value) || !Array.isArray(value.payloads)) {
    return value;
  }

  if (value.payloads.length === 1) {
    return value.payloads[0];
  }

  return value.payloads;
};

const formatContent = (value: unknown): string => {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return stringifyWithBigInt(value, undefined, 2);
};

export const getLLMMetadata = (value: unknown): LLMMetadata | null => {
  if (!isRecord(value) || !isRecord(value._details)) {
    return null;
  }

  return value._details as LLMMetadata;
};

const getUserContent = (inputValue: unknown, promptKey?: string): string => {
  if (promptKey && isRecord(inputValue)) {
    return formatContent(inputValue[promptKey]);
  }

  return formatContent(inputValue);
};

const getAssistantContent = (
  resultValue: unknown,
  responseKey: string,
): string => {
  if (isRecord(resultValue)) {
    return formatContent(resultValue[responseKey]);
  }

  return formatContent(resultValue);
};

export const getWorkflowChatTurn = async (
  scheduledEvent: ActivityTaskScheduledEvent,
  completedEvent: ActivityTaskCompletedEvent,
  decode: Decoder = decodeEventAttributes,
): Promise<WorkflowChatTurn | null> => {
  const decodedInput = unwrapDecodedPayload(
    await decode(
      scheduledEvent.activityTaskScheduledEventAttributes?.input ?? null,
    ),
  );
  const decodedResult = unwrapDecodedPayload(
    await decode(
      completedEvent.activityTaskCompletedEventAttributes?.result ?? null,
    ),
  );
  const llm = getLLMMetadata(decodedResult);

  if (!llm) {
    return null;
  }

  const promptKey = llm.promptKey ?? '';
  const responseKey = llm.responseKey ?? 'result';
  const activityId =
    String(
      scheduledEvent.activityTaskScheduledEventAttributes?.activityId ?? '',
    ) || scheduledEvent.id;
  const activityType =
    String(
      scheduledEvent.activityTaskScheduledEventAttributes?.activityType ?? '',
    ) || 'Activity';

  return {
    id: completedEvent.id,
    activityId,
    activityType,
    timestamp: completedEvent.timestamp,
    userContent: getUserContent(decodedInput, promptKey),
    assistantContent: getAssistantContent(decodedResult, responseKey),
    llm,
  };
};

export const getWorkflowChatTurns = async (
  events: WorkflowEvents,
  decode: Decoder = decodeEventAttributes,
): Promise<WorkflowChatTurn[]> => {
  const scheduledEvents = new Map<string, ActivityTaskScheduledEvent>();

  for (const event of events) {
    if (isActivityTaskScheduledEvent(event)) {
      scheduledEvents.set(event.id, event);
    }
  }

  const turns = await Promise.all(
    events.filter(isActivityTaskCompletedEvent).map(async (completedEvent) => {
      const scheduledEventId = String(
        completedEvent.activityTaskCompletedEventAttributes?.scheduledEventId ??
          '',
      );
      const scheduledEvent = scheduledEvents.get(scheduledEventId);

      if (!scheduledEvent) {
        return null;
      }

      return getWorkflowChatTurn(scheduledEvent, completedEvent, decode);
    }),
  );

  return turns.filter((turn): turn is WorkflowChatTurn => turn !== null);
};
