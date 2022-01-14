import { createDataUrl } from './create-data-url';

describe(createDataUrl, () => {
  it('should return a data-encoded URI based on an object', () => {
    const example = { hello: 123 };
    expect(createDataUrl(example)).toBe(
      'data:application/json;charset=utf-8,%7B%0A%20%20%22hello%22%3A%20123%0A%7D',
    );
  });
});
