import { convertToJSON } from './convert-to-json';

describe(convertToJSON, () => {
  it('should return a data-encoded URI based on an object', () => {
    const example = { hello: 123 };
    expect(convertToJSON(example)).toBe(
      'data:application/json;charset=utf-8,%7B%22hello%22%3A123%7D',
    );
  });
});
