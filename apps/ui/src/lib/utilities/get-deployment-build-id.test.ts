import { describe, expect, it } from 'vitest';

import {
  getBuildIdFromVersion,
  getDeploymentFromVersion,
} from './get-deployment-build-id';

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
  it('should return version string with invalid delimiter', () => {
    expect(getBuildIdFromVersion('orders/v12')).toEqual('orders/v12');
  });
  it('should return version string with __unversioned__', () => {
    expect(getBuildIdFromVersion('__unversioned__')).toEqual('__unversioned__');
  });
});

describe('getDeploymentFromVersion', () => {
  it('should return empty string with no version', () => {
    expect(getDeploymentFromVersion(undefined)).toEqual('');
  });
  it('should return empty string with empty string version', () => {
    expect(getDeploymentFromVersion('')).toEqual('');
  });
  it('should return deployment with . delimiter', () => {
    expect(getDeploymentFromVersion('orders.v12')).toEqual('orders');
  });
  it('should return deployment with : delimiter', () => {
    expect(getDeploymentFromVersion('orders:v12')).toEqual('orders');
  });
  it('should return version string with invalid delimiter', () => {
    expect(getDeploymentFromVersion('orders/v12')).toEqual('orders/v12');
  });
  it('should return version string with __unversioned__', () => {
    expect(getDeploymentFromVersion('__unversioned__')).toEqual(
      '__unversioned__',
    );
  });
});
