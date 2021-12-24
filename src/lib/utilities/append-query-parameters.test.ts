import { appendQueryParameters } from './append-query-parameters';

describe(appendQueryParameters, () => {
  it('should append query paramters if available', () => {
    const result = appendQueryParameters(
      '/test',
      new URLSearchParams({ parameter: 'value' }),
    );
    expect(result).toBe('/test?parameter=value');
  });

  it('should omit the question mark if there are no query parameters', () => {
    const result = appendQueryParameters('/test', new URLSearchParams());
    expect(result).toBe('/test');
  });

  it('should omit the question mark if null is purposely passed in', () => {
    const result = appendQueryParameters('/test', null);
    expect(result).toBe('/test');
  });
});
