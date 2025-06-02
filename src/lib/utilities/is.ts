import { z } from 'zod';

import type { EventSortOrder } from '$lib/stores/event-view';
import type { WorkflowExecutionStatus } from '$lib/types';
import type { WorkflowStatus } from '$lib/types/workflows';

/** Space character type */
type Space = ' ';
/** Quote character type (single or double) */
type Quote = "'" | '"';
/** Backtick character type */
type Backtick = '`';
/** Operator type from the operators schema */
type Operator = z.infer<typeof operatorsSchema>;
/** Parenthesis type (open or close) */
type Parenthesis = (typeof parenthesis)[number];
/** End parenthesis character type */
type EndParenthesis = ')';
/** Join operator type (and, or) */
type Join = (typeof joins)[number];
/** Conditional operator type */
type Conditional = (typeof conditionals)[number];

/**
 * Schema for validating workflow execution status
 */
export const executionStatusSchema = z.enum([
  'Running',
  'TimedOut',
  'Completed',
  'Failed',
  'ContinuedAsNew',
  'Canceled',
  'Terminated',
]) satisfies z.ZodType<WorkflowStatus>;

/**
 * Schema for validating operators
 */
const operatorsSchema = z.enum([
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
]);

/**
 * Conditional operators array
 */
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
] as const;

/**
 * Join operators array
 */
const joins = ['and', 'or'] as const;

/**
 * Parenthesis characters array
 */
const parenthesis = ['(', ')'] as const;

/**
 * Generic type guard for primitive types
 * @param value - The value to check
 * @param typeCheck - Function that performs the type checking
 * @returns Boolean indicating if the value matches the type check
 */
function isPrimitive<T>(
  value: unknown,
  typeCheck: (val: unknown) => boolean,
): value is T {
  return typeCheck(value);
}

/**
 * Generic string literal type guard
 * @param value - The value to check
 * @param literals - Array of string literals to match against
 * @returns Boolean indicating if the value is one of the literals
 */
function isStringLiteral<T extends string>(
  value: unknown,
  literals: readonly T[],
): value is T {
  return typeof value === 'string' && literals.includes(value as T);
}

/**
 * Generic function for case-insensitive string matching against an array
 * @param value - The value to check
 * @param array - Array of strings to match against (case insensitive)
 * @returns Boolean indicating if the value is in the array (ignoring case)
 */
function isStringInArray<T extends string>(
  value: unknown,
  array: readonly T[],
): value is T {
  if (typeof value !== 'string') return false;
  const lowerValue = value.toLowerCase();
  return array.some((item) => item.toLowerCase() === lowerValue);
}

/**
 * Helper function to create string equality checkers
 * @param targetString - The string to compare against
 * @returns A function that checks if a value equals the target string (case insensitive)
 */
function createStringEqualityCheck(targetString: string) {
  return (x: unknown): boolean => {
    if (typeof x !== 'string') return false;
    return x.toLowerCase() === targetString.toLowerCase();
  };
}

/**
 * Checks if the value is a string
 * @param x - The value to check
 * @returns Boolean indicating if the value is a string
 */
export const isString = (x: unknown): x is string =>
  isPrimitive<string>(x, (val) => typeof val === 'string');

/**
 * Checks if the value is a number
 * @param x - The value to check
 * @returns Boolean indicating if the value is a number
 */
export const isNumber = (x: unknown): x is number =>
  isPrimitive<number>(x, (val) => typeof val === 'number');

/**
 * Checks if the value is null
 * @param x - The value to check
 * @returns Boolean indicating if the value is null
 */
export const isNull = (x: unknown): x is null =>
  isPrimitive<null>(x, (val) => val === null);

/**
 * Checks if the value is an object
 * @param x - The value to check
 * @returns Boolean indicating if the value is an object
 */
export const isObject = (x: unknown): x is Record<string, unknown> =>
  z.record(z.unknown()).safeParse(x).success;

/**
 * Checks if the value is a valid workflow execution status
 * @param x - The value to check
 * @returns Boolean indicating if the value is a valid workflow execution status
 */
export const isExecutionStatus = (x: unknown): x is WorkflowExecutionStatus =>
  executionStatusSchema.safeParse(x).success;

/**
 * Checks if the value is a valid operator
 * @param x - The value to check
 * @returns Boolean indicating if the value is a valid operator
 */
export const isOperator = (x: unknown): x is Operator =>
  operatorsSchema.safeParse(x).success;

/**
 * Checks if the value is a space character
 * @param x - The value to check
 * @returns Boolean indicating if the value is a space
 */
export const isSpace = (x: unknown): x is Space => isStringLiteral(x, [' ']);

/**
 * Checks if the value is a quote character (single or double)
 * @param x - The value to check
 * @returns Boolean indicating if the value is a quote
 */
export const isQuote = (x: unknown): x is Quote =>
  isStringLiteral(x, ["'", '"']);

/**
 * Checks if the value is a backtick character
 * @param x - The value to check
 * @returns Boolean indicating if the value is a backtick
 */
export const isBacktick = (x: unknown): x is Backtick =>
  isStringLiteral(x, ['`']);

/**
 * Checks if the value is a conditional operator
 * @param x - The value to check
 * @returns Boolean indicating if the value is a conditional operator
 */
export const isConditional = (x: unknown): x is Conditional =>
  isStringInArray(x, conditionals);

/**
 * Checks if the value is a parenthesis character
 * @param x - The value to check
 * @returns Boolean indicating if the value is a parenthesis
 */
export const isParenthesis = (x: unknown): x is Parenthesis =>
  isStringInArray(x, parenthesis);

/**
 * Checks if the value is a closing parenthesis
 * @param x - The value to check
 * @returns Boolean indicating if the value is a closing parenthesis
 */
export const isEndParenthesis = (x: unknown): x is EndParenthesis =>
  createStringEqualityCheck(')')(x);

/**
 * Checks if the value is a join operator (and, or)
 * @param x - The value to check
 * @returns Boolean indicating if the value is a join operator
 */
export const isJoin = (x: unknown): x is Join => isStringInArray(x, joins);

/**
 * Checks if the value is the "between" operator
 * @param x - The value to check
 * @returns Boolean indicating if the value is "between"
 */
export const isBetween = (x: unknown): boolean =>
  createStringEqualityCheck('between')(x);

/**
 * Checks if the value is the "starts_with" operator
 * @param x - The value to check
 * @returns Boolean indicating if the value is "starts_with"
 */
export const isStartsWith = (x: unknown): boolean =>
  createStringEqualityCheck('starts_with')(x);

/**
 * Checks if the value is the "in" conditional operator
 * @param x - The value to check
 * @returns Boolean indicating if the value is "in"
 */
export const isInConditional = (x: unknown): boolean =>
  createStringEqualityCheck('in')(x);

/**
 * Checks if the value is a null conditional operator (is, is not)
 * @param x - The value to check
 * @returns Boolean indicating if the value is a null conditional
 */
export const isNullConditional = (x: unknown): boolean => {
  if (typeof x !== 'string') return false;
  const lowerValue = x.toLowerCase();
  return lowerValue === 'is' || lowerValue === 'is not';
};

/**
 * Checks if the value is a valid sort order
 * @param sortOrder - The value to check
 * @returns Boolean indicating if the value is a valid sort order
 */
export const isSortOrder = (
  sortOrder: string | EventSortOrder,
): sortOrder is EventSortOrder => {
  return sortOrder === 'ascending' || sortOrder === 'descending';
};

/**
 * Checks if the value is an Error object
 * @param e - The value to check
 * @returns Boolean indicating if the value is an Error object
 */
export const isError = (e: unknown): e is Error => {
  if (!e || typeof e !== 'object') return false;

  // Check if it has both 'name' and 'message' properties
  const obj = e as Record<string, unknown>;
  return (
    typeof obj.name === 'string' &&
    typeof obj.message === 'string' &&
    obj.name !== '' &&
    obj.message !== ''
  );
};

/**
 * Checks if the value is a function
 * @param fn - The value to check
 * @returns Boolean indicating if the value is a function
 */
export const isFunction = <T>(fn: unknown): fn is T => {
  return z.function().safeParse(fn).success;
};
