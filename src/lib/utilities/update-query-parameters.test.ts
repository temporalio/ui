import { afterEach, describe, expect, it, vi } from 'vitest';

import { addHashToURL, updateQueryParameters } from './update-query-parameters';

const gotoOptions = { replaceState: true, keepFocus: true, noScroll: true };
const url = new URL('https://temporal.io');

describe('updateQueryParameters', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call the set method on the query when a value is provided', () => {
    const parameter = 'parameter';
    const value = 'value';
    const goto = () => Promise.resolve();

    const spy = vi.spyOn(url.searchParams, 'set');

    updateQueryParameters({ parameter, value, url, goto });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(parameter, value);
  });

  it('should call the delete method on the query when no value is provided', () => {
    const parameter = 'parameter';
    const goto = () => Promise.resolve();

    const spy = vi.spyOn(url.searchParams, 'delete');

    updateQueryParameters({ parameter, url, goto });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(parameter);
  });

  it('should call the delete method on the query when an empty string is provided', () => {
    const parameter = 'parameter';
    const value = '';
    const goto = () => Promise.resolve();

    const spy = vi.spyOn(url.searchParams, 'delete');

    updateQueryParameters({ parameter, value, url, goto });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(parameter);
  });

  it('should call the delete method on the query when null is provided', () => {
    const parameter = 'parameter';
    const value = null as unknown as string;
    const goto = () => Promise.resolve();

    const spy = vi.spyOn(url.searchParams, 'delete');

    updateQueryParameters({ parameter, value, url, goto });

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(parameter);
  });

  it('should call `goto` with the correct path', () => {
    const parameter = 'parameter';
    const value = 'value';
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateQueryParameters({ parameter, value, url, goto });

    expect(goto).toHaveBeenCalledWith(
      'https://temporal.io/?parameter=value#',
      gotoOptions,
    );
  });

  it('should call `goto` with the correct path when query parameters already exist', () => {
    const parameter = 'parameter';
    const value = 'newvalue';
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateQueryParameters({ parameter, value, url, goto });

    expect(goto).toHaveBeenCalledWith(
      'https://temporal.io/?parameter=newvalue#',
      gotoOptions,
    );
  });

  it('should call `goto` with without the "?" if the query params are empty', () => {
    const parameter = 'parameter';
    const value = null as unknown as string;
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateQueryParameters({ parameter, value, url, goto });

    expect(goto).toHaveBeenCalledWith('https://temporal.io/#', gotoOptions);
  });

  it('should set the parameter to an empty string if allowEmpty is set', () => {
    const parameter = 'parameter';
    const value = '';
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateQueryParameters({ parameter, value, url, goto, allowEmpty: true });

    expect(goto).toHaveBeenCalledWith(
      'https://temporal.io/?parameter=#',
      gotoOptions,
    );
  });
});

describe('addHashToURL', () => {
  it('should add a hash to a URL', () => {
    const url = new URL('https://temporal.io/');
    expect(addHashToURL(url)).toBe('https://temporal.io/#');
  });

  it('should not add a duplicate hash to a URL', () => {
    const url = new URL('https://temporal.io/#');
    expect(addHashToURL(url)).toBe('https://temporal.io/#');
  });

  it('should put the hash after the search parameters', () => {
    const url = new URL('https://temporal.io/?parameter=value');
    expect(addHashToURL(url)).toBe('https://temporal.io/?parameter=value#');
  });
});

describe('a sanity test for how URLs work in JavaScript', () => {
  // This is primarily meant to serve as documentation for some of the
  // decisions made above.

  it('should not be able to parse the hash if it comes before the search parameters', () => {
    const url = new URL('https://temporal.io/#hash?parameter=value');
    expect(url.hash).not.toBe('#hash');
  });

  it('should not be able to parse the search parameters if they come after the hash', () => {
    const url = new URL('https://temporal.io/#hash?parameter=value');
    expect(url.search).not.toBe('?parameter=value');
  });

  it('should be able to parse the search parameters if it comes after the hash', () => {
    const url = new URL('https://temporal.io/?parameter=value#hash');
    expect(url.search).toBe('?parameter=value');
  });

  it('should be able to parse hash if it comes after the search parameters ', () => {
    const url = new URL('https://temporal.io/?parameter=value#hash');
    expect(url.hash).toBe('#hash');
  });
});
