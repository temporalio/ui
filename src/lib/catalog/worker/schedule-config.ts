export type CatalogScheduleConfig = {
  enabled: boolean;
};

type CatalogScheduleEnvironment = Record<string, string | undefined>;

export const parseCatalogScheduleConfig = (
  environment: CatalogScheduleEnvironment,
): CatalogScheduleConfig => {
  const setting = environment.CATALOG_SCHEDULES;

  if (setting === undefined || setting === 'disabled')
    return { enabled: false };
  if (setting === 'enabled') return { enabled: true };

  throw new Error('CATALOG_SCHEDULES must be "enabled" or "disabled"');
};
