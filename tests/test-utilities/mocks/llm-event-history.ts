import type { Page } from '@playwright/test';

import { EVENT_HISTORY_API, EVENT_HISTORY_API_REVERSE } from './event-history';

import type { GetWorkflowExecutionHistoryResponse } from '$src/lib/types/events';

/**
 * Mock event history containing 3 LLM activity groups with different models
 * and token counts. Each activity result is a decoded JSON object (not
 * wrapped in payloads) so the LLM metadata extractor can read fields directly.
 *
 * Activity 1: callLLM        / gpt-4o           / 80 tokens
 * Activity 2: callLLMClaude  / claude-3-5-sonnet / 200 tokens
 * Activity 3: callLLMGemini  / gemini-1.5-pro    / 120 tokens
 * Total: 400 tokens across 3 models
 */

const workflowTask = (
  scheduledId: string,
  startedId: string,
  completedId: string,
  baseTime: string,
) => [
  {
    eventId: scheduledId,
    eventTime: baseTime,
    eventType: 'WorkflowTaskScheduled',
    version: '0',
    taskId: `200${scheduledId}`,
    workflowTaskScheduledEventAttributes: {
      taskQueue: { name: 'llm-tasks', kind: 'Normal' },
      startToCloseTimeout: '10s',
      attempt: 1,
    },
  },
  {
    eventId: startedId,
    eventTime: baseTime,
    eventType: 'WorkflowTaskStarted',
    version: '0',
    taskId: `200${startedId}`,
    workflowTaskStartedEventAttributes: {
      scheduledEventId: scheduledId,
      identity: '12345@test@',
      requestId: `req-wft-${scheduledId}`,
    },
  },
  {
    eventId: completedId,
    eventTime: baseTime,
    eventType: 'WorkflowTaskCompleted',
    version: '0',
    taskId: `200${completedId}`,
    workflowTaskCompletedEventAttributes: {
      scheduledEventId: scheduledId,
      startedEventId: startedId,
      identity: '12345@test@',
      binaryChecksum: 'abc123',
    },
  },
];

const activityGroup = (
  scheduledId: string,
  startedId: string,
  completedId: string,
  wftCompletedId: string,
  activityName: string,
  result: Record<string, unknown>,
  baseTime: string,
) => [
  {
    eventId: scheduledId,
    eventTime: baseTime,
    eventType: 'ActivityTaskScheduled',
    version: '0',
    taskId: `200${scheduledId}`,
    activityTaskScheduledEventAttributes: {
      activityId: scheduledId,
      activityType: { name: activityName },
      namespace: '',
      taskQueue: { name: 'llm-tasks', kind: 'Normal' },
      header: { fields: {} },
      input: {
        payloads: [
          {
            metadata: { encoding: 'anNvbi9wbGFpbg==' },
            data: 'IkhlbGxvIg==',
          },
        ],
      },
      scheduleToCloseTimeout: '0s',
      scheduleToStartTimeout: '0s',
      startToCloseTimeout: '10s',
      heartbeatTimeout: '0s',
      workflowTaskCompletedEventId: wftCompletedId,
      retryPolicy: {
        initialInterval: '1s',
        backoffCoefficient: 2,
        maximumInterval: '100s',
        maximumAttempts: 1,
        nonRetryableErrorTypes: [],
      },
    },
  },
  {
    eventId: startedId,
    eventTime: baseTime,
    eventType: 'ActivityTaskStarted',
    version: '0',
    taskId: `200${startedId}`,
    activityTaskStartedEventAttributes: {
      scheduledEventId: scheduledId,
      identity: '12345@test@',
      requestId: `req-act-${scheduledId}`,
      attempt: 1,
    },
  },
  {
    eventId: completedId,
    eventTime: baseTime,
    eventType: 'ActivityTaskCompleted',
    version: '0',
    taskId: `200${completedId}`,
    activityTaskCompletedEventAttributes: {
      scheduledEventId: scheduledId,
      startedEventId: startedId,
      identity: '12345@test@',
      result,
    },
  },
];

export const mockLLMEventHistory = {
  history: {
    events: [
      // Event 1: WorkflowExecutionStarted
      {
        eventId: '1',
        eventTime: '2024-06-15T10:00:00.000000000Z',
        eventType: 'WorkflowExecutionStarted',
        version: '0',
        taskId: '2000001',
        workflowExecutionStartedEventAttributes: {
          workflowType: { name: 'LLMWorkflow' },
          parentWorkflowNamespace: '',
          parentWorkflowExecution: null,
          parentInitiatedEventId: '0',
          taskQueue: { name: 'llm-tasks', kind: 'Normal' },
          input: {
            payloads: [
              {
                metadata: { encoding: 'anNvbi9wbGFpbg==' },
                data: 'IkhlbGxvIg==',
              },
            ],
          },
          workflowExecutionTimeout: '0s',
          workflowRunTimeout: '0s',
          workflowTaskTimeout: '10s',
          continuedExecutionRunId: '',
          initiator: 'Unspecified',
          continuedFailure: null,
          lastCompletionResult: null,
          originalExecutionRunId: 'aaa11111-1111-1111-1111-111111111111',
          identity: '12345@test@',
          firstExecutionRunId: 'aaa11111-1111-1111-1111-111111111111',
          retryPolicy: null,
          attempt: 1,
          workflowExecutionExpirationTime: null,
          cronSchedule: '',
          firstWorkflowTaskBackoff: '0s',
          memo: null,
          searchAttributes: { indexedFields: {} },
          prevAutoResetPoints: null,
          header: { fields: {} },
        },
      },

      // Events 2-4: First WorkflowTask
      ...workflowTask('2', '3', '4', '2024-06-15T10:00:00.100000000Z'),

      // Events 5-7: Activity 1 - callLLM (gpt-4o, 80 tokens)
      ...activityGroup(
        '5',
        '6',
        '7',
        '4',
        'callLLM',
        {
          result: 'Hello from the LLM',
          _details: {
            model: 'gpt-4o',
            promptTokens: 50,
            completionTokens: 30,
            totalTokens: 80,
            cost: 0.002,
          },
        },
        '2024-06-15T10:00:01.000000000Z',
      ),

      // Events 8-10: Second WorkflowTask
      ...workflowTask('8', '9', '10', '2024-06-15T10:00:01.100000000Z'),

      // Events 11-13: Activity 2 - callLLMClaude (claude-3-5-sonnet, 200 tokens)
      ...activityGroup(
        '11',
        '12',
        '13',
        '10',
        'callLLMClaude',
        {
          result: 'Claude response',
          _details: {
            model: 'claude-3-5-sonnet',
            promptTokens: 120,
            completionTokens: 80,
            totalTokens: 200,
            cost: 0.006,
          },
        },
        '2024-06-15T10:00:02.000000000Z',
      ),

      // Events 14-16: Third WorkflowTask
      ...workflowTask('14', '15', '16', '2024-06-15T10:00:02.100000000Z'),

      // Events 17-19: Activity 3 - callLLMGemini (gemini-1.5-pro, 120 tokens)
      ...activityGroup(
        '17',
        '18',
        '19',
        '16',
        'callLLMGemini',
        {
          result: 'Gemini response',
          _details: {
            model: 'gemini-1.5-pro',
            promptTokens: 75,
            completionTokens: 45,
            totalTokens: 120,
            cost: 0.003,
          },
        },
        '2024-06-15T10:00:03.000000000Z',
      ),

      // Events 20-22: Final WorkflowTask
      ...workflowTask('20', '21', '22', '2024-06-15T10:00:03.100000000Z'),

      // Event 23: WorkflowExecutionCompleted
      {
        eventId: '23',
        eventTime: '2024-06-15T10:00:03.200000000Z',
        eventType: 'WorkflowExecutionCompleted',
        version: '0',
        taskId: '2000023',
        workflowExecutionCompletedEventAttributes: {
          result: {
            payloads: [
              {
                metadata: { encoding: 'anNvbi9wbGFpbg==' },
                data: 'W10=',
              },
            ],
          },
          workflowTaskCompletedEventId: '22',
        },
      },
    ],
  },
  rawHistory: [],
  nextPageToken: null,
  archived: false,
};

export const mockLLMWorkflow = {
  executionConfig: {
    taskQueue: { name: 'llm-tasks', kind: 'Normal' },
    workflowExecutionTimeout: '0s',
    workflowRunTimeout: '0s',
    defaultWorkflowTaskTimeout: '10s',
  },
  workflowExecutionInfo: {
    execution: {
      workflowId: 'llm-workflow-test',
      runId: 'aaa11111-1111-1111-1111-111111111111',
    },
    type: { name: 'LLMWorkflow' },
    startTime: '2024-06-15T10:00:00.000000000Z',
    closeTime: '2024-06-15T10:00:03.200000000Z',
    status: 'Completed',
    historyLength: '23',
    parentNamespaceId: '',
    parentExecution: null,
    historySizeBytes: '',
    executionTime: '2024-06-15T10:00:00.000000000Z',
    memo: {},
    searchAttributes: { indexedFields: {} },
    autoResetPoints: null,
    taskQueue: 'llm-tasks',
    stateTransitionCount: '16',
  },
  pendingActivities: [],
  pendingChildren: [],
};

export const mockLLMEventHistoryApi = (page: Page) => {
  const ascending = page.route(EVENT_HISTORY_API, (route) => {
    return route.fulfill({
      json: mockLLMEventHistory as unknown as GetWorkflowExecutionHistoryResponse,
    });
  });

  const descending = page.route(EVENT_HISTORY_API_REVERSE, (route) => {
    return route.fulfill({
      json: {
        ...mockLLMEventHistory,
        history: {
          events: [...mockLLMEventHistory.history.events].reverse(),
        },
      } as unknown as GetWorkflowExecutionHistoryResponse,
    });
  });

  return Promise.all([ascending, descending]);
};
