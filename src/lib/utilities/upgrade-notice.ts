import type { GetClusterInfoResponse } from '$lib/types';

import { isVersionNewer } from './version-check';

export const UPGRADE_DISTRIBUTIONS = [
  'cli',
  'docker',
  'helm',
  'server',
] as const;

export type UpgradeDistribution = (typeof UPGRADE_DISTRIBUTIONS)[number];

export type UpgradeNotice = {
  distribution: UpgradeDistribution;
  current: string;
  latest: string;
  href: string;
};

const UPGRADE_LINKS: Record<UpgradeDistribution, string> = {
  cli: 'https://docs.temporal.io/cli#install',
  docker: 'https://github.com/temporalio/docker-compose',
  helm: 'https://github.com/temporalio/helm-charts',
  server: 'https://github.com/temporalio/temporal/releases',
};

export const toUpgradeDistribution = (value?: string): UpgradeDistribution =>
  UPGRADE_DISTRIBUTIONS.find((distribution) => distribution === value) ??
  'server';

export const upgradeNoticeKey = ({
  distribution,
  latest,
}: UpgradeNotice): string => `${distribution}@${latest}`;

export const getUpgradeNotice = ({
  cluster,
  notifyOnNewVersion,
  distribution,
}: {
  cluster: GetClusterInfoResponse | undefined;
  notifyOnNewVersion: boolean;
  distribution?: string;
}): UpgradeNotice | null => {
  if (!notifyOnNewVersion) return null;

  const current =
    cluster?.versionInfo?.current?.version || cluster?.serverVersion;
  const latest = cluster?.versionInfo?.recommended?.version;
  if (!current || !latest || !isVersionNewer(latest, current)) return null;

  const upgradeDistribution = toUpgradeDistribution(distribution);
  return {
    distribution: upgradeDistribution,
    current,
    latest,
    href: UPGRADE_LINKS[upgradeDistribution],
  };
};
