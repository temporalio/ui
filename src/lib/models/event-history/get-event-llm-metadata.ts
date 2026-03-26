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
  totalTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  cost?: number;
  score?: number;
  traceUrl?: string;
}

interface UsageObject {
  total_tokens?: number;
  totalTokens?: number;
  prompt_tokens?: number;
  promptTokens?: number;
  completion_tokens?: number;
  completionTokens?: number;
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

const getNumber = (v: unknown): number | undefined =>
  typeof v === 'number' ? v : undefined;

const getString = (v: unknown): string | undefined =>
  typeof v === 'string' && v.length > 0 ? v : undefined;

/**
 * Extracts token usage from a usage-shaped object.
 * Handles both snake_case (OpenAI) and camelCase conventions.
 */
const extractUsage = (usage: UsageObject): Omit<LLMMetadata, 'model'> => {
  const totalTokens =
    getNumber(usage.total_tokens) ?? getNumber(usage.totalTokens);
  const promptTokens =
    getNumber(usage.prompt_tokens) ?? getNumber(usage.promptTokens);
  const completionTokens =
    getNumber(usage.completion_tokens) ?? getNumber(usage.completionTokens);

  return {
    totalTokens:
      totalTokens ??
      (promptTokens && completionTokens
        ? promptTokens + completionTokens
        : undefined),
    promptTokens,
    completionTokens,
  };
};

/**
 * Extracts LLM metadata from the _llm convention.
 * This is the preferred, explicit way to signal LLM metadata in an activity result.
 * The _llm key is set by wrappers (wrap_openai, Braintrust plugin, etc.) or by user code.
 */
const extractFromLLMConvention = (
  resultData: Record<string, unknown>,
): LLMMetadata | null => {
  const llm = resultData._llm;
  if (!isObject(llm)) return null;

  const model = getString(llm.model);
  const totalTokens = getNumber(llm.totalTokens) ?? getNumber(llm.total_tokens);
  const promptTokens =
    getNumber(llm.promptTokens) ?? getNumber(llm.prompt_tokens);
  const completionTokens =
    getNumber(llm.completionTokens) ?? getNumber(llm.completion_tokens);
  const cost = getNumber(llm.cost);
  const score = getNumber(llm.score);
  const traceUrl = getString(llm.traceUrl) ?? getString(llm.trace_url);

  if (!model && !totalTokens && !promptTokens) return null;

  return {
    model,
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
  };
};

/**
 * Inspects an event's attributes for recognized LLM response shapes.
 *
 * Handles:
 * - OpenAI style: { usage: { prompt_tokens, completion_tokens, total_tokens }, model: "gpt-4o" }
 * - Flat style: { total_tokens: 150, model: "gpt-4o" }
 * - Nested in result: { result: "...", usage: { ... } }
 * - Anthropic style: { usage: { input_tokens, output_tokens }, model: "claude-3-opus" }
 */
const extractLLMMetadataFromAttributes = (
  attrs: Record<string, unknown>,
): LLMMetadata | null => {
  const model = getString(attrs.model);

  // Try nested usage object first (OpenAI / Anthropic standard shape)
  if (isObject(attrs.usage)) {
    const usage = extractUsage(attrs.usage as UsageObject);

    // Also handle Anthropic's input_tokens/output_tokens
    const anthropicPrompt =
      usage.promptTokens ??
      getNumber((attrs.usage as Record<string, unknown>).input_tokens);
    const anthropicCompletion =
      usage.completionTokens ??
      getNumber((attrs.usage as Record<string, unknown>).output_tokens);

    const result: LLMMetadata = {
      model,
      totalTokens:
        usage.totalTokens ??
        (anthropicPrompt && anthropicCompletion
          ? anthropicPrompt + anthropicCompletion
          : undefined),
      promptTokens: anthropicPrompt,
      completionTokens: anthropicCompletion,
    };

    if (result.model || result.totalTokens) return result;
  }

  // Try flat style (keys directly on the attributes)
  const flatUsage = extractUsage(attrs as unknown as UsageObject);
  if (flatUsage.totalTokens || flatUsage.promptTokens) {
    return { model, ...flatUsage };
  }

  // Model present but no token info - still useful to display
  if (model) {
    return { model };
  }

  return null;
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

    // Check for _llm convention first (explicit, preferred)
    const llmConvention = extractFromLLMConvention(resultData);
    if (llmConvention) return llmConvention;

    // Fall back to heuristic detection (OpenAI/Anthropic/flat shapes)
    const metadata = extractLLMMetadataFromAttributes(resultData);
    if (metadata) return metadata;
  }

  // Check top-level attributes (some plugins put usage data at the top level)
  return extractLLMMetadataFromAttributes(attrs as Record<string, unknown>);
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
    }
  }

  if (!found) return null;

  return {
    model,
    totalTokens: totalTokens || undefined,
    promptTokens: promptTokens || undefined,
    completionTokens: completionTokens || undefined,
  };
};
