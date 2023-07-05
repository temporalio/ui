import { writable } from 'svelte/store';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { HistoryEvent } from '$lib/types/events';
import type { Settings } from '$lib/types/global';

import { getEventAttributes, toEventHistory } from '.';

import eventsFixture from '$fixtures/raw-events.descending.completed.json';
import settingsFixture from '$fixtures/settings.json';

const historyEvent = {
  eventId: '1',
  eventTime: '2022-07-01T20:28:48.796369169Z',
  eventType: 'WorkflowExecutionStarted',
  version: '0',
  taskId: '29887292',
  workflowExecutionStartedEventAttributes: {
    workflowType: {
      name: 'workflow.completion',
    },
    parentWorkflowNamespace: 'canary',
    parentWorkflowExecution: {
      workflowId: 'temporal.fixture.completed.workflow.id',
      runId: '971e2165-c4f8-4f78-87ca-b652a06eb234',
    },
    parentInitiatedEventId: '10',
    taskQueue: {
      name: 'canary-task-queue',
      kind: 'Normal',
    },
    input: {
      payloads: [
        {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
          },
          data: 'MTY1NjcwNzMyODc3NDI2MzA4Ng==',
        },
        {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
          },
          data: 'ImNhbmFyeSI=',
        },
      ],
    },
    workflowExecutionTimeout: '0s',
    workflowRunTimeout: '1200s',
    workflowTaskTimeout: '20s',
    continuedExecutionRunId: '',
    initiator: 'Unspecified',
    continuedFailure: null,
    lastCompletionResult: null,
    originalExecutionRunId: '202dcff6-7f35-4c65-995c-bcadce524fb1',
    identity: '',
    firstExecutionRunId: '202dcff6-7f35-4c65-995c-bcadce524fb1',
    retryPolicy: null,
    attempt: 1,
    workflowExecutionExpirationTime: null,
    cronSchedule: '',
    firstWorkflowTaskBackoff: '0s',
    memo: null,
    searchAttributes: {
      indexedFields: {
        CustomKeywordField: {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
            type: 'S2V5d29yZA==',
          },
          data: 'ImNoaWxkV29ya2Zsb3dWYWx1ZSI=',
        },
      },
    },
    prevAutoResetPoints: null,
    header: {
      fields: {},
    },
    parentInitiatedEventVersion: '0',
  },
} as unknown as HistoryEvent;

const namespace = 'unit-tests';
const settings = settingsFixture as unknown as Settings;
const accessToken = 'token-test';

describe('getEventAttributes', () => {
  beforeEach(() => {
    vi.mock('$lib/utilities/decode-payload', () => {
      const fn = async <T>(x: T): Promise<T> => x;

      const convertPayloadToJsonWithCodec = vi.fn(fn);
      const convertPayloadToJsonWithWebsocket = vi.fn(fn);
      const decodePayloadAttributes = vi.fn(fn);

      return {
        convertPayloadToJsonWithCodec,
        convertPayloadToJsonWithWebsocket,
        decodePayloadAttributes,
      };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should affix the type to the history event', async () => {
    const eventType = 'workflowExecutionStartedEventAttributes';
    const event = await getEventAttributes({
      historyEvent,
      namespace,
      settings,
      accessToken,
    });
    expect(event.type).toBe(eventType);
  });

  it('should call convertWithWebSocket if not provided an endpoint', async () => {
    const convertWithCodec = vi.fn(async <T>(x: T): Promise<T> => x);
    const convertWithWebsocket = vi.fn(async <T>(x: T): Promise<T> => x);

    await getEventAttributes(
      {
        historyEvent,
        namespace,
        settings,
        accessToken,
      },
      {
        convertWithWebsocket,
        convertWithCodec,
      },
    );

    expect(convertWithWebsocket).toBeCalled();
    expect(convertWithCodec).not.toBeCalled();
  });

  it('should call convertWithCodec if provided an endpoint in settings', async () => {
    const convertWithCodec = vi.fn(async <T>(x: T): Promise<T> => x);
    const convertWithWebsocket = vi.fn(async <T>(x: T): Promise<T> => x);

    await getEventAttributes(
      {
        historyEvent,
        namespace,
        settings: { ...settings, codec: { endpoint: 'https://localhost' } },
        accessToken,
      },
      {
        convertWithWebsocket,
        convertWithCodec,
      },
    );

    expect(convertWithCodec).toBeCalled();
    expect(convertWithWebsocket).not.toBeCalled();
  });

  it('should call convertWithCodec if provided an endpoint in settings', async () => {
    const convertWithCodec = vi.fn(async <T>(x: T): Promise<T> => x);
    const convertWithWebsocket = vi.fn(async <T>(x: T): Promise<T> => x);

    await getEventAttributes(
      {
        historyEvent,
        namespace,
        settings,
        accessToken,
      },
      {
        convertWithWebsocket,
        convertWithCodec,
        encoderEndpoint: writable('https://localhost'),
      },
    );

    expect(convertWithCodec).toBeCalled();
    expect(convertWithWebsocket).not.toBeCalled();
  });
});

describe('toEventHistory', () => {
  const additionalProperties = [
    'attributes',
    'eventType',
    'classification',
    'category',
    'id',
    'name',
    'timestamp',
  ];

  for (const property of additionalProperties) {
    it(`should add a[n] ${property} property`, async () => {
      const events = await toEventHistory({
        response: eventsFixture.history.events as unknown as HistoryEvent[],
        namespace,
        settings,
        accessToken,
      });

      const [event] = events;

      expect(event[property]).toBeDefined();
    });
  }
});
