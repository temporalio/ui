import { describe, expect, it } from 'vitest';

import type { StandaloneActivityFormData } from '$lib/components/standalone-activities/start-standalone-activity-form/types';

import {
  toActivityCallbacks,
  toStartActivityExecutionRequest,
} from './standalone-activities';

const baseFormData: StandaloneActivityFormData = {
  identity: 'test',
  namespace: 'default',
  activityId: 'activity-1',
  taskQueue: 'task-queue',
  activityType: 'MyActivity',
  startToCloseTimeout: '',
  scheduleToCloseTimeout: '',
  scheduleToStartTimeout: '',
  input: '',
  encoding: 'json/plain',
  messageType: '',
  searchAttributes: [],
  summary: '',
  details: '',
  initialInterval: '',
  backoffCoefficient: '',
  maximumInterval: '',
  maximumAttempts: '',
};

describe('toStartActivityExecutionRequest', () => {
  it('omits retry policy numbers left empty', async () => {
    const request = await toStartActivityExecutionRequest(baseFormData);

    expect(request.retryPolicy).toEqual({});
  });

  it('coerces populated retry policy numbers to numbers', async () => {
    const request = await toStartActivityExecutionRequest({
      ...baseFormData,
      backoffCoefficient: '2',
      maximumAttempts: '5',
    });

    expect(request.retryPolicy?.backoffCoefficient).toBe(2);
    expect(request.retryPolicy?.maximumAttempts).toBe(5);
  });

  it('omits timeouts left empty and forwards provided ones', async () => {
    const empty = await toStartActivityExecutionRequest(baseFormData);

    expect(empty.startToCloseTimeout).toBeUndefined();
    expect(empty.scheduleToCloseTimeout).toBeUndefined();

    const provided = await toStartActivityExecutionRequest({
      ...baseFormData,
      startToCloseTimeout: '30s',
    });

    expect(provided.startToCloseTimeout).toBe('30s');
  });
});

describe('toActivityCallbacks', () => {
  const activityCallbacks = [
    {
      trigger: {},
      info: {
        callback: {
          nexus: { url: 'http://callback' },
          links: [
            {
              workflowEvent: {
                namespace: 'caller-ns',
                workflowId: 'caller-wf',
                runId: 'caller-run',
                eventRef: { eventId: '7' },
              },
            },
          ],
        },
        state: 'CALLBACK_STATE_SUCCEEDED',
        attempt: 2,
      },
    },
  ] as unknown as Parameters<typeof toActivityCallbacks>[0];

  it('extracts nested info and makes state readable', () => {
    const [callback] = toActivityCallbacks(activityCallbacks);

    expect(callback.state).toBe('Succeeded');
    expect(callback.attempt).toBe(2);
    expect(callback.callback?.links).toHaveLength(1);
    expect(callback.callback?.nexus?.url).toBe('http://callback');
  });

  it('skips callbacks without info and handles empty input', () => {
    expect(toActivityCallbacks(undefined)).toEqual([]);
    expect(
      toActivityCallbacks([
        {},
      ] as unknown as Parameters<typeof toActivityCallbacks>[0]),
    ).toEqual([]);
  });
});
