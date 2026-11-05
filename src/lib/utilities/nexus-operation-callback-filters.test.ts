import { describe, expect, it } from 'vitest';

import type { Callback } from '$lib/types/nexus';

import {
  appliedCallbackFilterCount,
  CALLBACK_FILTER_PARAMETERS,
  callbackFilterOptions,
  callbackFilterUpdate,
  filterCallbacks,
  limitCallbackFilterOptions,
  matchesCallbackFilterSearch,
  parseCallbackFilters,
} from './nexus-operation-callback-filters';

const callback = (
  taskQueueName: string,
  service: string,
  operation: string,
): Callback =>
  ({
    callback: { nexusHandler: { taskQueueName, service, operation } },
  }) as unknown as Callback;

const callbacks = [
  callback('orders-tq', 'order-service', 'start-workflow'),
  callback('orders-tq', 'order-service', 'update-workflow'),
  callback('billing-tq', 'billing-service', 'start-workflow'),
  callback('billing-tq', 'order-service', 'start-workflow'),
];

const urlWith = (params: Record<string, string>) =>
  new URL(
    `http://localhost:3000/callbacks?${new URLSearchParams(params).toString()}`,
  );

describe('parseCallbackFilters', () => {
  it('returns empty filters when the URL has none', () => {
    expect(parseCallbackFilters(urlWith({}))).toEqual({
      endpoint: [],
      service: [],
      operation: [],
    });
  });

  it('reads comma-joined, URL-encoded values for each field', () => {
    const url = urlWith({
      [CALLBACK_FILTER_PARAMETERS.endpoint]: `orders-tq,${encodeURIComponent('a,b')}`,
      [CALLBACK_FILTER_PARAMETERS.service]: 'order-service',
      [CALLBACK_FILTER_PARAMETERS.operation]: 'start-workflow',
    });

    expect(parseCallbackFilters(url)).toEqual({
      endpoint: ['orders-tq', 'a,b'],
      service: ['order-service'],
      operation: ['start-workflow'],
    });
  });
});

describe('filterCallbacks', () => {
  it('returns every callback when no filter is applied', () => {
    expect(
      filterCallbacks(callbacks, { endpoint: [], service: [], operation: [] }),
    ).toEqual(callbacks);
  });

  it('matches any selected value within a field', () => {
    expect(
      filterCallbacks(callbacks, {
        endpoint: [],
        service: [],
        operation: ['start-workflow', 'update-workflow'],
      }),
    ).toHaveLength(4);
  });

  it('requires a match in every filtered field', () => {
    expect(
      filterCallbacks(callbacks, {
        endpoint: ['billing-tq'],
        service: ['order-service'],
        operation: [],
      }),
    ).toEqual([callbacks[3]]);
  });

  it('matches the endpoint filter on the handler task queue', () => {
    expect(
      filterCallbacks(callbacks, {
        endpoint: ['orders-tq'],
        service: [],
        operation: [],
      }),
    ).toEqual([callbacks[0], callbacks[1]]);
  });

  it('returns nothing when no callback matches', () => {
    expect(
      filterCallbacks(callbacks, {
        endpoint: ['missing-tq'],
        service: [],
        operation: [],
      }),
    ).toEqual([]);
  });
});

describe('callbackFilterOptions', () => {
  it('lists the distinct values of each field with counts, sorted by value', () => {
    expect(callbackFilterOptions(callbacks)).toEqual({
      endpoint: [
        { value: 'billing-tq', count: 2 },
        { value: 'orders-tq', count: 2 },
      ],
      service: [
        { value: 'billing-service', count: 1 },
        { value: 'order-service', count: 3 },
      ],
      operation: [
        { value: 'start-workflow', count: 3 },
        { value: 'update-workflow', count: 1 },
      ],
    });
  });

  it('skips callbacks without a value for a field', () => {
    const options = callbackFilterOptions([
      { callback: {} } as unknown as Callback,
      callback('orders-tq', '', 'start-workflow'),
    ]);

    expect(options.endpoint).toEqual([{ value: 'orders-tq', count: 1 }]);
    expect(options.service).toEqual([]);
  });
});

describe('appliedCallbackFilterCount', () => {
  it('counts every selected value across the fields', () => {
    expect(
      appliedCallbackFilterCount({
        endpoint: ['orders-tq'],
        service: ['order-service', 'billing-service'],
        operation: [],
      }),
    ).toBe(3);
  });
});

describe('matchesCallbackFilterSearch', () => {
  it('matches case-insensitively anywhere in the value', () => {
    expect(matchesCallbackFilterSearch('Order-Service', 'der-se')).toBe(true);
    expect(matchesCallbackFilterSearch('order-service', 'BILLING')).toBe(false);
  });

  it('matches everything when the search is blank', () => {
    expect(matchesCallbackFilterSearch('order-service', '  ')).toBe(true);
  });
});

describe('limitCallbackFilterOptions', () => {
  const options = Array.from({ length: 150 }, (_, index) => ({
    value: `value-${String(index).padStart(3, '0')}`,
    count: 1,
  }));

  it('keeps the first options up to the limit', () => {
    expect(limitCallbackFilterOptions(options, [], 100)).toHaveLength(100);
  });

  it('always keeps selected options, even past the limit', () => {
    const limited = limitCallbackFilterOptions(options, ['value-149'], 100);

    expect(limited).toHaveLength(100);
    expect(limited.map(({ value }) => value)).toContain('value-149');
  });
});

describe('callbackFilterUpdate', () => {
  it('writes each field as an encoded, comma-joined URL parameter and resets the page', () => {
    expect(
      callbackFilterUpdate({
        endpoint: ['orders-tq', 'a,b'],
        service: [],
        operation: ['start-workflow'],
      }),
    ).toEqual({
      parameters: [
        {
          parameter: CALLBACK_FILTER_PARAMETERS.endpoint,
          value: `orders-tq,${encodeURIComponent('a,b')}`,
        },
        { parameter: CALLBACK_FILTER_PARAMETERS.service, value: '' },
        {
          parameter: CALLBACK_FILTER_PARAMETERS.operation,
          value: 'start-workflow',
        },
      ],
      clearParameters: ['callbacks-page'],
    });
  });

  it('round-trips through parseCallbackFilters', () => {
    const filters = {
      endpoint: ['orders-tq', 'a,b'],
      service: ['order service'],
      operation: [],
    };
    const params: Record<string, string> = {};
    for (const { parameter, value } of callbackFilterUpdate(filters)
      .parameters) {
      if (value) params[parameter] = value;
    }

    expect(parseCallbackFilters(urlWith(params))).toEqual(filters);
  });
});
