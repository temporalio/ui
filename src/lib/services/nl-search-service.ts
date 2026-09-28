import type {
  CountWorkflowExecutionsResponse,
  SearchAttributes,
} from '$lib/types/workflows';
import { parseRawPayloadToJSON } from '$lib/utilities/decode-payload';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import {
  postTypeSafeRequest,
  toTypeSafeErrorMessage,
} from './typesafe-request';

export const NL_SEARCH_MAX_TEXT_LENGTH = 500;
export const NL_SEARCH_MAX_SEARCH_ATTRIBUTES = 100;
export const NL_SEARCH_MAX_WORKFLOW_TYPES = 100;
export const NL_SEARCH_MAX_NAME_LENGTH = 200;
export const NL_SEARCH_LOW_CONFIDENCE_THRESHOLD = 0.6;

export type NLSearchConditional =
  | '='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'STARTS_WITH';

export type NLSearchFilter = {
  attribute: string;
  type: string;
  conditional: NLSearchConditional;
  value: string;
  confidence: number;
};

export type NLSearchRequest = {
  namespace: string;
  text: string;
  now: string;
  timezoneOffsetMinutes: number;
  searchAttributes: SearchAttributes;
  customAttributeNames: string[];
  knownWorkflowTypes: string[];
};

export const NL_SEARCH_TRACE_OUTCOMES = [
  'kept',
  'below_threshold',
  'no_match',
  'missing',
  'unused',
  'incomplete',
  'conflict',
  'unavailable',
] as const;

export type NLSearchTraceOutcome = (typeof NL_SEARCH_TRACE_OUTCOMES)[number];

export type NLSearchTraceStep = {
  id: string;
  question: string;
  subject: string | null;
  kind: 'noul' | 'choice';
  answer: string | null;
  score: number | null;
  threshold: number | null;
  probabilities: Record<string, number>;
  outcome: NLSearchTraceOutcome;
  filters: NLSearchFilter[];
};

export type NLSearchResponse = {
  filters: NLSearchFilter[];
  confidence: number;
  understood: boolean;
  trace: NLSearchTraceStep[];
};

export type TranslateNaturalLanguageSearchOptions = {
  namespace: string;
  text: string;
  searchAttributes: SearchAttributes;
  customAttributeNames: string[];
  knownWorkflowTypes: string[];
  request?: typeof fetch;
};

export {
  TypeSafeRequestError as NLSearchError,
  parseRetryAfter,
} from './typesafe-request';
export type { TypeSafeRequestErrorKind as NLSearchErrorKind } from './typesafe-request';

export const toNLSearchErrorMessage = (error: unknown): string =>
  toTypeSafeErrorMessage(error, {
    rateLimited: 'workflows.nl-search-rate-limited',
    rateLimitedRetry: 'workflows.nl-search-rate-limited-retry',
    forbidden: 'workflows.nl-search-forbidden',
    generic: 'workflows.nl-search-error',
  });

const isWithinNameLimit = (name: string): boolean =>
  name.length > 0 && name.length <= NL_SEARCH_MAX_NAME_LENGTH;

const PRIORITY_SYSTEM_ATTRIBUTES = [
  'ExecutionStatus',
  'WorkflowType',
  'WorkflowId',
  'RunId',
  'StartTime',
  'CloseTime',
  'ExecutionTime',
];

const limitSearchAttributes = (
  searchAttributes: SearchAttributes,
  customAttributeNames: string[],
): SearchAttributes => {
  const rank = (name: string): number => {
    if (PRIORITY_SYSTEM_ATTRIBUTES.includes(name)) return 0;
    if (customAttributeNames.includes(name)) return 1;
    return 2;
  };

  return Object.fromEntries(
    Object.entries(searchAttributes)
      .filter(([name]) => isWithinNameLimit(name))
      .map((entry, index) => ({ entry, index, rank: rank(entry[0]) }))
      .sort((a, b) => a.rank - b.rank || a.index - b.index)
      .slice(0, NL_SEARCH_MAX_SEARCH_ATTRIBUTES)
      .map(({ entry }): [string, string] => [entry[0], String(entry[1])]),
  ) as SearchAttributes;
};

export const toNLSearchRequest = (
  {
    namespace,
    text,
    searchAttributes,
    customAttributeNames,
    knownWorkflowTypes,
  }: Omit<TranslateNaturalLanguageSearchOptions, 'request'>,
  now = new Date(),
): NLSearchRequest => {
  const limitedAttributes = limitSearchAttributes(
    searchAttributes,
    customAttributeNames,
  );

  return {
    namespace: String(namespace ?? ''),
    text: String(text ?? '').trim(),
    now: now.toISOString(),
    timezoneOffsetMinutes: -now.getTimezoneOffset(),
    searchAttributes: limitedAttributes,
    customAttributeNames: customAttributeNames
      .filter((name) => name in limitedAttributes)
      .map(String),
    knownWorkflowTypes: knownWorkflowTypes
      .map(String)
      .filter(isWithinNameLimit)
      .slice(0, NL_SEARCH_MAX_WORKFLOW_TYPES),
  };
};

export const translateNaturalLanguageSearch = async ({
  request = fetch,
  namespace,
  text,
  searchAttributes,
  customAttributeNames,
  knownWorkflowTypes,
}: TranslateNaturalLanguageSearchOptions): Promise<NLSearchResponse> => {
  const route = routeForApi('nl-search');

  const response = await postTypeSafeRequest<Partial<NLSearchResponse>>(
    route,
    toNLSearchRequest({
      namespace,
      text,
      searchAttributes,
      customAttributeNames,
      knownWorkflowTypes,
    }),
    request,
  );

  const filters = Array.isArray(response?.filters) ? response.filters : [];

  return {
    filters,
    confidence:
      typeof response?.confidence === 'number' ? response.confidence : 0,
    understood: Boolean(response?.understood) && filters.length > 0,
    trace: toNLSearchTrace(response?.trace),
  };
};

const finiteOrNull = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const nonEmptyOrNull = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

const isTraceOutcome = (value: unknown): value is NLSearchTraceOutcome =>
  NL_SEARCH_TRACE_OUTCOMES.some((outcome) => outcome === value);

export const toNLSearchTrace = (value: unknown): NLSearchTraceStep[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((raw): NLSearchTraceStep[] => {
    const step = raw as Partial<Record<keyof NLSearchTraceStep, unknown>>;
    if (typeof step?.id !== 'string' || typeof step.question !== 'string') {
      return [];
    }
    if (!isTraceOutcome(step.outcome)) return [];

    const probabilities =
      step.probabilities && typeof step.probabilities === 'object'
        ? Object.fromEntries(
            Object.entries(step.probabilities).filter(
              (entry): entry is [string, number] =>
                finiteOrNull(entry[1]) !== null,
            ),
          )
        : {};

    return [
      {
        id: step.id,
        question: step.question,
        subject: nonEmptyOrNull(step.subject),
        kind: step.kind === 'noul' ? 'noul' : 'choice',
        answer: nonEmptyOrNull(step.answer),
        score: finiteOrNull(step.score),
        threshold: finiteOrNull(step.threshold),
        probabilities,
        outcome: step.outcome,
        filters: Array.isArray(step.filters)
          ? (step.filters as NLSearchFilter[])
          : [],
      },
    ];
  });
};

const knownWorkflowTypesCache = new Map<string, string[]>();
const knownWorkflowTypesRequests = new Map<string, Promise<string[]>>();

export const clearKnownWorkflowTypesCache = (): void => {
  knownWorkflowTypesCache.clear();
  knownWorkflowTypesRequests.clear();
};

export const fetchKnownWorkflowTypes = (
  namespace: string,
  request = fetch,
): Promise<string[]> => {
  const cached = knownWorkflowTypesCache.get(namespace);
  if (cached) return Promise.resolve(cached);

  const pending = knownWorkflowTypesRequests.get(namespace);
  if (pending) return pending;

  const next = requestKnownWorkflowTypes(namespace, request).finally(() => {
    knownWorkflowTypesRequests.delete(namespace);
  });
  knownWorkflowTypesRequests.set(namespace, next);
  return next;
};

const requestKnownWorkflowTypes = async (
  namespace: string,
  request: typeof fetch,
): Promise<string[]> => {
  try {
    const route = routeForApi('workflows.count', { namespace });
    const { groups = [] } =
      (await requestFromAPI<CountWorkflowExecutionsResponse>(route, {
        params: { query: 'GROUP BY WorkflowType' },
        notifyOnError: false,
        request,
      })) ?? {};

    const workflowTypes = groups
      .map((group) => ({
        name: parseRawPayloadToJSON(group?.groupValues?.[0]) as unknown,
        count: parseInt(group?.count ?? '0') || 0,
      }))
      .filter(
        (group): group is { name: string; count: number } =>
          typeof group.name === 'string' && isWithinNameLimit(group.name),
      )
      .sort((a, b) => b.count - a.count)
      .slice(0, NL_SEARCH_MAX_WORKFLOW_TYPES)
      .map(({ name }) => name);

    knownWorkflowTypesCache.set(namespace, workflowTypes);
    return workflowTypes;
  } catch (error: unknown) {
    // A 4xx means this server cannot group by WorkflowType (standard
    // visibility only groups by ExecutionStatus), so the types come from the
    // recent workflows instead. A network or 5xx error can be temporary and
    // is not cached.
    if (isClientError(error)) {
      return requestRecentWorkflowTypes(namespace, request);
    }
    return [];
  }
};

const RECENT_WORKFLOWS_PAGE_SIZE = 200;

const isClientError = (error: unknown): boolean => {
  const statusCode = Number((error as { statusCode?: number })?.statusCode);
  return statusCode >= 400 && statusCode < 500;
};

type RecentWorkflowsResponse = {
  executions?: { type?: { name?: string } }[];
};

const requestRecentWorkflowTypes = async (
  namespace: string,
  request: typeof fetch,
): Promise<string[]> => {
  try {
    const route = routeForApi('workflows', { namespace });
    const { executions = [] } =
      (await requestFromAPI<RecentWorkflowsResponse>(route, {
        params: { pageSize: String(RECENT_WORKFLOWS_PAGE_SIZE) },
        notifyOnError: false,
        request,
      })) ?? {};

    const counts = new Map<string, number>();
    for (const execution of executions) {
      const name = execution?.type?.name;
      if (typeof name === 'string' && isWithinNameLimit(name)) {
        counts.set(name, (counts.get(name) ?? 0) + 1);
      }
    }

    const workflowTypes = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, NL_SEARCH_MAX_WORKFLOW_TYPES)
      .map(([name]) => name);

    knownWorkflowTypesCache.set(namespace, workflowTypes);
    return workflowTypes;
  } catch (error: unknown) {
    if (isClientError(error)) knownWorkflowTypesCache.set(namespace, []);
    return [];
  }
};
