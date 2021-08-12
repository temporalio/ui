import {
  mergeSearchParams,
  toSearchParams,
  urlSearchParamsToObject,
} from './url-search-params';

describe(urlSearchParamsToObject, () => {
  it('should parse URL search params and turn it into an object', () => {
    const search = new URLSearchParams();

    search.set('a', '1');
    search.set('b', '2');

    expect(urlSearchParamsToObject(search)).toEqual({ a: '1', b: '2' });
  });
});

describe(toSearchParams, () => {
  it('should take an object of search params and turn it into a URLSearchParam object', () => {
    const result = toSearchParams({ a: 1, b: 2 });

    expect(result).toBeInstanceOf(URLSearchParams);
  });

  it('should correctly match the parameters', () => {
    const expected = new URLSearchParams();

    expected.set('a', '1');
    expected.set('b', '2');

    const result = toSearchParams({ a: 1, b: 2 });

    expect(result.get('a')).toBe(expected.get('a'));
    expect(result.get('b')).toBe(expected.get('b'));
  });
});

describe(mergeSearchParams, () => {
  it('should produce a URLSearchParamsObject that is the combination of two URLSearchParams', () => {
    const first = new URLSearchParams();
    const second = new URLSearchParams();

    first.set('a', '1');
    first.set('b', '2');
    second.set('b', '3');
    second.set('c', '4');

    const result = mergeSearchParams(first, second);

    expect(result.get('a')).toBe('1');
    expect(result.get('b')).toBe('3');
    expect(result.get('c')).toBe('4');
  });
});
