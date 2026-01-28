import type { EventSortOrder } from '$lib/stores/event-view';
import type { WorkflowExecutionStatus } from '$lib/types';
import type { WorkflowStatus } from '$lib/types/workflows';

import { has } from './has';

type Space = ' ';
type Quote = "'" | '"';
type Backtick = '`';
type Operator = (typeof operators)[number];
type Conditional = (typeof conditionals)[number];
type Parenthesis = (typeof parenthesis)[number];
type EndParenthesis = ')';
type Join = (typeof joins)[number];

const executionStatuses: readonly WorkflowStatus[] = [
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
  '===',
  '!==',
  '>=',
  '<=',
  '==',
  '!=',
  '=',
  '>',
  '<',
  '!',
  'and',
  'or',
  'between',
  'order by',
  'in',
  '(',
  ')',
  'starts_with',
] as const;

const conditionals = [
  '===',
  '!==',
  '>=',
  '<=',
  '==',
  '!=',
  '=',
  '>',
  '<',
  '!',
  'starts_with',
  'is',
  'is not',
  'in',
  'not in',
] as const;

const joins = ['and', 'or'] as const;

const parenthesis = ['(', ')'] as const;

export const isString = (x: unknown): x is string => typeof x === 'string';

export const isNull = (x: unknown): x is null => x === null;

export const isObject = (x: unknown): x is Record<string, unknown> => {
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

export const isBacktick = (x: unknown): x is Backtick => {
  return x === '`';
};

export const isOperator = (x: unknown): x is Operator => {
  if (!isString(x)) return false;
  x = x.toLocaleLowerCase();

  for (const operator of operators) {
    if (x === operator) return true;
  }

  return false;
};

export const isConditional = (x: unknown): x is Conditional => {
  if (!isString(x)) return false;
  x = x.toLocaleLowerCase();

  for (const condition of conditionals) {
    if (x === condition) return true;
  }

  return false;
};

export const isParenthesis = (x: unknown): x is Parenthesis => {
  if (!isString(x)) return false;
  x = x.toLocaleLowerCase();

  for (const paren of parenthesis) {
    if (x === paren) return true;
  }

  return false;
};

export const isEndParenthesis = (x: unknown): x is EndParenthesis => {
  if (!isString(x)) return false;
  return x.toLocaleLowerCase() === ')';
};

export const isJoin = (x: unknown): x is Join => {
  if (!isString(x)) return false;
  x = x.toLocaleLowerCase();

  for (const join of joins) {
    if (x === join) return true;
  }

  return false;
};

export const isBetween = (x: unknown) => {
  if (!isString(x)) return false;
  x = x.toLocaleLowerCase();

  return x === 'between';
};

export const isNullConditional = (x: unknown) => {
  if (!isString(x)) return false;
  x = x.toLocaleLowerCase();

  return x === 'is' || x === 'is not';
};

export const isSortOrder = (
  sortOrder: string | EventSortOrder,
): sortOrder is EventSortOrder => {
  if (sortOrder === 'ascending') return true;
  if (sortOrder === 'descending') return true;
  return false;
};

export const isError = (e: unknown): e is Error => {
  return has(e, 'name', 'message');
};

export const isStartsWith = (x: unknown) => {
  if (!isString(x)) return false;
  return x.toLocaleLowerCase() === 'starts_with';
};

export const isInConditional = (x: unknown) => {
  if (!isString(x)) return false;

  return ['in', 'not in'].includes(x.toLocaleLowerCase());
};
