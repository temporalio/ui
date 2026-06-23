import { describe, expect, test } from 'vitest';

import { parseVersionStatus } from './deployments';

describe('parseVersionStatus', () => {
  test('returns Inactive when apiStatus is undefined', () => {
    expect(parseVersionStatus(undefined)).toEqual({
      status: 'Inactive',
      label: 'Inactive',
    });
  });

  test('returns Inactive when apiStatus is an unknown string', () => {
    expect(parseVersionStatus('UNKNOWN_STATUS')).toEqual({
      status: 'Inactive',
      label: 'Inactive',
    });
  });

  test('maps WORKER_DEPLOYMENT_VERSION_STATUS_CURRENT correctly', () => {
    expect(
      parseVersionStatus('WORKER_DEPLOYMENT_VERSION_STATUS_CURRENT'),
    ).toEqual({ status: 'Current', label: 'Current' });
  });

  test('maps WORKER_DEPLOYMENT_VERSION_STATUS_DRAINING correctly', () => {
    expect(
      parseVersionStatus('WORKER_DEPLOYMENT_VERSION_STATUS_DRAINING'),
    ).toEqual({ status: 'Draining', label: 'Draining' });
  });

  test('maps WORKER_DEPLOYMENT_VERSION_STATUS_DRAINED correctly', () => {
    expect(
      parseVersionStatus('WORKER_DEPLOYMENT_VERSION_STATUS_DRAINED'),
    ).toEqual({ status: 'Drained', label: 'Drained' });
  });

  test('maps WORKER_DEPLOYMENT_VERSION_STATUS_INACTIVE correctly', () => {
    expect(
      parseVersionStatus('WORKER_DEPLOYMENT_VERSION_STATUS_INACTIVE'),
    ).toEqual({ status: 'Inactive', label: 'Inactive' });
  });

  test('maps WORKER_DEPLOYMENT_VERSION_STATUS_CREATED correctly', () => {
    expect(
      parseVersionStatus('WORKER_DEPLOYMENT_VERSION_STATUS_CREATED'),
    ).toEqual({ status: 'Created', label: 'Created' });
  });

  test('maps WORKER_DEPLOYMENT_VERSION_STATUS_RAMPING without rampingPercentage', () => {
    expect(
      parseVersionStatus('WORKER_DEPLOYMENT_VERSION_STATUS_RAMPING'),
    ).toEqual({ status: 'Ramping', label: 'Ramping' });
  });

  test('maps WORKER_DEPLOYMENT_VERSION_STATUS_RAMPING with rampingPercentage 42', () => {
    expect(
      parseVersionStatus('WORKER_DEPLOYMENT_VERSION_STATUS_RAMPING', 42),
    ).toEqual({ status: 'Ramping', label: 'Ramping 42%' });
  });

  test('maps WORKER_DEPLOYMENT_VERSION_STATUS_RAMPING with rampingPercentage 0', () => {
    expect(
      parseVersionStatus('WORKER_DEPLOYMENT_VERSION_STATUS_RAMPING', 0),
    ).toEqual({ status: 'Ramping', label: 'Ramping 0%' });
  });
});
