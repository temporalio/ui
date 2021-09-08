import { toURL } from './to-url';

describe(toURL, () => {
  it('should take a string for the URL and return it', () => {
    expect(toURL('/workflows')).toBe('/workflows');
  });

  it('should turn the query params into a query string', () => {
    expect(toURL('/workflows', { a: 'hello' })).toBe('/workflows?a=hello');
  });

  it('should drop undefined query parameters', () => {
    expect(toURL('/workflows', { a: undefined })).toBe('/workflows');
  });
});
