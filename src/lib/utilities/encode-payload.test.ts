import { describe, expect, it } from 'vitest';

import {
  parseWithBigInt,
  stringifyWithBigInt,
} from '$lib/utilities/parse-with-big-int';

import { encodePayloads, getSinglePayload } from './encode-payload';

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
