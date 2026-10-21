import { describe, expect, it } from 'vitest';

import { decodePayloadResult } from './decode-payload-result';

const payload = {
  metadata: { encoding: 'anNvbi9wbGFpbg==' },
  data: 'ImhlbGxvIg==',
};
const otherPayload = {
  metadata: { encoding: 'anNvbi9wbGFpbg==' },
  data: 'eyJhIjoxfQ==',
};

describe('decodePayloadResult', () => {
  it('decodes a single payload', async () => {
    expect(await decodePayloadResult(payload)).toEqual([
      {
        decodedValue: {
          metadata: { encoding: 'json/plain' },
          data: 'hello',
        },
        originalValue: payload,
      },
    ]);
  });

  it('decodes each payload in a payloads object', async () => {
    const result = await decodePayloadResult({
      payloads: [payload, otherPayload],
    });
    expect(result.map(({ decodedValue }) => decodedValue)).toEqual([
      { metadata: { encoding: 'json/plain' }, data: 'hello' },
      { metadata: { encoding: 'json/plain' }, data: { a: 1 } },
    ]);
    expect(result.map(({ originalValue }) => originalValue)).toEqual([
      payload,
      otherPayload,
    ]);
  });

  it('decodes payloads nested in an object', async () => {
    const value = { failure: { details: { payloads: [payload] } } };
    expect(await decodePayloadResult(value)).toEqual([
      {
        decodedValue: { failure: { details: { payloads: ['hello'] } } },
        originalValue: value,
      },
    ]);
  });
});
