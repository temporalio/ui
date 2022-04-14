import { isString, isNull, isObject, isNumber } from './is';

describe(isString, () => {
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

describe(isNull, () => {
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

describe(isObject, () => {
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

describe(isNumber, () => {
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
