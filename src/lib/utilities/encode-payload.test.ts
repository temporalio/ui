import { describe, expect, it } from 'vitest';

import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

import { encodePayloads, getSinglePayload } from './encode-payload';

describe('getSinglePayload', () => {
  it('should return single payload from single payload', () => {
    const payload = [
      {
        metadata: { encoding: 'json/plain' },
        data: 'eyJ0aXRsZSI6ImhlbGxvIn0=',
      },
    ];
    const singlePayload = getSinglePayload(stringifyWithBigInt(payload));
    expect(singlePayload).toEqual(stringifyWithBigInt(payload[0]));
  });
  it('should return single payload from multiple payloads', () => {
    const payload = [
      {
        metadata: { encoding: 'json/plain' },
        data: 'eyJ0aXRsZSI6ImhlbGxvIn0=',
      },
      { metadata: { encoding: 'json/plain' }, data: 'cccccasdf' },
    ];
    const singlePayload = getSinglePayload(stringifyWithBigInt(payload));
    expect(singlePayload).toEqual(stringifyWithBigInt(payload[0]));
  });
  it('should return empty string from no payload', () => {
    const singlePayload = getSinglePayload('');
    expect(singlePayload).toEqual('');
  });
  it('should return empty string from bad payload', () => {
    const payload = {
      metadata: { encoding: 'json/plain' },
      data: 'eyJ0aXRsZSI6ImhlbGxvIn0=',
    };
    const singlePayload = getSinglePayload(stringifyWithBigInt(payload));
    expect(singlePayload).toEqual('');
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
