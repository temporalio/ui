import { describe, expect, it } from 'vitest';

import {
  isBacktick,
  isBetween,
  isConditional,
  isEndParenthesis,
  isError,
  isExecutionStatus,
  isFunction,
  isInConditional,
  isJoin,
  isNull,
  isNullConditional,
  isNumber,
  isObject,
  isOperator,
  isParenthesis,
  isQuote,
  isSortOrder,
  isSpace,
  isStartsWith,
  isString,
} from './is';

describe('isString', () => {
  it('should return true if given a string', () => {
    expect(isString('string')).toBe(true);
  });

  it('should return false if given null', () => {
    expect(isString(null)).toBe(false);
  });

  it('should return false if given undefined', () => {
    expect(isString(undefined)).toBe(false);
  });

  it('should return false if given a number', () => {
    expect(isString(1)).toBe(false);
  });

  it('should return false if given an array', () => {
    expect(isString([])).toBe(false);
  });

  it('should return false if given an object', () => {
    expect(isString({})).toBe(false);
  });
});

describe('isNull', () => {
  it('should return true if given null', () => {
    expect(isNull(null)).toBe(true);
  });

  it('should return true if given a string', () => {
    expect(isNull('string')).toBe(false);
  });

  it('should return false if given undefined', () => {
    expect(isNull(undefined)).toBe(false);
  });

  it('should return false if given a number', () => {
    expect(isNull(1)).toBe(false);
  });

  it('should return false if given an array', () => {
    expect(isNull([])).toBe(false);
  });

  it('should return false if given an object', () => {
    expect(isNull({})).toBe(false);
  });
});

describe('isObject', () => {
  it('should return true if given an object', () => {
    expect(isObject({})).toBe(true);
  });

  it('should return true if given null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('should return true if given a string', () => {
    expect(isObject('string')).toBe(false);
  });

  it('should return false if given undefined', () => {
    expect(isObject(undefined)).toBe(false);
  });

  it('should return false if given a number', () => {
    expect(isObject(1)).toBe(false);
  });

  it('should return false if given an array', () => {
    expect(isObject([])).toBe(false);
  });
});

describe('isNumber', () => {
  it('should return true if given a number', () => {
    expect(isNumber(1)).toBe(true);
  });

  it('should return true if given zero', () => {
    expect(isNumber(0)).toBe(true);
  });

  it('should return true if given a negative number', () => {
    expect(isNumber(-1)).toBe(true);
  });

  it('should return false if given NaN', () => {
    expect(isNumber(NaN)).toBe(true);
  });

  it('should return false if given an object', () => {
    expect(isNumber({})).toBe(false);
  });

  it('should return true if given null', () => {
    expect(isNumber(null)).toBe(false);
  });

  it('should return true if given a string', () => {
    expect(isNumber('string')).toBe(false);
  });

  it('should return false if given undefined', () => {
    expect(isNumber(undefined)).toBe(false);
  });

  it('should return false if given an array', () => {
    expect(isNumber([])).toBe(false);
  });
});

describe('isOperator', () => {
  it('should return true for "="', () => {
    expect(isOperator('=')).toBe(true);
  });

  it('should return true for ">"', () => {
    expect(isOperator('>')).toBe(true);
  });

  it('should return true for "<"', () => {
    expect(isOperator('<')).toBe(true);
  });

  it('should return true for "!"', () => {
    expect(isOperator('!')).toBe(true);
  });

  it('should return true for ">="', () => {
    expect(isOperator('>=')).toBe(true);
  });

  it('should return true for "<="', () => {
    expect(isOperator('<=')).toBe(true);
  });

  it('should return true for "=="', () => {
    expect(isOperator('==')).toBe(true);
  });

  it('should return true for "!="', () => {
    expect(isOperator('!=')).toBe(true);
  });

  it('should return true for "==="', () => {
    expect(isOperator('===')).toBe(true);
  });

  it('should return true for "!=="', () => {
    expect(isOperator('!==')).toBe(true);
  });

  it('should return true for "and"', () => {
    expect(isOperator('and')).toBe(true);
  });

  it('should return true for "or"', () => {
    expect(isOperator('or')).toBe(true);
  });

  it('should return true for "between"', () => {
    expect(isOperator('between')).toBe(true);
  });

  it('should return true for "order by"', () => {
    expect(isOperator('order by')).toBe(true);
  });

  it('should return true for "in"', () => {
    expect(isOperator('in')).toBe(true);
  });

  it('should return true for "("', () => {
    expect(isOperator('(')).toBe(true);
  });

  it('should return true for ")"', () => {
    expect(isOperator(')')).toBe(true);
  });

  it('should return false for "bogus"', () => {
    expect(isOperator('bogus')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isOperator(null as unknown as string)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isOperator(undefined as unknown as string)).toBe(false);
  });

  it('should return false for {}', () => {
    expect(isOperator({} as unknown as string)).toBe(false);
  });
});

describe('isSortOrder', () => {
  it('should return true for "ascending"', () => {
    expect(isSortOrder('ascending')).toBe(true);
  });

  it('should return true for "descending"', () => {
    expect(isSortOrder('descending')).toBe(true);
  });

  it('should return false for "a random string"', () => {
    expect(isSortOrder('a random string')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isSortOrder(null as unknown as string)).toBe(false);
  });
});

describe('isExecutionStatus', () => {
  it('should return true for "Running"', () => {
    expect(isExecutionStatus('Running')).toBe(true);
  });

  it('should return true for "TimedOut"', () => {
    expect(isExecutionStatus('TimedOut')).toBe(true);
  });

  it('should return true for "Completed"', () => {
    expect(isExecutionStatus('Completed')).toBe(true);
  });

  it('should return true for "Failed"', () => {
    expect(isExecutionStatus('Failed')).toBe(true);
  });

  it('should return true for "Completed"', () => {
    expect(isExecutionStatus('Completed')).toBe(true);
  });

  it('should return true for "ContinuedAsNew"', () => {
    expect(isExecutionStatus('ContinuedAsNew')).toBe(true);
  });

  it('should return true for "Canceled"', () => {
    expect(isExecutionStatus('Canceled')).toBe(true);
  });

  it('should return true for "Terminated"', () => {
    expect(isExecutionStatus('Terminated')).toBe(true);
  });

  it('should return false for "Invalid"', () => {
    expect(isExecutionStatus('Invalid')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isExecutionStatus(null as unknown as string)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isExecutionStatus(undefined as unknown as string)).toBe(false);
  });

  it('should return false for {}', () => {
    expect(isExecutionStatus({})).toBe(false);
  });

  it('should return false for []', () => {
    expect(isExecutionStatus([])).toBe(false);
  });

  it('should return false for a boolean', () => {
    expect(isExecutionStatus(true)).toBe(false);
  });
});

describe('isSpace', () => {
  it('should return true for a space', () => {
    expect(isSpace(' ')).toBe(true);
  });

  it('should return false for a letter', () => {
    expect(isSpace('a')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isSpace(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isSpace(undefined)).toBe(false);
  });

  it('should return false for []', () => {
    expect(isSpace([])).toBe(false);
  });

  it('should return false for {}', () => {
    expect(isSpace({})).toBe(false);
  });
});

describe('isQuote', () => {
  it('should return true for a single quote', () => {
    expect(isQuote("'")).toBe(true);
  });

  it('should return true for a double quote', () => {
    expect(isQuote('"')).toBe(true);
  });

  it('should return false for a letter', () => {
    expect(isQuote('a')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isQuote(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isQuote(undefined)).toBe(false);
  });
});

describe('isBacktick', () => {
  it('should return true for a backtick', () => {
    expect(isBacktick('`')).toBe(true);
  });

  it('should return false for a letter', () => {
    expect(isBacktick('a')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isBacktick(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isBacktick(undefined)).toBe(false);
  });

  it('should return false for an object', () => {
    expect(isBacktick({})).toBe(false);
  });
});

describe('isConditional', () => {
  it('should return true for "==="', () => {
    expect(isConditional('===')).toBe(true);
  });

  it('should return true for "!=="', () => {
    expect(isConditional('!==')).toBe(true);
  });

  it('should return true for ">="', () => {
    expect(isConditional('>=')).toBe(true);
  });

  it('should return true for "<="', () => {
    expect(isConditional('<=')).toBe(true);
  });

  it('should return true for "=="', () => {
    expect(isConditional('==')).toBe(true);
  });

  it('should return true for "!="', () => {
    expect(isConditional('!=')).toBe(true);
  });

  it('should return true for "="', () => {
    expect(isConditional('=')).toBe(true);
  });

  it('should return true for ">"', () => {
    expect(isConditional('>')).toBe(true);
  });

  it('should return true for "<"', () => {
    expect(isConditional('<')).toBe(true);
  });

  it('should return true for "!"', () => {
    expect(isConditional('!')).toBe(true);
  });

  it('should return true for "starts_with"', () => {
    expect(isConditional('starts_with')).toBe(true);
  });

  it('should return true for "is"', () => {
    expect(isConditional('is')).toBe(true);
  });

  it('should return true for "is not"', () => {
    expect(isConditional('is not')).toBe(true);
  });

  it('should return true for "in" (case insensitive)', () => {
    expect(isConditional('in')).toBe(true);
    expect(isConditional('IN')).toBe(true);
  });

  it('should return false for a non-conditional string', () => {
    expect(isConditional('not-a-conditional')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isConditional(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isConditional(undefined)).toBe(false);
  });

  it('should return false for an object', () => {
    expect(isConditional({})).toBe(false);
  });
});

describe('isParenthesis', () => {
  it('should return true for "("', () => {
    expect(isParenthesis('(')).toBe(true);
  });

  it('should return true for ")"', () => {
    expect(isParenthesis(')')).toBe(true);
  });

  it('should return true for parentheses with case insensitivity', () => {
    // There's no uppercase for parentheses, but testing the mechanism
    expect(isParenthesis('(')).toBe(true);
  });

  it('should return false for other characters', () => {
    expect(isParenthesis('{')).toBe(false);
    expect(isParenthesis('}')).toBe(false);
    expect(isParenthesis('[')).toBe(false);
    expect(isParenthesis(']')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isParenthesis(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isParenthesis(undefined)).toBe(false);
  });

  it('should return false for an object', () => {
    expect(isParenthesis({})).toBe(false);
  });
});

describe('isEndParenthesis', () => {
  it('should return true for ")"', () => {
    expect(isEndParenthesis(')')).toBe(true);
  });

  it('should return true for ")" with case insensitivity', () => {
    // There's no uppercase for parentheses, but testing the mechanism
    expect(isEndParenthesis(')')).toBe(true);
  });

  it('should return false for "("', () => {
    expect(isEndParenthesis('(')).toBe(false);
  });

  it('should return false for other characters', () => {
    expect(isEndParenthesis('}')).toBe(false);
    expect(isEndParenthesis(']')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isEndParenthesis(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isEndParenthesis(undefined)).toBe(false);
  });

  it('should return false for an object', () => {
    expect(isEndParenthesis({})).toBe(false);
  });
});

describe('isJoin', () => {
  it('should return true for "and"', () => {
    expect(isJoin('and')).toBe(true);
  });

  it('should return true for "or"', () => {
    expect(isJoin('or')).toBe(true);
  });

  it('should return true for case insensitive joins', () => {
    expect(isJoin('AND')).toBe(true);
    expect(isJoin('OR')).toBe(true);
  });

  it('should return false for other operators', () => {
    expect(isJoin('not')).toBe(false);
    expect(isJoin('+')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isJoin(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isJoin(undefined)).toBe(false);
  });

  it('should return false for an object', () => {
    expect(isJoin({})).toBe(false);
  });
});

describe('isBetween', () => {
  it('should return true for "between"', () => {
    expect(isBetween('between')).toBe(true);
  });

  it('should return true for case insensitive "between"', () => {
    expect(isBetween('BETWEEN')).toBe(true);
    expect(isBetween('Between')).toBe(true);
  });

  it('should return false for other strings', () => {
    expect(isBetween('not-between')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isBetween(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isBetween(undefined)).toBe(false);
  });

  it('should return false for an object', () => {
    expect(isBetween({})).toBe(false);
  });
});

describe('isStartsWith', () => {
  it('should return true for "starts_with"', () => {
    expect(isStartsWith('starts_with')).toBe(true);
  });

  it('should return true for case insensitive "starts_with"', () => {
    expect(isStartsWith('STARTS_WITH')).toBe(true);
    expect(isStartsWith('Starts_With')).toBe(true);
  });

  it('should return false for other strings', () => {
    expect(isStartsWith('startswith')).toBe(false);
    expect(isStartsWith('ends_with')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isStartsWith(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isStartsWith(undefined)).toBe(false);
  });

  it('should return false for an object', () => {
    expect(isStartsWith({})).toBe(false);
  });
});

describe('isInConditional', () => {
  it('should return true for "in"', () => {
    expect(isInConditional('in')).toBe(true);
  });

  it('should return true for case insensitive "in"', () => {
    expect(isInConditional('IN')).toBe(true);
    expect(isInConditional('In')).toBe(true);
  });

  it('should return false for other strings', () => {
    expect(isInConditional('not-in')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isInConditional(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isInConditional(undefined)).toBe(false);
  });

  it('should return false for an object', () => {
    expect(isInConditional({})).toBe(false);
  });
});

describe('isNullConditional', () => {
  it('should return true for is', () => {
    expect(isNullConditional('IS')).toBe(true);
    expect(isNullConditional('is')).toBe(true);
  });

  it('should return true for is not', () => {
    expect(isNullConditional('IS NOT')).toBe(true);
    expect(isNullConditional('is not')).toBe(true);
  });

  it('should return false for null', () => {
    expect(isNullConditional(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isNullConditional(undefined)).toBe(false);
  });

  it('should return false for an object', () => {
    expect(isNullConditional({})).toBe(false);
  });
});

describe('isError', () => {
  it('should return true for Error objects', () => {
    expect(isError(new Error('test error'))).toBe(true);
  });

  it('should return true for custom Error objects', () => {
    class CustomError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'CustomError';
      }
    }
    expect(isError(new CustomError('custom error'))).toBe(true);
  });

  it('should return true for objects with name and message properties', () => {
    const errorLike = { name: 'ErrorLike', message: 'error message' };
    expect(isError(errorLike)).toBe(true);
  });

  it('should return false for objects missing name or message', () => {
    expect(isError({ name: 'ErrorLike' })).toBe(false);
    expect(isError({ message: 'error message' })).toBe(false);
  });

  it('should return false for null', () => {
    expect(isError(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isError(undefined)).toBe(false);
  });

  it('should return false for primitives', () => {
    expect(isError('error string')).toBe(false);
    expect(isError(123)).toBe(false);
    expect(isError(true)).toBe(false);
  });
});

describe('isFunction', () => {
  it('should return true if given an arrow function', () => {
    const fn = () => 2;
    expect(isFunction(fn)).toBe(true);
  });

  it('should return true if given a function expression', () => {
    const fn = function () {
      return 2;
    };
    expect(isFunction(fn)).toBe(true);
  });

  it('should return true if given a function declaration', () => {
    function fn() {
      return 2;
    }
    expect(isFunction(fn)).toBe(true);
  });

  it('should return true if given an async function ', () => {
    const fn = async () => 2;
    expect(isFunction(fn)).toBe(true);
  });

  it('should return false if given a string', () => {
    const fn = '';
    expect(isFunction(fn)).toBe(false);
  });

  it('should return false if given a number', () => {
    const fn = 42;
    expect(isFunction(fn)).toBe(false);
  });

  it('should return false if given an object', () => {
    const fn = {};
    expect(isFunction(fn)).toBe(false);
  });

  it('should return false if given an array', () => {
    const fn = [];
    expect(isFunction(fn)).toBe(false);
  });
});
