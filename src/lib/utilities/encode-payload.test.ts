import { describe, expect, it } from 'vitest';

import {
  parseWithBigInt,
  stringifyWithBigInt,
} from '$lib/utilities/parse-with-big-int';

import {
  encodePayloads,
  getSinglePayload,
  isEncodedPayload,
} from './encode-payload';

describe('getSinglePayload', () => {
  it('should return single payload from single payload', () => {
    const payload = [{ foo: 'bar' }];
    const singlePayload = getSinglePayload(stringifyWithBigInt(payload));
    expect(parseWithBigInt(singlePayload)).toEqual(payload[0]);
  });
  it('should return single payload from multiple payloads', () => {
    const payload = ['input1', 'input2'];
    const singlePayload = getSinglePayload(stringifyWithBigInt(payload));
    expect(parseWithBigInt(singlePayload)).toEqual(payload[0]);
  });
  it('should return empty string from no payload', () => {
    const singlePayload = getSinglePayload('');
    expect(singlePayload).toEqual('');
  });
  it('should return string from string payload', () => {
    const payload = 'cats';
    const singlePayload = getSinglePayload(stringifyWithBigInt(payload));
    expect(parseWithBigInt(singlePayload)).toEqual(payload);
  });
});

describe('isEncodedPayload', () => {
  it('should return true for a base64-encoded payload', () => {
    expect(
      isEncodedPayload({
        metadata: { encoding: 'anNvbi9wbGFpbg==' },
        data: 'eyJmb28iOiJiYXIifQ==',
      }),
    ).toBe(true);
  });

  it('should return true for a binary/null encoded payload', () => {
    expect(
      isEncodedPayload({
        metadata: { encoding: 'YmluYXJ5L251bGw=' },
        data: '',
      }),
    ).toBe(true);
  });

  it('should return false for a decoded payload', () => {
    expect(
      isEncodedPayload({
        metadata: { encoding: 'json/plain' },
        data: { foo: 'bar' },
      }),
    ).toBe(false);
  });

  it('should return false for a raw string value', () => {
    expect(isEncodedPayload('hello')).toBe(false);
  });

  it('should return false for a raw object value', () => {
    expect(isEncodedPayload({ foo: 'bar' })).toBe(false);
  });

  it('should return false for null', () => {
    expect(isEncodedPayload(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isEncodedPayload(undefined)).toBe(false);
  });
});

describe('encodePayloads', () => {
  it('should encode single simple string payload', async () => {
    const payload = await encodePayloads({
      input: stringifyWithBigInt('cats'),
      encoding: 'json/plain',
    });
    const expectedEncodedPayload = [
      {
        data: 'ImNhdHMi',
        metadata: {
          encoding: 'anNvbi9wbGFpbg==',
        },
      },
    ];
    expect(payload).toEqual(expectedEncodedPayload);
  });
  it('should encode bigInt string payload', async () => {
    const input = { foo: 1234213412398883n };
    const payload = await encodePayloads({
      input: stringifyWithBigInt(input),
      encoding: 'json/plain',
    });
    const expectedEncodedPayload = [
      {
        data: 'eyJmb28iOjEyMzQyMTM0MTIzOTg4ODN9',
        metadata: {
          encoding: 'anNvbi9wbGFpbg==',
        },
      },
    ];
    expect(payload).toEqual(expectedEncodedPayload);
  });
});
