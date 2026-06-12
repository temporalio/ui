import { isEventGroup } from '$lib/models/event-groups';
import type { EventGroup } from '$lib/models/event-groups/event-groups';
import type { WorkflowEvent } from '$lib/types/events';
import { decodePayload } from '$lib/utilities/decode-payload';
import {
  isActivityTaskCompletedEvent,
  isLocalActivityMarkerEvent,
} from '$lib/utilities/is-event-type';

export interface LLMMetadata {
  model?: string;
  agentType?: string;
  totalTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  cost?: number;
  score?: number;
  traceUrl?: string;
  extra?: Record<string, unknown>;
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

const getNumber = (v: unknown): number | undefined =>
  typeof v === 'number' ? v : undefined;

const getString = (v: unknown): string | undefined =>
  typeof v === 'string' && v.length > 0 ? v : undefined;

/**
 * Extracts LLM metadata from the details.llm convention (ActivityCompletionDetails.LLMCallDetails).
 * Falls back to _details for backwards compatibility with older integrations.
 */
const extractFromLLMConvention = (
  resultData: Record<string, unknown>,
): LLMMetadata | null => {
  const details = isObject(resultData.details) ? resultData.details : null;
  const llm =
    (details && isObject(details.llm) ? details.llm : null) ??
    (isObject(resultData._details) ? resultData._details : null);
  if (!isObject(llm)) return null;

  const model = getString(llm.model);
  const agentType = getString(llm.agentType) ?? getString(llm.agent_type);
  const totalTokens = getNumber(llm.totalTokens) ?? getNumber(llm.total_tokens);
  const promptTokens =
    getNumber(llm.promptTokens) ?? getNumber(llm.prompt_tokens);
  const completionTokens =
    getNumber(llm.completionTokens) ?? getNumber(llm.completion_tokens);
  const cost = getNumber(llm.cost);
  const score = getNumber(llm.score);
  const traceUrl = getString(llm.traceUrl) ?? getString(llm.trace_url);

  if (!model && !totalTokens && !promptTokens) return null;

  const knownKeys = new Set([
    'model',
    'agentType',
    'agent_type',
    'totalTokens',
    'total_tokens',
    'promptTokens',
    'prompt_tokens',
    'completionTokens',
    'completion_tokens',
    'cost',
    'score',
    'traceUrl',
    'trace_url',
  ]);
  const extra: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(llm)) {
    if (!knownKeys.has(key) && value !== undefined && value !== null) {
      extra[key] = value;
    }
  }

  return {
    model,
    agentType,
    totalTokens:
      totalTokens ??
      (promptTokens && completionTokens
        ? promptTokens + completionTokens
        : undefined),
    promptTokens,
    completionTokens,
    cost,
    score,
    traceUrl,
    ...(Object.keys(extra).length > 0 ? { extra } : {}),
  };
};

/**
 * Extracts LLM metadata from a single WorkflowEvent.
 * Only inspects ActivityTaskCompleted events (which contain the result payload).
 */
export const getEventLLMMetadata = (
  event: WorkflowEvent,
): LLMMetadata | null => {
  if (
    !isActivityTaskCompletedEvent(event) &&
    !isLocalActivityMarkerEvent(event)
  ) {
    return null;
  }

  const attrs = event.attributes;
  if (!isObject(attrs)) return null;

  // Check the result field (activity return value)
  // The result may be a raw payload wrapper ({ payloads: [{ data, metadata }] })
  // or an already-decoded object. Try decoding the payload first.
  if (isObject(attrs.result)) {
    let resultData = attrs.result as Record<string, unknown>;

    if (Array.isArray(resultData.payloads) && resultData.payloads.length > 0) {
      const decoded = decodePayload(resultData.payloads[0]);
      if (isObject(decoded)) {
        resultData = decoded as Record<string, unknown>;
      }
    }

    // Check for _details convention (explicit, required)
    return extractFromLLMConvention(resultData);
  }

  return null;
};

/**
 * Aggregates LLM metadata across all events in an EventGroup.
 * Returns null if no LLM metadata found in any event.
 */
export const getGroupLLMMetadata = (
  eventOrGroup: WorkflowEvent | EventGroup,
): LLMMetadata | null => {
  if (!isEventGroup(eventOrGroup)) {
    return getEventLLMMetadata(eventOrGroup);
  }

  const group = eventOrGroup;
  let totalTokens = 0;
  let promptTokens = 0;
  let completionTokens = 0;
  let model: string | undefined;
  let cost: number | undefined;
  let score: number | undefined;
  let traceUrl: string | undefined;
  let extra: Record<string, unknown> | undefined;
  let found = false;

  for (const event of group.eventList) {
    const metadata = getEventLLMMetadata(event);
    if (metadata) {
      found = true;
      if (metadata.model) model = metadata.model;
      if (metadata.totalTokens) totalTokens += metadata.totalTokens;
      if (metadata.promptTokens) promptTokens += metadata.promptTokens;
      if (metadata.completionTokens)
        completionTokens += metadata.completionTokens;
      if (metadata.cost) cost = (cost ?? 0) + metadata.cost;
      if (metadata.score != null) score = metadata.score;
      if (metadata.traceUrl) traceUrl = metadata.traceUrl;
      if (metadata.extra) extra = { ...extra, ...metadata.extra };
    }
  }

  if (!found) return null;

  return {
    model,
    totalTokens: totalTokens || undefined,
    promptTokens: promptTokens || undefined,
    completionTokens: completionTokens || undefined,
    cost,
    score,
    traceUrl,
    ...(extra && Object.keys(extra).length > 0 ? { extra } : {}),
  };
};
