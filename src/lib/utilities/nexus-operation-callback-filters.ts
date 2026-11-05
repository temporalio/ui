import type { Callback } from '$lib/types/nexus';

export type CallbackFilterField = 'endpoint' | 'service' | 'operation';

export type CallbackFilters = Record<CallbackFilterField, string[]>;

export type CallbackFilterOption = { value: string; count: number };

export const CALLBACK_FILTER_FIELDS: CallbackFilterField[] = [
  'endpoint',
  'service',
  'operation',
];

export const CALLBACK_FILTER_PARAMETERS: Record<CallbackFilterField, string> = {
  endpoint: 'callbacks-endpoint',
  service: 'callbacks-service',
  operation: 'callbacks-operation',
};

export const CALLBACK_PAGE_PARAMETER = 'callbacks-page';

export const CALLBACK_FILTER_OPTION_LIMIT = 100;

const VALUE_SEPARATOR = ',';

const decodeValue = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const parseValues = (param: string | null): string[] =>
  param ? param.split(VALUE_SEPARATOR).map(decodeValue).filter(Boolean) : [];

const serializeValues = (values: string[]): string =>
  values.map((value) => encodeURIComponent(value)).join(VALUE_SEPARATOR);

export const callbackFilterValue = (
  callback: Callback,
  field: CallbackFilterField,
): string => {
  const handler = callback.callback?.nexusHandler;
  switch (field) {
    case 'endpoint':
      return handler?.taskQueueName ?? '';
    case 'service':
      return handler?.service ?? '';
    case 'operation':
      return handler?.operation ?? '';
  }
};

export const parseCallbackFilters = (url: URL): CallbackFilters => ({
  endpoint: parseValues(
    url.searchParams.get(CALLBACK_FILTER_PARAMETERS.endpoint),
  ),
  service: parseValues(
    url.searchParams.get(CALLBACK_FILTER_PARAMETERS.service),
  ),
  operation: parseValues(
    url.searchParams.get(CALLBACK_FILTER_PARAMETERS.operation),
  ),
});

export const appliedCallbackFilterCount = (filters: CallbackFilters): number =>
  CALLBACK_FILTER_FIELDS.reduce(
    (count, field) => count + filters[field].length,
    0,
  );

export const filterCallbacks = (
  callbacks: Callback[],
  filters: CallbackFilters,
): Callback[] => {
  const activeFields = CALLBACK_FILTER_FIELDS.filter(
    (field) => filters[field].length > 0,
  );
  if (!activeFields.length) return callbacks;

  return callbacks.filter((callback) =>
    activeFields.every((field) =>
      filters[field].includes(callbackFilterValue(callback, field)),
    ),
  );
};

export const callbackFilterOptions = (
  callbacks: Callback[],
): Record<CallbackFilterField, CallbackFilterOption[]> => {
  const counts = {
    endpoint: new Map<string, number>(),
    service: new Map<string, number>(),
    operation: new Map<string, number>(),
  };

  for (const callback of callbacks) {
    for (const field of CALLBACK_FILTER_FIELDS) {
      const value = callbackFilterValue(callback, field);
      if (value) counts[field].set(value, (counts[field].get(value) ?? 0) + 1);
    }
  }

  const toOptions = (values: Map<string, number>) =>
    [...values.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value));

  return {
    endpoint: toOptions(counts.endpoint),
    service: toOptions(counts.service),
    operation: toOptions(counts.operation),
  };
};

export const matchesCallbackFilterSearch = (
  value: string,
  search: string,
): boolean => {
  const query = search.trim().toLowerCase();
  return !query || value.toLowerCase().includes(query);
};

export const limitCallbackFilterOptions = (
  options: CallbackFilterOption[],
  selected: string[],
  limit = CALLBACK_FILTER_OPTION_LIMIT,
): CallbackFilterOption[] => {
  if (options.length <= limit) return options;

  const selectedOptions = options.filter(({ value }) =>
    selected.includes(value),
  );
  const unselected = options.filter(({ value }) => !selected.includes(value));
  return [
    ...selectedOptions,
    ...unselected.slice(0, Math.max(limit - selectedOptions.length, 0)),
  ];
};

export const callbackFilterUpdate = (filters: CallbackFilters) => ({
  parameters: CALLBACK_FILTER_FIELDS.map((field) => ({
    parameter: CALLBACK_FILTER_PARAMETERS[field],
    value: serializeValues(filters[field]),
  })),
  clearParameters: [CALLBACK_PAGE_PARAMETER],
});
