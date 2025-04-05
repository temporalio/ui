import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  gotoOptions,
  updateMultipleQueryParameters,
  updateQueryParameters,
} from './update-query-parameters';

describe('updateQueryParameters', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call `goto` with the correct path when no value is provided', () => {
    const url = new URL('https://temporal.io');
    const parameter = 'parameter';
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateQueryParameters({ parameter, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path when an empty string is provided', () => {
    const url = new URL('https://temporal.io');
    const parameter = 'parameter';
    const value = '';
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateQueryParameters({ parameter, value, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path when an emmpty string is provided and there are other params', () => {
    const url = new URL('https://temporal.io/?other=value');
    const parameter = 'parameter';
    const value = '';

    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateQueryParameters({ parameter, value, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?other=value');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path when null is provided', () => {
    const url = new URL('https://temporal.io');
    const parameter = 'parameter';
    const value = null as unknown as string;
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateQueryParameters({ parameter, value, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path when null is provided and there are other params', () => {
    const url = new URL('https://temporal.io/?other=value');
    const parameter = 'parameter';
    const value = null as unknown as string;

    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateQueryParameters({ parameter, value, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?other=value');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path', () => {
    const url = new URL('https://temporal.io');
    const parameter = 'parameter';
    const value = 'value';
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateQueryParameters({ parameter, value, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?parameter=value');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path when there are other params', () => {
    const url = new URL('https://temporal.io/?other=value');
    const parameter = 'parameter';
    const value = 'value';
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateQueryParameters({ parameter, value, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?other=value&parameter=value');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path when query parameters already exist', () => {
    const parameter = 'parameter';
    const value = 'value';
    const url = new URL(`https://temporal.io/?${parameter}=oldvalue`);
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateQueryParameters({ parameter, value, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?parameter=value');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path for the updated param when there are other params', () => {
    const parameter = 'parameter';
    const value = 'value';
    const url = new URL(
      `https://temporal.io/?${parameter}=oldvalue&other=value`,
    );
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateQueryParameters({ parameter, value, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?parameter=value&other=value');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path for the updated param and keep order if there are other params', () => {
    const parameter = 'parameter';
    const value = 'newValue';
    const url = new URL(
      `https://temporal.io/?other1=value1&${parameter}=oldValue&other2=value2`,
    );
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateQueryParameters({ parameter, value, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?other1=value1&parameter=newValue&other2=value2');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with without the "?" if the query params are empty', () => {
    const url = new URL('https://temporal.io');
    const parameter = 'parameter';
    const value = null as unknown as string;
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateQueryParameters({ parameter, value, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/');
    expect(options).toEqual(gotoOptions);
  });

  it('should set the parameter to an empty string if allowEmpty is set', () => {
    const url = new URL('https://temporal.io');
    const parameter = 'parameter';
    const value = '';
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateQueryParameters({ parameter, value, url, goto, allowEmpty: true });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?parameter=');
    expect(options).toEqual(gotoOptions);
  });

  it('should clear single clearParameter when on a page', () => {
    const parameter = 'parameter';
    const value = 'value';
    const url = new URL(
      `https://temporal.io/?${parameter}=oldvalue&other=value`,
    );
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateQueryParameters({
      parameter,
      value,
      url,
      goto,
      clearParameters: ['other'],
    });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?parameter=value');
    expect(options).toEqual(gotoOptions);
  });

  it('should clear multiple clearParameters when on a page', () => {
    const parameter = 'parameter';
    const value = 'value';
    const url = new URL(
      `https://temporal.io/?${parameter}=oldvalue&other=value&page=3`,
    );
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateQueryParameters({
      parameter,
      value,
      url,
      goto,
      clearParameters: ['page', 'other'],
    });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?parameter=value');
    expect(options).toEqual(gotoOptions);
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

describe('updateMultipleQueryParameters', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call `goto` with the correct path when no value is provided', () => {
    const url = new URL('https://temporal.io');
    const parameters = [{ parameter: 'parameter' }];
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateMultipleQueryParameters({ parameters, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path when an empty string is provided', () => {
    const url = new URL('https://temporal.io');
    const parameters = [{ parameter: 'parameter', value: '' }];
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateMultipleQueryParameters({ parameters, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path when an emmpty string is provided and there are other params', () => {
    const url = new URL('https://temporal.io/?other=value');
    const parameters = [{ parameter: 'parameter', value: '' }];

    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateMultipleQueryParameters({ parameters, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?other=value');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path when null is provided', () => {
    const url = new URL('https://temporal.io');
    const parameters = [
      { parameter: 'parameter', value: null as unknown as string },
    ];
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateMultipleQueryParameters({ parameters, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path when null is provided and there are other params', () => {
    const url = new URL('https://temporal.io/?other=value');
    const parameters = [
      { parameter: 'parameter', value: null as unknown as string },
    ];

    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateMultipleQueryParameters({ parameters, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?other=value');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path', () => {
    const url = new URL('https://temporal.io');
    const parameters = [{ parameter: 'parameter', value: 'value' }];
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateMultipleQueryParameters({ parameters, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?parameter=value');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path if multiple parameters are provided', () => {
    const url = new URL('https://temporal.io');
    const parameters = [
      { parameter: 'A', value: 'value' },
      { parameter: 'B', value: 'value' },
    ];
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateMultipleQueryParameters({ parameters, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?A=value&B=value');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path when there are other params', () => {
    const url = new URL('https://temporal.io/?other=value');
    const parameters = [{ parameter: 'parameter', value: 'value' }];
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateMultipleQueryParameters({ parameters, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?other=value&parameter=value');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path when there are other params and multiple parameters are provided', () => {
    const url = new URL('https://temporal.io/?other=value');
    const parameters = [
      { parameter: 'A', value: 'value' },
      { parameter: 'B', value: 'value' },
    ];
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateMultipleQueryParameters({ parameters, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?other=value&A=value&B=value');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path when query parameters already exist', () => {
    const parameter = 'parameter';
    const parameters = [{ parameter, value: 'value' }];
    const url = new URL(`https://temporal.io/?${parameter}=oldvalue`);
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateMultipleQueryParameters({ parameters, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?parameter=value');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with the correct path for the updated param when there are other params', () => {
    const parameter = 'parameter';
    const parameters = [{ parameter, value: 'value' }];
    const url = new URL(
      `https://temporal.io/?${parameter}=oldvalue&other=value`,
    );
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateMultipleQueryParameters({ parameters, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?other=value&parameter=value');
    expect(options).toEqual(gotoOptions);
  });

  it('should call `goto` with without the "?" if the query params are empty', () => {
    const url = new URL('https://temporal.io');
    const parameters = [
      { parameter: 'parameter', value: null as unknown as string },
    ];
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateMultipleQueryParameters({ parameters, url, goto });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/');
    expect(options).toEqual(gotoOptions);
  });

  it('should clear single clearParameter when on a page', () => {
    const parameter = 'parameter';
    const parameters = [{ parameter, value: 'value' }];
    const url = new URL(
      `https://temporal.io/?${parameter}=oldvalue&other=value`,
    );
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateMultipleQueryParameters({
      parameters,
      url,
      goto,
      clearParameters: ['other'],
    });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?parameter=value');
    expect(options).toEqual(gotoOptions);
  });

  it('should clear multiple clearParameters when on a page', () => {
    const parameter = 'parameter';
    const parameters = [{ parameter, value: 'value' }];
    const url = new URL(
      `https://temporal.io/?${parameter}=oldvalue&other=value&page=3`,
    );
    const goto = vi.fn().mockImplementation(() => Promise.resolve(null));

    updateMultipleQueryParameters({
      parameters,
      url,
      goto,
      clearParameters: ['page', 'other'],
    });

    const [href, options] = goto.mock.calls[0];

    expect(href).toBe('/?parameter=value');
    expect(options).toEqual(gotoOptions);
  });
});
