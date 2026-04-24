import { describe, expect, it } from 'vitest';

import type {
  ActivityTaskCompletedEvent,
  ActivityTaskScheduledEvent,
  WorkflowEvents,
} from '$lib/types/events';

import {
  getLLMMetadata,
  getWorkflowChatTurn,
  getWorkflowChatTurns,
} from './workflow-chat';

const scheduledEvent = {
  id: '11',
  timestamp: 'Apr 24, 2026, 10:00:00',
  activityTaskScheduledEventAttributes: {
    activityId: 'chat-1',
    activityType: 'CallLLM',
    input: {
      payloads: [{ metadata: {}, data: '' }],
    },
  },
} as unknown as ActivityTaskScheduledEvent;

const completedEvent = {
  id: '13',
  timestamp: 'Apr 24, 2026, 10:00:03',
  activityTaskCompletedEventAttributes: {
    scheduledEventId: '11',
    result: {
      payloads: [{ metadata: {}, data: '' }],
    },
  },
} as unknown as ActivityTaskCompletedEvent;

describe('getLLMMetadata', () => {
  it('returns llm metadata when _details is present', () => {
    expect(
      getLLMMetadata({
        _details: {
          model: 'gpt-test',
          promptKey: 'prompt',
          responseKey: 'result',
        },
      }),
    ).toEqual({
      model: 'gpt-test',
      promptKey: 'prompt',
      responseKey: 'result',
    });
  });

  it('returns null when _details is missing', () => {
    expect(getLLMMetadata({ result: 'hello' })).toBeNull();
  });
});

describe('getWorkflowChatTurn', () => {
  it('builds a chat turn from matching activity events', async () => {
    const decode = async (value: unknown) => {
      if (value === scheduledEvent.activityTaskScheduledEventAttributes.input) {
        return { payloads: [{ prompt: 'What is the weather?' }] };
      }

      if (
        value === completedEvent.activityTaskCompletedEventAttributes.result
      ) {
        return {
          payloads: [
            {
              result: 'Sunny.',
              _details: {
                model: 'gpt-test',
                provider: 'openai',
                promptKey: 'prompt',
                responseKey: 'result',
              },
            },
          ],
        };
      }

      return value;
    };

    const turn = await getWorkflowChatTurn(
      scheduledEvent,
      completedEvent,
      decode,
    );

    expect(turn).toEqual({
      id: '11',
      activityId: 'chat-1',
      activityType: 'CallLLM',
      userTimestamp: 'Apr 24, 2026, 10:00:00',
      assistantTimestamp: 'Apr 24, 2026, 10:00:03',
      userContent: 'What is the weather?',
      assistantContent: 'Sunny.',
      llm: {
        model: 'gpt-test',
        provider: 'openai',
        promptKey: 'prompt',
        responseKey: 'result',
      },
      status: 'completed',
    });
  });
});

describe('getWorkflowChatTurns', () => {
  it('renders an LLM input turn before the activity completes', async () => {
    const events = [scheduledEvent] as unknown as WorkflowEvents;

    const decode = async (value: unknown) => {
      if (value === scheduledEvent.activityTaskScheduledEventAttributes.input) {
        return {
          payloads: [
            {
              prompt: 'What is the weather?',
              _details: {
                promptKey: 'prompt',
              },
            },
          ],
        };
      }

      return value;
    };

    const turns = await getWorkflowChatTurns(events, decode);

    expect(turns).toEqual([
      {
        id: '11',
        activityId: 'chat-1',
        activityType: 'CallLLM',
        userTimestamp: 'Apr 24, 2026, 10:00:00',
        userContent: 'What is the weather?',
        llm: {
          promptKey: 'prompt',
        },
        status: 'pending',
      },
    ]);
  });

  it('renders a scheduled chat activity before completion even without input metadata', async () => {
    const events = [scheduledEvent] as unknown as WorkflowEvents;

    const decode = async (value: unknown) => {
      if (value === scheduledEvent.activityTaskScheduledEventAttributes.input) {
        return {
          payloads: [{ prompt: 'What is the weather?' }],
        };
      }

      return value;
    };

    const turns = await getWorkflowChatTurns(events, decode);

    expect(turns).toEqual([
      {
        id: '11',
        activityId: 'chat-1',
        activityType: 'CallLLM',
        userTimestamp: 'Apr 24, 2026, 10:00:00',
        userContent: 'What is the weather?',
        llm: {},
        status: 'pending',
      },
    ]);
  });

  it('filters out activities without llm metadata', async () => {
    const events = [
      scheduledEvent,
      completedEvent,
      {
        id: '21',
        timestamp: 'Apr 24, 2026, 10:01:00',
        activityTaskScheduledEventAttributes: {
          activityId: 'other',
          activityType: 'NonLLM',
          input: null,
        },
      },
      {
        id: '22',
        timestamp: 'Apr 24, 2026, 10:01:01',
        activityTaskCompletedEventAttributes: {
          scheduledEventId: '21',
          result: {
            payloads: [{ metadata: {}, data: '' }],
          },
        },
      },
    ] as unknown as WorkflowEvents;

    const decode = async (value: unknown) => {
      if (value === scheduledEvent.activityTaskScheduledEventAttributes.input) {
        return { payloads: [{ prompt: 'What is the weather?' }] };
      }

      if (
        value === completedEvent.activityTaskCompletedEventAttributes.result
      ) {
        return {
          payloads: [
            {
              result: 'Sunny.',
              _details: {
                promptKey: 'prompt',
                responseKey: 'result',
              },
            },
          ],
        };
      }

      return value;
    };

    const turns = await getWorkflowChatTurns(events, decode);

    expect(turns).toHaveLength(1);
    expect(turns[0].activityId).toBe('chat-1');
    expect(turns[0].status).toBe('completed');
  });

  it('drops heuristic scheduled turns after completion if they are not actually LLM activities', async () => {
    const events = [
      scheduledEvent,
      completedEvent,
    ] as unknown as WorkflowEvents;

    const decode = async (value: unknown) => {
      if (value === scheduledEvent.activityTaskScheduledEventAttributes.input) {
        return {
          payloads: [{ prompt: 'What is the weather?' }],
        };
      }

      if (
        value === completedEvent.activityTaskCompletedEventAttributes.result
      ) {
        return {
          payloads: [{ result: 'Sunny.' }],
        };
      }

      return value;
    };

    const turns = await getWorkflowChatTurns(events, decode);

    expect(turns).toEqual([]);
  });
});
