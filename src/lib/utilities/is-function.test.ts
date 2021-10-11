import { isFunction } from './is-function';

describe(isFunction, () => {
  it('should return true if given an arrow function', () => {
    const fn = () => {};
    expect(isFunction(fn)).toBe(true);
  });

  it('should return true if given a function expression', () => {
    const fn = function () {};
    expect(isFunction(fn)).toBe(true);
  });

  it('should return true if given a function declaration', () => {
    function fn() {}
    expect(isFunction(fn)).toBe(true);
  });

  it('should return true if given an async function ', () => {
    const fn = async () => {};
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
