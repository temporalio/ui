import { describe, expect, it } from 'vitest';

import type { WorkflowEvent } from '$lib/types/events';

import {
  getEventLLMMetadata,
  getGroupLLMMetadata,
} from './get-event-llm-metadata';

const makeCompletedEvent = (
  attributes: Record<string, unknown>,
): WorkflowEvent =>
  ({
    id: '1',
    eventType: 'ActivityTaskCompleted',
    activityTaskCompletedEventAttributes: {},
    attributes,
  }) as unknown as WorkflowEvent;

const makeNonActivityEvent = (
  attributes: Record<string, unknown>,
): WorkflowEvent =>
  ({
    id: '1',
    eventType: 'WorkflowExecutionStarted',
    workflowExecutionStartedEventAttributes: {},
    attributes,
  }) as unknown as WorkflowEvent;

describe('getEventLLMMetadata', () => {
  it('returns null for non-activity events', () => {
    const event = makeNonActivityEvent({
      model: 'gpt-4o',
      usage: { total_tokens: 100 },
    });
    expect(getEventLLMMetadata(event)).toBeNull();
  });

  it('extracts OpenAI-style nested usage from result', () => {
    const event = makeCompletedEvent({
      result: {
        model: 'gpt-4o',
        usage: {
          prompt_tokens: 50,
          completion_tokens: 30,
          total_tokens: 80,
        },
      },
    });
    const metadata = getEventLLMMetadata(event);
    expect(metadata).toEqual({
      model: 'gpt-4o',
      totalTokens: 80,
      promptTokens: 50,
      completionTokens: 30,
    });
  });

  it('extracts flat-style token data from result', () => {
    const event = makeCompletedEvent({
      result: {
        model: 'claude-3-opus',
        total_tokens: 200,
        prompt_tokens: 120,
        completion_tokens: 80,
      },
    });
    const metadata = getEventLLMMetadata(event);
    expect(metadata).toEqual({
      model: 'claude-3-opus',
      totalTokens: 200,
      promptTokens: 120,
      completionTokens: 80,
    });
  });

  it('extracts Anthropic-style usage with input_tokens/output_tokens', () => {
    const event = makeCompletedEvent({
      result: {
        model: 'claude-3-sonnet',
        usage: {
          input_tokens: 100,
          output_tokens: 50,
        },
      },
    });
    const metadata = getEventLLMMetadata(event);
    expect(metadata).toEqual({
      model: 'claude-3-sonnet',
      totalTokens: 150,
      promptTokens: 100,
      completionTokens: 50,
    });
  });

  it('extracts camelCase token fields', () => {
    const event = makeCompletedEvent({
      result: {
        model: 'gpt-4',
        usage: {
          promptTokens: 40,
          completionTokens: 20,
          totalTokens: 60,
        },
      },
    });
    const metadata = getEventLLMMetadata(event);
    expect(metadata).toEqual({
      model: 'gpt-4',
      totalTokens: 60,
      promptTokens: 40,
      completionTokens: 20,
    });
  });

  it('extracts top-level attributes when no result field', () => {
    const event = makeCompletedEvent({
      model: 'gpt-4o-mini',
      usage: {
        prompt_tokens: 10,
        completion_tokens: 5,
        total_tokens: 15,
      },
    });
    const metadata = getEventLLMMetadata(event);
    expect(metadata).toEqual({
      model: 'gpt-4o-mini',
      totalTokens: 15,
      promptTokens: 10,
      completionTokens: 5,
    });
  });

  it('returns model-only metadata when no tokens present', () => {
    const event = makeCompletedEvent({
      result: {
        model: 'gpt-4o',
        content: 'Hello!',
      },
    });
    const metadata = getEventLLMMetadata(event);
    expect(metadata).toEqual({
      model: 'gpt-4o',
    });
  });

  it('returns null when no LLM data is present', () => {
    const event = makeCompletedEvent({
      result: { data: 'something' },
    });
    expect(getEventLLMMetadata(event)).toBeNull();
  });

  it('computes total from prompt + completion when total is missing', () => {
    const event = makeCompletedEvent({
      result: {
        model: 'gpt-4',
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
        },
      },
    });
    const metadata = getEventLLMMetadata(event);
    expect(metadata).toEqual({
      model: 'gpt-4',
      totalTokens: 150,
      promptTokens: 100,
      completionTokens: 50,
    });
  });

  it('decodes base64 payload wrapper and extracts LLM metadata', () => {
    // This is the format returned by the real Temporal server API:
    // result is wrapped in { payloads: [{ metadata, data }] }
    const llmResult = {
      result: 'Response to prompt',
      model: 'gpt-4o',
      usage: {
        prompt_tokens: 50,
        completion_tokens: 30,
        total_tokens: 80,
      },
    };
    const base64Data = btoa(JSON.stringify(llmResult));

    const event = makeCompletedEvent({
      result: {
        payloads: [
          {
            metadata: { encoding: btoa('json/plain') },
            data: base64Data,
          },
        ],
      },
    });

    const metadata = getEventLLMMetadata(event);
    expect(metadata).toEqual({
      model: 'gpt-4o',
      totalTokens: 80,
      promptTokens: 50,
      completionTokens: 30,
    });
  });

  it('extracts metadata from _llm convention', () => {
    const event = makeCompletedEvent({
      result: {
        result: 'some output',
        _llm: {
          model: 'gpt-4o',
          promptTokens: 50,
          completionTokens: 30,
          totalTokens: 80,
          cost: 0.002,
          score: 0.85,
          traceUrl: 'https://braintrust.dev/trace/123',
        },
      },
    });
    const metadata = getEventLLMMetadata(event);
    expect(metadata).toEqual({
      model: 'gpt-4o',
      totalTokens: 80,
      promptTokens: 50,
      completionTokens: 30,
      cost: 0.002,
      score: 0.85,
      traceUrl: 'https://braintrust.dev/trace/123',
    });
  });

  it('extracts _llm from base64 payload wrapper', () => {
    const llmResult = {
      result: 'output',
      _llm: {
        model: 'claude-3-5-sonnet',
        promptTokens: 120,
        completionTokens: 80,
        totalTokens: 200,
      },
    };
    const base64Data = btoa(JSON.stringify(llmResult));

    const event = makeCompletedEvent({
      result: {
        payloads: [
          {
            metadata: { encoding: btoa('json/plain') },
            data: base64Data,
          },
        ],
      },
    });

    const metadata = getEventLLMMetadata(event);
    expect(metadata).toEqual({
      model: 'claude-3-5-sonnet',
      totalTokens: 200,
      promptTokens: 120,
      completionTokens: 80,
    });
  });

  it('prefers _llm convention over heuristic detection', () => {
    const event = makeCompletedEvent({
      result: {
        model: 'wrong-model',
        usage: { total_tokens: 999 },
        _llm: {
          model: 'correct-model',
          totalTokens: 100,
        },
      },
    });
    const metadata = getEventLLMMetadata(event);
    expect(metadata?.model).toBe('correct-model');
    expect(metadata?.totalTokens).toBe(100);
  });

  it('handles payload wrapper with non-LLM data gracefully', () => {
    const plainResult = { status: 'ok', count: 42 };
    const base64Data = btoa(JSON.stringify(plainResult));

    const event = makeCompletedEvent({
      result: {
        payloads: [
          {
            metadata: { encoding: btoa('json/plain') },
            data: base64Data,
          },
        ],
      },
    });

    expect(getEventLLMMetadata(event)).toBeNull();
  });
});

describe('getGroupLLMMetadata', () => {
  it('returns null for a single non-LLM event', () => {
    const event = makeNonActivityEvent({});
    expect(getGroupLLMMetadata(event)).toBeNull();
  });

  it('extracts metadata from a single completed event', () => {
    const event = makeCompletedEvent({
      result: {
        model: 'gpt-4o',
        usage: { total_tokens: 100, prompt_tokens: 60, completion_tokens: 40 },
      },
    });
    expect(getGroupLLMMetadata(event)).toEqual({
      model: 'gpt-4o',
      totalTokens: 100,
      promptTokens: 60,
      completionTokens: 40,
    });
  });
});
