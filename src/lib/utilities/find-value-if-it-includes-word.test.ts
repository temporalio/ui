import { findValueIfItIncludesWord } from './find-value-if-it-includes-word';

describe(findValueIfItIncludesWord, () => {
  it('should return back value of thisIsALongObjectName', () => {
    const obj = {
      thisIsALongObjectName: 'hello world!',
    };
    expect(findValueIfItIncludesWord(obj, 'ObjectName')).toBe('hello world!');
  });

  it('should not return back a value and return back undefined', () => {
    const obj = {
      thisIsALongObjectName: 'hello world!',
    };
    expect(findValueIfItIncludesWord(obj, 'Temporal')).toBe(undefined);
  });
});
