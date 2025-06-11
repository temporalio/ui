import { describe, expect, it } from 'vitest';

import { getBuildIdFromVersion } from './get-deployment-build-id';

describe('getBuildIdFromVersion', () => {
  it('should return empty string with no version', () => {
    expect(getBuildIdFromVersion(undefined)).toEqual('');
  });
  it('should return empty string with empty string version', () => {
    expect(getBuildIdFromVersion('')).toEqual('');
  });
  it('should return build id with . delimiter', () => {
    expect(getBuildIdFromVersion('orders.v12')).toEqual('v12');
  });
  it('should return build id with : delimiter', () => {
    expect(getBuildIdFromVersion('orders:v12')).toEqual('v12');
  });
  it('should return empty string with invalid delimiter', () => {
    expect(getBuildIdFromVersion('orders/v12')).toEqual('');
  });
});
