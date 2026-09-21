import { beforeEach, describe, expect, it, vi } from 'vitest';

import { requestFromAPI } from '$lib/utilities/request-from-api';

import {
  clearKnownWorkflowTypesCache,
  fetchKnownWorkflowTypes,
  NLSearchError,
  parseRetryAfter,
  toNLSearchErrorMessage,
  toNLSearchRequest,
  translateNaturalLanguageSearch,
} from './nl-search-service';

vi.mock('$lib/utilities/request-from-api', () => ({
  requestFromAPI: vi.fn(),
}));

const payload = (value: unknown) => ({
  metadata: { encoding: btoa('json/plain') },
  data: btoa(JSON.stringify(value)),
});

const options = {
  namespace: 'orders-prod',
  text: '  failed order workflows from yesterday ',
  searchAttributes: { WorkflowType: 'Keyword', IsVip: 'Bool' } as const,
  customAttributeNames: ['IsVip', 'Removed'],
  knownWorkflowTypes: ['OrderWorkflow'],
};

describe('toNLSearchRequest', () => {
  it('builds the contract request', () => {
    const now = new Date('2026-09-20T15:04:05.000Z');

    expect(toNLSearchRequest(options, now)).toEqual({
      namespace: 'orders-prod',
      text: 'failed order workflows from yesterday',
      now: '2026-09-20T15:04:05.000Z',
      timezoneOffsetMinutes: -now.getTimezoneOffset(),
      searchAttributes: { WorkflowType: 'Keyword', IsVip: 'Bool' },
      customAttributeNames: ['IsVip'],
      knownWorkflowTypes: ['OrderWorkflow'],
    });
  });

  it('applies the server limits', () => {
    const searchAttributes = Object.fromEntries(
      Array.from({ length: 150 }, (_, i) => [`Attribute${i}`, 'Keyword']),
    );
    const request = toNLSearchRequest({
      text: 'x',
      searchAttributes: { ...searchAttributes, ['a'.repeat(201)]: 'Keyword' },
      customAttributeNames: [],
      knownWorkflowTypes: [
        'b'.repeat(201),
        ...Array.from({ length: 150 }, (_, i) => `Type${i}`),
      ],
    });

    expect(Object.keys(request.searchAttributes)).toHaveLength(100);
    expect(request.knownWorkflowTypes).toHaveLength(100);
    expect(request.knownWorkflowTypes).not.toContain('b'.repeat(201));
  });
});

describe('toNLSearchRequest attribute priority', () => {
  it('keeps system and custom attributes when there are more than 100', () => {
    const filler = Object.fromEntries(
      Array.from({ length: 120 }, (_, i) => [`Filler${i}`, 'Keyword']),
    );
    const request = toNLSearchRequest({
      text: 'x',
      searchAttributes: {
        ...filler,
        CustomerTier: 'Keyword',
        ExecutionStatus: 'Keyword',
        WorkflowType: 'Keyword',
        WorkflowId: 'Keyword',
        RunId: 'Keyword',
        StartTime: 'Datetime',
        CloseTime: 'Datetime',
        ExecutionTime: 'Datetime',
      },
      customAttributeNames: ['CustomerTier'],
      knownWorkflowTypes: [],
    });

    const names = Object.keys(request.searchAttributes);
    expect(names).toHaveLength(100);
    expect(names.slice(0, 8)).toEqual([
      'ExecutionStatus',
      'WorkflowType',
      'WorkflowId',
      'RunId',
      'StartTime',
      'CloseTime',
      'ExecutionTime',
      'CustomerTier',
    ]);
    expect(names).toContain('Filler0');
    expect(names).not.toContain('Filler119');
    expect(request.customAttributeNames).toEqual(['CustomerTier']);
  });
});

describe('translateNaturalLanguageSearch', () => {
  beforeEach(() => {
    vi.mocked(requestFromAPI).mockReset();
  });

  it('posts the request to the nl-search route', async () => {
    const response = {
      filters: [
        {
          attribute: 'WorkflowType',
          type: 'Keyword',
          conditional: '=',
          value: 'OrderWorkflow',
          confidence: 0.9,
        },
      ],
      confidence: 0.9,
      understood: true,
    };
    vi.mocked(requestFromAPI).mockResolvedValue(response);

    await expect(translateNaturalLanguageSearch(options)).resolves.toEqual(
      response,
    );

    const [route, init] = vi.mocked(requestFromAPI).mock.calls[0];
    expect(route).toMatch(/\/api\/v1\/nl-search$/);
    expect(init?.options?.method).toBe('POST');
    expect(init?.notifyOnError).toBe(false);
    expect(JSON.parse(String(init?.options?.body))).toMatchObject({
      namespace: 'orders-prod',
      text: 'failed order workflows from yesterday',
      knownWorkflowTypes: ['OrderWorkflow'],
    });
  });

  it('reports understood as false when there are no filters', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue({ understood: true });

    await expect(translateNaturalLanguageSearch(options)).resolves.toEqual({
      filters: [],
      confidence: 0,
      understood: false,
    });
  });

  it('throws a typed error with the server message', async () => {
    vi.mocked(requestFromAPI).mockRejectedValue({
      statusCode: 502,
      message: 'model unavailable',
    });

    const error = await translateNaturalLanguageSearch(options).catch(
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(NLSearchError);
    expect((error as NLSearchError).message).toBe('model unavailable');
    expect((error as NLSearchError).statusCode).toBe(502);
  });
});

describe('translateNaturalLanguageSearch error statuses', () => {
  const rejectWith = (
    statusCode: number,
    message: string,
    headers: Record<string, string> = {},
  ) => {
    vi.mocked(requestFromAPI).mockRejectedValue({
      statusCode,
      statusText: '',
      message,
      response: new Response(null, { status: statusCode, headers }),
    });
    return translateNaturalLanguageSearch(options).catch(
      (e: unknown) => e,
    ) as Promise<NLSearchError>;
  };

  beforeEach(() => {
    vi.mocked(requestFromAPI).mockReset();
  });

  it('reads Retry-After on 429', async () => {
    const error = await rejectWith(429, 'rate limit exceeded', {
      'Retry-After': '12',
    });

    expect(error.kind).toBe('rate-limited');
    expect(error.retryAfterSeconds).toBe(12);
    expect(toNLSearchErrorMessage(error)).toBe(
      'Too many searches. Try again in 12 seconds.',
    );
  });

  it('uses the singular form for 1 second', async () => {
    const error = await rejectWith(429, '', { 'Retry-After': '1' });

    expect(toNLSearchErrorMessage(error)).toBe(
      'Too many searches. Try again in 1 second.',
    );
  });

  it('uses the fallback text on 429 without Retry-After', async () => {
    const error = await rejectWith(429, 'rate limit exceeded');

    expect(error.retryAfterSeconds).toBeUndefined();
    expect(toNLSearchErrorMessage(error)).toBe(
      'Too many searches. Try again in a moment.',
    );
  });

  it.each([401, 403])('shows the permission message on %i', async (code) => {
    const error = await rejectWith(code, 'permission denied');

    expect(error.kind).toBe('forbidden');
    expect(error.retryAfterSeconds).toBeUndefined();
    expect(toNLSearchErrorMessage(error)).toBe(
      'You do not have permission to search this namespace.',
    );
  });

  it.each([400, 502, 504])('keeps the server message on %i', async (code) => {
    const error = await rejectWith(code, `server message ${code}`);

    expect(error.kind).toBe('server');
    expect(toNLSearchErrorMessage(error)).toBe(`server message ${code}`);
  });

  it('uses the generic text when there is no message', async () => {
    const error = await rejectWith(502, '');

    expect(toNLSearchErrorMessage(error)).toBe(
      'Could not complete this search. Try again.',
    );
    expect(toNLSearchErrorMessage(new Error('x'))).toBe(
      'Could not complete this search. Try again.',
    );
  });
});

describe('parseRetryAfter', () => {
  it('parses seconds and HTTP dates', () => {
    const now = new Date('2026-09-20T15:00:00.000Z');

    expect(parseRetryAfter('30')).toBe(30);
    expect(parseRetryAfter('Sun, 20 Sep 2026 15:00:45 GMT', now)).toBe(45);
  });

  it('ignores empty, zero, past and invalid values', () => {
    const now = new Date('2026-09-20T15:00:00.000Z');

    expect(parseRetryAfter(null)).toBeUndefined();
    expect(parseRetryAfter('0')).toBeUndefined();
    expect(parseRetryAfter('soon')).toBeUndefined();
    expect(
      parseRetryAfter('Sun, 20 Sep 2026 14:00:00 GMT', now),
    ).toBeUndefined();
  });
});

describe('fetchKnownWorkflowTypes', () => {
  beforeEach(() => {
    vi.mocked(requestFromAPI).mockReset();
    clearKnownWorkflowTypesCache();
  });

  it('returns workflow types sorted by count and caches per namespace', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue({
      count: '12',
      groups: [
        { count: '2', groupValues: [payload('RefundWorkflow')] },
        { count: '10', groupValues: [payload('OrderWorkflow')] },
      ],
    });

    expect(await fetchKnownWorkflowTypes('default')).toEqual([
      'OrderWorkflow',
      'RefundWorkflow',
    ]);
    expect(await fetchKnownWorkflowTypes('default')).toEqual([
      'OrderWorkflow',
      'RefundWorkflow',
    ]);
    expect(requestFromAPI).toHaveBeenCalledTimes(1);

    const [route, init] = vi.mocked(requestFromAPI).mock.calls[0];
    expect(route).toMatch(/\/namespaces\/default\/workflow-count$/);
    expect(init?.params).toEqual({ query: 'GROUP BY WorkflowType' });

    await fetchKnownWorkflowTypes('other');
    expect(requestFromAPI).toHaveBeenCalledTimes(2);
  });

  it('shares one request between concurrent calls', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue({
      groups: [{ count: '1', groupValues: [payload('OrderWorkflow')] }],
    });

    const [first, second] = await Promise.all([
      fetchKnownWorkflowTypes('default'),
      fetchKnownWorkflowTypes('default'),
    ]);

    expect(first).toEqual(['OrderWorkflow']);
    expect(second).toEqual(['OrderWorkflow']);
    expect(requestFromAPI).toHaveBeenCalledTimes(1);
  });

  it('returns at most 100 workflow types', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue({
      groups: Array.from({ length: 150 }, (_, i) => ({
        count: String(i),
        groupValues: [payload(`Type${i}`)],
      })),
    });

    const workflowTypes = await fetchKnownWorkflowTypes('default');

    expect(workflowTypes).toHaveLength(100);
    expect(workflowTypes[0]).toBe('Type149');
  });

  it('caches the empty result after a 4xx so the request is not repeated', async () => {
    vi.mocked(requestFromAPI).mockRejectedValue({
      statusCode: 400,
      message: 'invalid query: GROUP BY WorkflowType',
    });

    expect(await fetchKnownWorkflowTypes('default')).toEqual([]);
    expect(await fetchKnownWorkflowTypes('default')).toEqual([]);
    expect(await fetchKnownWorkflowTypes('default')).toEqual([]);
    expect(requestFromAPI).toHaveBeenCalledTimes(1);

    await fetchKnownWorkflowTypes('other');
    expect(requestFromAPI).toHaveBeenCalledTimes(2);
  });

  it('tries again after a 5xx error', async () => {
    vi.mocked(requestFromAPI).mockRejectedValueOnce({ statusCode: 503 });
    vi.mocked(requestFromAPI).mockResolvedValue({
      groups: [{ count: '1', groupValues: [payload('OrderWorkflow')] }],
    });

    expect(await fetchKnownWorkflowTypes('default')).toEqual([]);
    expect(await fetchKnownWorkflowTypes('default')).toEqual(['OrderWorkflow']);
    expect(requestFromAPI).toHaveBeenCalledTimes(2);
  });

  it('sends only the contract fields even when the caller passes more', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue({ filters: [] });

    await translateNaturalLanguageSearch({
      ...options,
      memo: { note: 'SECRET-MEMO' },
      extra: 'SECRET-EXTRA',
    } as typeof options);

    const [, init] = vi.mocked(requestFromAPI).mock.calls[0];
    const body = String(init?.options?.body);
    expect(Object.keys(JSON.parse(body)).sort()).toEqual([
      'customAttributeNames',
      'knownWorkflowTypes',
      'namespace',
      'now',
      'searchAttributes',
      'text',
      'timezoneOffsetMinutes',
    ]);
    expect(body).not.toContain('SECRET');
  });

  it('returns an empty list and does not cache on error', async () => {
    vi.mocked(requestFromAPI).mockRejectedValueOnce(new Error('unsupported'));

    expect(await fetchKnownWorkflowTypes('default')).toEqual([]);

    vi.mocked(requestFromAPI).mockResolvedValue({ groups: [] });
    await fetchKnownWorkflowTypes('default');
    expect(requestFromAPI).toHaveBeenCalledTimes(2);
  });
});
