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
  userTimestamp: string;
  assistantTimestamp?: string;
  userContent: string;
  assistantContent?: string;
  llm: LLMMetadata;
  status: 'pending' | 'completed';
};

type Decoder = typeof decodeEventAttributes;
const COMMON_CHAT_INPUT_KEYS = [
  'prompt',
  'input',
  'message',
  'query',
  'question',
  'text',
  'content',
] as const;

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

const toPayloadList = (value: unknown): unknown[] => {
  const unwrapped = unwrapDecodedPayload(value);

  return Array.isArray(unwrapped) ? unwrapped : [unwrapped];
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
  for (const payloadValue of toPayloadList(value)) {
    if (isRecord(payloadValue) && isRecord(payloadValue._details)) {
      return payloadValue._details as LLMMetadata;
    }
  }

  return null;
};

const getPreferredRecordValue = (
  value: Record<string, unknown>,
): unknown | undefined => {
  for (const key of COMMON_CHAT_INPUT_KEYS) {
    if (key in value && value[key] != null) {
      return value[key];
    }
  }

  const entries = Object.entries(value).filter(([key]) => key !== '_details');

  if (entries.length === 1) {
    return entries[0][1];
  }

  return undefined;
};

const getUserContent = (inputValue: unknown, promptKey?: string): string => {
  for (const payloadValue of toPayloadList(inputValue)) {
    if (promptKey && isRecord(payloadValue) && promptKey in payloadValue) {
      return formatContent(payloadValue[promptKey]);
    }
  }

  for (const payloadValue of toPayloadList(inputValue)) {
    if (payloadValue == null) {
      continue;
    }

    if (isRecord(payloadValue)) {
      const preferredValue = getPreferredRecordValue(payloadValue);

      if (preferredValue !== undefined) {
        return formatContent(preferredValue);
      }

      return formatContent(
        Object.fromEntries(
          Object.entries(payloadValue).filter(([key]) => key !== '_details'),
        ),
      );
    }

    return formatContent(payloadValue);
  }

  return '';
};

const getAssistantContent = (
  resultValue: unknown,
  responseKey: string,
): string | undefined => {
  for (const payloadValue of toPayloadList(resultValue)) {
    if (
      responseKey &&
      isRecord(payloadValue) &&
      responseKey in payloadValue &&
      payloadValue[responseKey] != null
    ) {
      return formatContent(payloadValue[responseKey]);
    }
  }

  for (const payloadValue of toPayloadList(resultValue)) {
    if (payloadValue == null) {
      continue;
    }

    if (isRecord(payloadValue)) {
      const preferredValue = getPreferredRecordValue(payloadValue);

      if (preferredValue !== undefined) {
        return formatContent(preferredValue);
      }

      return formatContent(
        Object.fromEntries(
          Object.entries(payloadValue).filter(([key]) => key !== '_details'),
        ),
      );
    }

    return formatContent(payloadValue);
  }

  return undefined;
};

const getActivityId = (scheduledEvent: ActivityTaskScheduledEvent): string => {
  return (
    String(
      scheduledEvent.activityTaskScheduledEventAttributes?.activityId ?? '',
    ) || scheduledEvent.id
  );
};

const getActivityType = (
  scheduledEvent: ActivityTaskScheduledEvent,
): string => {
  const activityType =
    scheduledEvent.activityTaskScheduledEventAttributes?.activityType;

  if (typeof activityType === 'string') {
    return activityType || 'Activity';
  }

  if (
    isRecord(activityType) &&
    typeof activityType.name === 'string' &&
    activityType.name
  ) {
    return activityType.name;
  }

  return 'Activity';
};

const isLikelyChatActivity = (activityType: string): boolean => {
  return /llm|chat|prompt|completion|assistant/i.test(activityType);
};

const hasLLMMetadata = (llm: LLMMetadata): boolean => {
  return Object.keys(llm).length > 0;
};

const getScheduledWorkflowChatTurn = async (
  scheduledEvent: ActivityTaskScheduledEvent,
  decode: Decoder = decodeEventAttributes,
): Promise<WorkflowChatTurn | null> => {
  const decodedInput = unwrapDecodedPayload(
    await decode(
      scheduledEvent.activityTaskScheduledEventAttributes?.input ?? null,
    ),
  );
  const llm = getLLMMetadata(decodedInput);
  const activityType = getActivityType(scheduledEvent);

  if (!llm && !isLikelyChatActivity(activityType)) {
    return null;
  }

  return {
    id: scheduledEvent.id,
    activityId: getActivityId(scheduledEvent),
    activityType,
    userTimestamp: scheduledEvent.timestamp,
    userContent: getUserContent(decodedInput, llm?.promptKey ?? ''),
    llm: llm ?? {},
    status: 'pending',
  };
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
  const llm = getLLMMetadata(decodedResult) ?? getLLMMetadata(decodedInput);

  if (!llm) {
    return null;
  }

  const promptKey = llm.promptKey ?? '';
  const responseKey = llm.responseKey ?? 'result';

  return {
    id: scheduledEvent.id,
    activityId: getActivityId(scheduledEvent),
    activityType: getActivityType(scheduledEvent),
    userTimestamp: scheduledEvent.timestamp,
    assistantTimestamp: completedEvent.timestamp,
    userContent: getUserContent(decodedInput, promptKey),
    assistantContent: getAssistantContent(decodedResult, responseKey),
    llm,
    status: 'completed',
  };
};

export const getWorkflowChatTurns = async (
  events: WorkflowEvents,
  decode: Decoder = decodeEventAttributes,
): Promise<WorkflowChatTurn[]> => {
  const scheduledEvents = new Map<string, ActivityTaskScheduledEvent>();
  const orderedScheduledEventIds: string[] = [];
  const turnsByScheduledEventId = new Map<string, WorkflowChatTurn>();

  for (const event of events) {
    if (isActivityTaskScheduledEvent(event)) {
      scheduledEvents.set(event.id, event);
      orderedScheduledEventIds.push(event.id);

      const scheduledTurn = await getScheduledWorkflowChatTurn(event, decode);

      if (scheduledTurn) {
        turnsByScheduledEventId.set(event.id, scheduledTurn);
      }

      continue;
    }

    if (isActivityTaskCompletedEvent(event)) {
      const scheduledEventId = String(
        event.activityTaskCompletedEventAttributes?.scheduledEventId ?? '',
      );
      const scheduledEvent = scheduledEvents.get(scheduledEventId);

      if (!scheduledEvent) {
        continue;
      }

      const completedTurn = await getWorkflowChatTurn(
        scheduledEvent,
        event,
        decode,
      );

      if (completedTurn) {
        turnsByScheduledEventId.set(scheduledEventId, completedTurn);
      } else {
        const existingTurn = turnsByScheduledEventId.get(scheduledEventId);

        if (existingTurn && !hasLLMMetadata(existingTurn.llm)) {
          turnsByScheduledEventId.delete(scheduledEventId);
        }
      }
    }
  }

  return orderedScheduledEventIds.flatMap((scheduledEventId) => {
    const turn = turnsByScheduledEventId.get(scheduledEventId);
    return turn ? [turn] : [];
  });
};
