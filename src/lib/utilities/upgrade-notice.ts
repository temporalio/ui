import { isVersionNewer } from './version-check';

export const UPGRADE_DISTRIBUTIONS = [
  'cli',
  'docker',
  'helm',
  'server',
] as const;

export type UpgradeDistribution = (typeof UPGRADE_DISTRIBUTIONS)[number];

export type ReleaseComponent = 'cli' | 'helm' | 'ui' | 'server';

export type ComponentVersions = Partial<Record<ReleaseComponent, string>>;

export type UpgradeNotice = {
  distribution: UpgradeDistribution;
  current: string;
  latest: string;
  href: string;
};

const DISTRIBUTION_RELEASE: Record<UpgradeDistribution, ReleaseComponent> = {
  cli: 'cli',
  docker: 'ui',
  helm: 'helm',
  server: 'server',
};

const UPGRADE_LINKS: Record<UpgradeDistribution, string> = {
  cli: 'https://docs.temporal.io/cli#install',
  docker: 'https://hub.docker.com/r/temporalio/ui',
  helm: 'https://github.com/temporalio/helm-charts',
  server: 'https://github.com/temporalio/temporal/releases',
};

export const toUpgradeDistribution = (value?: string): UpgradeDistribution =>
  UPGRADE_DISTRIBUTIONS.find((distribution) => distribution === value) ??
  'server';

export const releaseForDistribution = (
  distribution: UpgradeDistribution,
): ReleaseComponent => DISTRIBUTION_RELEASE[distribution];

export const upgradeNoticeKey = ({ distribution, latest }: UpgradeNotice) =>
  `${distribution}@${latest}`;

export const getInstalledVersions = ({
  distribution,
  distributionVersion,
  uiVersion,
  serverVersion,
}: {
  distribution: UpgradeDistribution;
  distributionVersion?: string;
  uiVersion?: string;
  serverVersion?: string;
}): ComponentVersions => ({
  cli: distribution === 'cli' ? distributionVersion : undefined,
  helm: distribution === 'helm' ? distributionVersion : undefined,
  ui: uiVersion,
  server: serverVersion,
});

export const getUpgradeNotice = ({
  distribution,
  installed,
  latest,
}: {
  distribution: UpgradeDistribution;
  installed: ComponentVersions;
  latest: ComponentVersions;
}): UpgradeNotice | null => {
  const component = releaseForDistribution(distribution);
  const current = installed[component];
  const latestVersion = latest[component];
  if (!current || !latestVersion || !isVersionNewer(latestVersion, current)) {
    return null;
  }

  return {
    distribution,
    current,
    latest: latestVersion,
    href: UPGRADE_LINKS[distribution],
  };
};
