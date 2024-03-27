import { describe, expect, it } from 'vitest';

import { getSinglePayload } from './encode-payload';

describe('getSinglePayload', () => {
  it('should return single payload from single payload', () => {
    const payload = [
      {
        metadata: { encoding: 'json/plain' },
        data: 'eyJ0aXRsZSI6ImhlbGxvIn0=',
      },
    ];
    const singlePayload = getSinglePayload(JSON.stringify(payload));
    expect(singlePayload).toEqual(JSON.stringify(payload[0]));
  });
  it('should return single payload from multiple payloads', () => {
    const payload = [
      {
        metadata: { encoding: 'json/plain' },
        data: 'eyJ0aXRsZSI6ImhlbGxvIn0=',
      },
      { metadata: { encoding: 'json/plain' }, data: 'cccccasdf' },
    ];
    const singlePayload = getSinglePayload(JSON.stringify(payload));
    expect(singlePayload).toEqual(JSON.stringify(payload[0]));
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
    const singlePayload = getSinglePayload(JSON.stringify(payload));
    expect(singlePayload).toEqual('');
  });
});
