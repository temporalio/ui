import { createDataUrl } from './create-data-url';

describe(createDataUrl, () => {
  it('should return a data-encoded URI based on an object', () => {
    const example = { hello: 123 };
    expect(createDataUrl(example)).toBe(
      'data:application/json;charset=utf-8,%7B%22hello%22%3A123%7D',
    );
  });
});
