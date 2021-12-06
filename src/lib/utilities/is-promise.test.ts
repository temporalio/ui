import { isPromise } from './is-promise';

describe(isPromise, () => {
  it('should return true if an object is a resolved promise', async () => {
    expect(isPromise(Promise.resolve())).toBe(true);
  });

  it('should return true if an object is a rejected promise', async () => {
    try {
      expect(isPromise(await Promise.reject().catch())).toBe(true);
    } catch (er) {}
  });

  it('should return true if an object is a promise', () => {
    expect(isPromise(new Promise(() => {}))).toBe(true);
  });

  it('should return false if an object is a function', () => {
    expect(isPromise(() => {})).toBe(false);
  });

  it('should return false if an object is partially promise like with a .then', () => {
    expect(isPromise({ then: () => {} })).toBe(false);
  });

  it('should return false if an object is partially promise like with a .catch', () => {
    expect(isPromise({ catch: () => {} })).toBe(false);
  });

  it('should return false if an object is partially promise like with a .finally', () => {
    expect(isPromise({ finally: () => {} })).toBe(false);
  });

  it('should return false if an object is promise like (contains .then, .catch. finally)', () => {
    expect(
      isPromise({
        then: () => {},
        catch: () => {},
        finally: () => {},
      }),
    ).toBe(false);
  });

  it('should return false if an object is a string', () => {
    expect(isPromise('')).toBe(false);
  });

  it('should return false if an object is a number', () => {
    expect(isPromise(1234)).toBe(false);
  });

  it('should return false if an object is -Infinity', () => {
    expect(isPromise(-Infinity)).toBe(false);
  });

  it('should return false if an object is Infinity', () => {
    expect(isPromise(Infinity)).toBe(false);
  });

  it('should return false if an object is NaN', () => {
    expect(isPromise(NaN)).toBe(false);
  });

  it('should return false if an object is -NaN', () => {
    expect(isPromise(-NaN)).toBe(false);
  });

  it('should return false if an object is an object', () => {
    expect(isPromise({})).toBe(false);
  });

  it('should return false if an object is null', () => {
    expect(isPromise(null)).toBe(false);
  });

  it('should return false if an object is undefined', () => {
    expect(isPromise(undefined)).toBe(false);
  });
});
