import { set } from './set-object-key';

describe(set, () => {
  it('should set an existing key', () => {
    const obj = { a: 1 };
    expect(set(obj, 'a', 2)).toEqual({ a: 2 });
  });

  it('should add a key to an object', () => {
    const obj = { a: 1 };
    expect(set(obj, 'b', 2)).toEqual({ a: 1, b: 2 });
  });

  it('should add a nested key to an object', () => {
    const obj = { a: 1 };
    expect(set(obj, 'b.c', 2)).toEqual({ a: 1, b: { c: 2 } });
  });

  it('should add a nested key to an object using an array', () => {
    const obj = { a: 1 };
    expect(set(obj, ['b', 'c'], 2)).toEqual({ a: 1, b: { c: 2 } });
  });
});
