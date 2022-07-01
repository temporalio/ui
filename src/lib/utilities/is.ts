import type { EventSortOrder } from '$lib/stores/event-view';

type Space = ' ';
type Quote = "'" | '"';
type Operator = typeof operators[number];

const executionStatuses: Readonly<WorkflowStatus[]> = [
  'Running',
  'TimedOut',
  'Completed',
  'Failed',
  'Completed',
  'ContinuedAsNew',
  'Canceled',
  'Terminated',
];

const operators = [
  '=',
  '>',
  '<',
  '!',
  '>=',
  '<=',
  '==',
  '!=',
  '===',
  '!==',
] as const;

export const isString = (x: unknown): x is string => typeof x === 'string';

export const isNull = (x: unknown): x is null => x === null;

export const isObject = (x: unknown): x is { unknown: unknown } => {
  if (isNull(x)) return false;
  if (Array.isArray(x)) return false;
  if (typeof x === 'object') return true;
  return false;
};

export const isNumber = (x: unknown): x is number => {
  if (typeof x === 'number') return true;
  return false;
};

export const isExecutionStatus = (x: unknown): x is WorkflowExecutionStatus => {
  if (!isString(x)) return false;

  for (const status of executionStatuses) {
    if (x === status) return true;
  }

  return false;
};

export const isSpace = (x: unknown): x is Space => {
  return x === ' ';
};

export const isQuote = (x: unknown): x is Quote => {
  if (x === "'") return true;
  if (x === '"') return true;
  return false;
};

export const isOperator = (x: unknown): x is Operator => {
  if (!isString(x)) return false;

  for (const operator of operators) {
    if (x === operator) return true;
  }

  return false;
};

export const isSortOrder = (sortOrder: string): sortOrder is EventSortOrder => {
  if (sortOrder === 'ascending') return true;
  if (sortOrder === 'descending') return true;
  return false;
};
