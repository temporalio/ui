import { describe, expect, it } from 'vitest';

import type { Callback } from '$lib/types/nexus';

import {
  appliedCallbackFilterCount,
  type CallbackFilters,
  callbackFilterUpdate,
  callbackTargetType,
  EMPTY_CALLBACK_FILTERS,
  filterCallbacks,
  matchesCallbackKeyword,
  parseCallbackFilters,
} from './nexus-operation-callback-filters';

const callback = (
  taskQueueName: string,
  service: string,
  operation: string,
  state = 'Standby',
  links: unknown[] = [],
): Callback =>
  ({
    state,
    callback: { nexusHandler: { taskQueueName, service, operation }, links },
  }) as unknown as Callback;

const workflowLink = {
  workflowEvent: { namespace: 'default', workflowId: 'wf', runId: 'run' },
};
const activityLink = {
  activity: { namespace: 'default', activityId: 'act', runId: 'run' },
};
const batchJobLink = { batchJob: { jobId: 'job' } };

const callbacks = [
  callback('orders-tq', 'order-service', 'start-workflow'),
  callback('orders-tq', 'order-service', 'update-workflow', 'Failed'),
  callback('billing-tq', 'billing-service', 'start-workflow', 'Succeeded', [
    workflowLink,
  ]),
  callback('billing-tq', 'order-service', 'start-activity', 'Succeeded', [
    activityLink,
  ]),
];

const filtersWith = (filters: Partial<CallbackFilters>): CallbackFilters => ({
  ...EMPTY_CALLBACK_FILTERS,
  ...filters,
});

const urlWith = (params: Record<string, string>) =>
  new URL(
    `http://localhost:3000/callbacks?${new URLSearchParams(params).toString()}`,
  );

describe('parseCallbackFilters', () => {
  it('returns empty filters when the URL has none', () => {
    expect(parseCallbackFilters(urlWith({}))).toEqual(EMPTY_CALLBACK_FILTERS);
  });

  it('reads keyword filters with their operator, defaulting to equal', () => {
    expect(
      parseCallbackFilters(
        urlWith({
          'callbacks-task-queue': 'orders-tq',
          'callbacks-service': 'order',
          'callbacks-service-operator': 'starts-with',
          'callbacks-operation': 'a,b',
          'callbacks-operation-operator': 'not-equal',
        }),
      ),
    ).toEqual(
      filtersWith({
        taskQueue: { operator: '=', value: 'orders-tq' },
        service: { operator: 'STARTS_WITH', value: 'order' },
        operation: { operator: '!=', value: 'a,b' },
      }),
    );
  });

  it('falls back to equal for an unknown operator', () => {
    expect(
      parseCallbackFilters(
        urlWith({
          'callbacks-service': 'order-service',
          'callbacks-service-operator': 'contains',
        }),
      ).service,
    ).toEqual({ operator: '=', value: 'order-service' });
  });

  it('reads delivery states and target types, dropping unknown values', () => {
    expect(
      parseCallbackFilters(
        urlWith({
          'callbacks-state': 'Failed,Bogus,BackingOff',
          'callbacks-target-type': 'workflow,nexusOperation',
        }),
      ),
    ).toEqual(
      filtersWith({
        state: ['Failed', 'BackingOff'],
        targetType: ['workflow'],
      }),
    );
  });
});

describe('matchesCallbackKeyword', () => {
  it('matches the whole value with =', () => {
    expect(
      matchesCallbackKeyword('orders-tq', {
        operator: '=',
        value: 'orders-tq',
      }),
    ).toBe(true);
    expect(
      matchesCallbackKeyword('orders-tq', { operator: '=', value: 'orders' }),
    ).toBe(false);
  });

  it('excludes the value with !=', () => {
    expect(
      matchesCallbackKeyword('orders-tq', {
        operator: '!=',
        value: 'orders-tq',
      }),
    ).toBe(false);
    expect(
      matchesCallbackKeyword('billing-tq', {
        operator: '!=',
        value: 'orders-tq',
      }),
    ).toBe(true);
  });

  it('matches a prefix with STARTS_WITH', () => {
    expect(
      matchesCallbackKeyword('orders-tq', {
        operator: 'STARTS_WITH',
        value: 'orders',
      }),
    ).toBe(true);
    expect(
      matchesCallbackKeyword('orders-tq', {
        operator: 'STARTS_WITH',
        value: 'tq',
      }),
    ).toBe(false);
  });

  it('is case-sensitive, like the workflow list', () => {
    expect(
      matchesCallbackKeyword('orders-tq', {
        operator: '=',
        value: 'Orders-TQ',
      }),
    ).toBe(false);
  });
});

describe('callbackTargetType', () => {
  it('reads the type of a succeeded callback’s target link', () => {
    expect(callbackTargetType(callbacks[2])).toBe('workflow');
    expect(callbackTargetType(callbacks[3])).toBe('activity');
    expect(
      callbackTargetType(
        callback('tq', 'service', 'operation', 'Succeeded', [batchJobLink]),
      ),
    ).toBe('batchJob');
  });

  it('has no type until the callback succeeds, matching the table', () => {
    expect(
      callbackTargetType(
        callback('tq', 'service', 'operation', 'Failed', [workflowLink]),
      ),
    ).toBeUndefined();
  });

  it('has no type without a target link', () => {
    expect(
      callbackTargetType(callback('tq', 'service', 'operation', 'Succeeded')),
    ).toBeUndefined();
  });
});

describe('filterCallbacks', () => {
  const operations = (filtered: Callback[]) =>
    filtered.map((filteredCallback) => [
      filteredCallback.callback?.nexusHandler?.taskQueueName,
      filteredCallback.callback?.nexusHandler?.operation,
    ]);

  it('returns every callback when no filter is applied', () => {
    expect(filterCallbacks(callbacks, EMPTY_CALLBACK_FILTERS)).toBe(callbacks);
  });

  it('matches the task queue keyword on the handler task queue', () => {
    expect(
      operations(
        filterCallbacks(
          callbacks,
          filtersWith({ taskQueue: { operator: '=', value: 'billing-tq' } }),
        ),
      ),
    ).toEqual([
      ['billing-tq', 'start-workflow'],
      ['billing-tq', 'start-activity'],
    ]);
  });

  it('matches the operation keyword on the displayed operation name', () => {
    expect(
      operations(
        filterCallbacks(
          callbacks,
          filtersWith({
            operation: { operator: 'STARTS_WITH', value: 'start-' },
          }),
        ),
      ),
    ).toEqual([
      ['orders-tq', 'start-workflow'],
      ['billing-tq', 'start-workflow'],
      ['billing-tq', 'start-activity'],
    ]);
  });

  it('matches any selected delivery state', () => {
    expect(
      operations(
        filterCallbacks(
          callbacks,
          filtersWith({ state: ['Failed', 'Succeeded'] }),
        ),
      ),
    ).toEqual([
      ['orders-tq', 'update-workflow'],
      ['billing-tq', 'start-workflow'],
      ['billing-tq', 'start-activity'],
    ]);
  });

  it('matches any selected target type and skips callbacks without a target', () => {
    expect(
      operations(
        filterCallbacks(callbacks, filtersWith({ targetType: ['activity'] })),
      ),
    ).toEqual([['billing-tq', 'start-activity']]);
  });

  it('requires a match in every filtered field', () => {
    expect(
      operations(
        filterCallbacks(
          callbacks,
          filtersWith({
            state: ['Succeeded'],
            service: { operator: '!=', value: 'billing-service' },
          }),
        ),
      ),
    ).toEqual([['billing-tq', 'start-activity']]);
  });

  it('returns nothing when no callback matches', () => {
    expect(
      filterCallbacks(
        callbacks,
        filtersWith({ taskQueue: { operator: '=', value: 'missing-tq' } }),
      ),
    ).toEqual([]);
  });
});

describe('appliedCallbackFilterCount', () => {
  it('counts each field that has a filter', () => {
    expect(appliedCallbackFilterCount(EMPTY_CALLBACK_FILTERS)).toBe(0);
    expect(
      appliedCallbackFilterCount(
        filtersWith({
          state: ['Failed', 'Blocked'],
          service: { operator: '=', value: 'order-service' },
        }),
      ),
    ).toBe(2);
  });
});

describe('callbackFilterUpdate', () => {
  it('writes each field and keyword operator to the URL and resets the page', () => {
    expect(
      callbackFilterUpdate(
        filtersWith({
          state: ['Failed', 'Blocked'],
          service: { operator: 'STARTS_WITH', value: 'order' },
          operation: { operator: '=', value: 'start-workflow' },
        }),
      ),
    ).toEqual({
      parameters: [
        { parameter: 'callbacks-state', value: 'Failed,Blocked' },
        { parameter: 'callbacks-task-queue', value: '' },
        { parameter: 'callbacks-task-queue-operator', value: '' },
        { parameter: 'callbacks-service', value: 'order' },
        { parameter: 'callbacks-service-operator', value: 'starts-with' },
        { parameter: 'callbacks-operation', value: 'start-workflow' },
        { parameter: 'callbacks-operation-operator', value: '' },
        { parameter: 'callbacks-target-type', value: '' },
      ],
      clearParameters: ['callbacks-page'],
    });
  });

  it('round-trips through parseCallbackFilters', () => {
    const filters = filtersWith({
      state: ['BackingOff'],
      taskQueue: { operator: '!=', value: 'orders tq,a' },
      targetType: ['workflow', 'batchJob'],
    });
    const params: Record<string, string> = {};
    for (const { parameter, value } of callbackFilterUpdate(filters)
      .parameters) {
      if (value) params[parameter] = value;
    }

    expect(parseCallbackFilters(urlWith(params))).toEqual(filters);
  });
});
