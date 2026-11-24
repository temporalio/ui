import type { BadgeColorScheme } from '$lib/io/badge/recipe';
import type { Callback } from '$lib/types/nexus';
import { toEventLinkView } from '$lib/utilities/event-link';
import {
  CALLBACK_DELIVERY_STATES,
  callbackTargetLink,
} from '$lib/utilities/nexus-operation-callbacks';

export type CallbackKeywordField = 'taskQueue' | 'service' | 'operation';

export type CallbackChoiceField = 'state' | 'targetType';

export type CallbackFilterField = CallbackKeywordField | CallbackChoiceField;

export type CallbackKeywordOperator = '=' | '!=' | 'STARTS_WITH';

export type CallbackKeywordFilter = {
  operator: CallbackKeywordOperator;
  value: string;
};

export type CallbackTargetType = 'workflow' | 'activity' | 'batchJob';

export type CallbackChoiceOption = {
  value: string;
  label: string;
  colorScheme?: BadgeColorScheme;
};

export type CallbackFilters = Record<
  CallbackKeywordField,
  CallbackKeywordFilter | null
> &
  Record<CallbackChoiceField, string[]>;

export const CALLBACK_FILTER_FIELDS: CallbackFilterField[] = [
  'state',
  'taskQueue',
  'service',
  'operation',
  'targetType',
];

export const CALLBACK_KEYWORD_OPERATORS: CallbackKeywordOperator[] = [
  '=',
  '!=',
  'STARTS_WITH',
];

export const CALLBACK_TARGET_TYPES: CallbackTargetType[] = [
  'workflow',
  'activity',
  'batchJob',
];

export const CALLBACK_FILTER_PARAMETERS: Record<CallbackFilterField, string> = {
  state: 'callbacks-state',
  taskQueue: 'callbacks-task-queue',
  service: 'callbacks-service',
  operation: 'callbacks-operation',
  targetType: 'callbacks-target-type',
};

export const CALLBACK_PAGE_PARAMETER = 'callbacks-page';

export const EMPTY_CALLBACK_FILTERS: CallbackFilters = {
  state: [],
  taskQueue: null,
  service: null,
  operation: null,
  targetType: [],
};

const CHOICE_VALUES: Record<CallbackChoiceField, string[]> = {
  state: CALLBACK_DELIVERY_STATES,
  targetType: CALLBACK_TARGET_TYPES,
};

const OPERATOR_PARAMETER_VALUES: Record<CallbackKeywordOperator, string> = {
  '=': '',
  '!=': 'not-equal',
  STARTS_WITH: 'starts-with',
};

const VALUE_SEPARATOR = ',';

export const isCallbackKeywordField = (
  field: CallbackFilterField,
): field is CallbackKeywordField =>
  field === 'taskQueue' || field === 'service' || field === 'operation';

export const callbackOperatorParameter = (field: CallbackKeywordField) =>
  `${CALLBACK_FILTER_PARAMETERS[field]}-operator`;

const parseOperator = (param: string | null): CallbackKeywordOperator =>
  CALLBACK_KEYWORD_OPERATORS.find(
    (operator) => param && OPERATOR_PARAMETER_VALUES[operator] === param,
  ) ?? '=';

const parseKeyword = (
  url: URL,
  field: CallbackKeywordField,
): CallbackKeywordFilter | null => {
  const value = url.searchParams.get(CALLBACK_FILTER_PARAMETERS[field]);
  if (!value) return null;
  return {
    operator: parseOperator(
      url.searchParams.get(callbackOperatorParameter(field)),
    ),
    value,
  };
};

const parseChoices = (url: URL, field: CallbackChoiceField): string[] => {
  const param = url.searchParams.get(CALLBACK_FILTER_PARAMETERS[field]);
  if (!param) return [];
  return param
    .split(VALUE_SEPARATOR)
    .filter((value) => CHOICE_VALUES[field].includes(value));
};

export const parseCallbackFilters = (url: URL): CallbackFilters => ({
  state: parseChoices(url, 'state'),
  taskQueue: parseKeyword(url, 'taskQueue'),
  service: parseKeyword(url, 'service'),
  operation: parseKeyword(url, 'operation'),
  targetType: parseChoices(url, 'targetType'),
});

export const isCallbackFilterActive = (
  filters: CallbackFilters,
  field: CallbackFilterField,
): boolean =>
  isCallbackKeywordField(field)
    ? filters[field] !== null
    : filters[field].length > 0;

export const appliedCallbackFilterCount = (filters: CallbackFilters): number =>
  CALLBACK_FILTER_FIELDS.filter((field) =>
    isCallbackFilterActive(filters, field),
  ).length;

export const callbackKeywordValue = (
  callback: Callback,
  field: CallbackKeywordField,
): string => {
  const handler = callback.callback?.nexusHandler;
  switch (field) {
    case 'taskQueue':
      return handler?.taskQueueName ?? '';
    case 'service':
      return handler?.service ?? '';
    case 'operation':
      return handler?.operation ?? '';
  }
};

export const callbackTargetType = (
  callback: Callback,
): CallbackTargetType | undefined => {
  const link = callbackTargetLink(callback);
  if (!link) return undefined;

  switch (toEventLinkView(link).variant) {
    case 'workflowEvent':
    case 'workflow':
      return 'workflow';
    case 'activity':
      return 'activity';
    case 'batchJob':
      return 'batchJob';
    default:
      return undefined;
  }
};

const callbackChoiceValue = (
  callback: Callback,
  field: CallbackChoiceField,
): string | undefined =>
  field === 'state' ? String(callback.state) : callbackTargetType(callback);

export const matchesCallbackKeyword = (
  value: string,
  { operator, value: expected }: CallbackKeywordFilter,
): boolean => {
  switch (operator) {
    case '=':
      return value === expected;
    case '!=':
      return value !== expected;
    case 'STARTS_WITH':
      return value.startsWith(expected);
  }
};

const matchesCallbackFilter = (
  callback: Callback,
  filters: CallbackFilters,
  field: CallbackFilterField,
): boolean => {
  if (isCallbackKeywordField(field)) {
    const filter = filters[field];
    return (
      !filter ||
      matchesCallbackKeyword(callbackKeywordValue(callback, field), filter)
    );
  }

  const selected = filters[field];
  if (!selected.length) return true;
  const value = callbackChoiceValue(callback, field);
  return value !== undefined && selected.includes(value);
};

export const filterCallbacks = (
  callbacks: Callback[],
  filters: CallbackFilters,
): Callback[] => {
  const activeFields = CALLBACK_FILTER_FIELDS.filter((field) =>
    isCallbackFilterActive(filters, field),
  );
  if (!activeFields.length) return callbacks;

  return callbacks.filter((callback) =>
    activeFields.every((field) =>
      matchesCallbackFilter(callback, filters, field),
    ),
  );
};

export const callbackFilterUpdate = (filters: CallbackFilters) => ({
  parameters: CALLBACK_FILTER_FIELDS.flatMap((field) => {
    if (!isCallbackKeywordField(field)) {
      return [
        {
          parameter: CALLBACK_FILTER_PARAMETERS[field],
          value: filters[field].join(VALUE_SEPARATOR),
        },
      ];
    }

    const filter = filters[field];
    return [
      {
        parameter: CALLBACK_FILTER_PARAMETERS[field],
        value: filter?.value ?? '',
      },
      {
        parameter: callbackOperatorParameter(field),
        value: filter ? OPERATOR_PARAMETER_VALUES[filter.operator] : '',
      },
    ];
  }),
  clearParameters: [CALLBACK_PAGE_PARAMETER],
});
