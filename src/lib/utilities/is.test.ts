import { describe, expect, it } from 'vitest';

import {
  isExecutionStatus,
  isNull,
  isNumber,
  isObject,
  isOperator,
  isQuote,
  isSortOrder,
  isSpace,
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
    expect(isQuote(`'`)).toBe(true);
  });

  it('should return true for a single quote', () => {
    expect(isQuote(`"`)).toBe(true);
  });

  it('should return false for a letter', () => {
    expect(isQuote(`a`)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isQuote(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isQuote(undefined)).toBe(false);
  });
});
