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
      result: { _llm: { model: 'gpt-4o', totalTokens: 100 } },
    });
    expect(getEventLLMMetadata(event)).toBeNull();
  });

  it('returns null when no _llm key is present', () => {
    const event = makeCompletedEvent({
      result: { data: 'something', model: 'gpt-4o' },
    });
    expect(getEventLLMMetadata(event)).toBeNull();
  });

  it('returns null when result is not an object', () => {
    const event = makeCompletedEvent({
      result: 'just a string',
    });
    expect(getEventLLMMetadata(event)).toBeNull();
  });

  it('extracts metadata from _llm convention', () => {
    const event = makeCompletedEvent({
      result: {
        answer: 'some output',
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

  it('extracts _llm with snake_case fields', () => {
    const event = makeCompletedEvent({
      result: {
        _llm: {
          model: 'claude-3-5-sonnet',
          prompt_tokens: 120,
          completion_tokens: 80,
          total_tokens: 200,
        },
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

  it('computes total from prompt + completion when total is missing', () => {
    const event = makeCompletedEvent({
      result: {
        _llm: {
          model: 'gpt-4',
          promptTokens: 100,
          completionTokens: 50,
        },
      },
    });
    const metadata = getEventLLMMetadata(event);
    expect(metadata?.totalTokens).toBe(150);
  });

  it('returns model-only metadata when no tokens present', () => {
    const event = makeCompletedEvent({
      result: {
        _llm: { model: 'gpt-4o' },
      },
    });
    expect(getEventLLMMetadata(event)).toEqual({ model: 'gpt-4o' });
  });

  it('returns null when _llm has no useful data', () => {
    const event = makeCompletedEvent({
      result: {
        _llm: { traceUrl: 'https://example.com' },
      },
    });
    expect(getEventLLMMetadata(event)).toBeNull();
  });

  it('extracts _llm from base64 payload wrapper', () => {
    const llmResult = {
      answer: 'output',
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

  it('returns null for base64 payload without _llm', () => {
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

  it('ignores heuristic LLM shapes without _llm key', () => {
    const event = makeCompletedEvent({
      result: {
        model: 'gpt-4o',
        usage: { prompt_tokens: 50, completion_tokens: 30, total_tokens: 80 },
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

  it('extracts metadata from a single completed event with _llm', () => {
    const event = makeCompletedEvent({
      result: {
        _llm: {
          model: 'gpt-4o',
          totalTokens: 100,
          promptTokens: 60,
          completionTokens: 40,
        },
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
