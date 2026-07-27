import { describe, expect, it } from 'vitest';

import {
  parseWithBigInt,
  stringifyWithBigInt,
} from '$lib/utilities/parse-with-big-int';

import {
  encodePayloads,
  getSinglePayload,
  isBase64EncodedPayload,
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

describe('isBase64EncodedPayload', () => {
  it('should return true for a base64-encoded payload', () => {
    expect(
      isBase64EncodedPayload({
        metadata: { encoding: 'anNvbi9wbGFpbg==' },
        data: 'eyJmb28iOiJiYXIifQ==',
      }),
    ).toBe(true);
  });

  it('should return true for a binary/null encoded payload', () => {
    expect(
      isBase64EncodedPayload({
        metadata: { encoding: 'YmluYXJ5L251bGw=' },
        data: '',
      }),
    ).toBe(true);
  });

  it('should return false for a decoded payload', () => {
    expect(
      isBase64EncodedPayload({
        metadata: { encoding: 'json/plain' },
        data: { foo: 'bar' },
      }),
    ).toBe(false);
  });

  it('should return false for a raw string value', () => {
    expect(isBase64EncodedPayload('hello')).toBe(false);
  });

  it('should return false for a raw object value', () => {
    expect(isBase64EncodedPayload({ foo: 'bar' })).toBe(false);
  });

  it('should return false for null', () => {
    expect(isBase64EncodedPayload(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isBase64EncodedPayload(undefined)).toBe(false);
  });
});

describe('encodePayloads', () => {
  it('should return already-encoded payload as-is', async () => {
    const alreadyEncoded = {
      metadata: { encoding: 'anNvbi9wbGFpbg==' },
      data: 'eyJmb28iOiJiYXIifQ==',
    };
    const payload = await encodePayloads({
      input: stringifyWithBigInt(alreadyEncoded),
      encoding: 'json/plain',
    });
    expect(payload).toEqual([alreadyEncoded]);
  });

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
