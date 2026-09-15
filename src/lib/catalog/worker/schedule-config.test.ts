import { describe, expect, it } from 'vitest';

import { parseCatalogScheduleConfig } from './schedule-config';

describe('parseCatalogScheduleConfig', () => {
  it('leaves the schedule manager disabled when the variable is unset', () => {
    expect(parseCatalogScheduleConfig({})).toEqual({ enabled: false });
  });

  it('leaves the schedule manager disabled when the variable says disabled', () => {
    expect(
      parseCatalogScheduleConfig({ CATALOG_SCHEDULES: 'disabled' }),
    ).toEqual({ enabled: false });
  });

  it('enables the schedule manager when the variable says enabled', () => {
    expect(
      parseCatalogScheduleConfig({ CATALOG_SCHEDULES: 'enabled' }),
    ).toEqual({ enabled: true });
  });

  it('rejects any other value by naming the variable and both accepted values', () => {
    expect(() =>
      parseCatalogScheduleConfig({ CATALOG_SCHEDULES: 'true' }),
    ).toThrow('CATALOG_SCHEDULES must be "enabled" or "disabled"');
  });
});
