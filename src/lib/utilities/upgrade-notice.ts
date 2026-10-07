import { isVersionNewer } from './version-check';

export const UPGRADE_DISTRIBUTIONS = [
  'cli',
  'docker',
  'helm',
  'server',
] as const;

export type UpgradeDistribution = (typeof UPGRADE_DISTRIBUTIONS)[number];

export type ReleaseComponent = 'cli' | 'image' | 'ui';

export type ComponentVersions = Partial<Record<ReleaseComponent, string>>;

export type UpgradeNotice = {
  distribution: UpgradeDistribution;
  current: string;
  latest: string;
  href: string;
};

const DISTRIBUTION_RELEASE: Record<UpgradeDistribution, ReleaseComponent> = {
  cli: 'cli',
  docker: 'image',
  helm: 'image',
  server: 'ui',
};

const UPGRADE_LINKS: Record<UpgradeDistribution, string> = {
  cli: 'https://docs.temporal.io/cli#install',
  docker: 'https://hub.docker.com/r/temporalio/ui',
  helm: 'https://github.com/temporalio/helm-charts',
  server: 'https://github.com/temporalio/ui/releases',
};

export const toUpgradeDistribution = (value?: string): UpgradeDistribution =>
  UPGRADE_DISTRIBUTIONS.find((distribution) => distribution === value) ??
  'server';

export const releaseForDistribution = (
  distribution: UpgradeDistribution,
): ReleaseComponent => DISTRIBUTION_RELEASE[distribution];

export const upgradeNoticeKey = ({ distribution, latest }: UpgradeNotice) =>
  `${distribution}@${latest}`;

// A build that reports something other than a plain release version, such as
// the CLI's 0.0.0-DEV default, has nothing meaningful to compare against.
// isVersionNewer parses per segment, so "0.0.0-DEV" would otherwise read as
// 0.0.NaN and make every release look like an upgrade.
const RELEASE_VERSION = /^\d+\.\d+\.\d+$/;

const releaseVersion = (value?: string): string | undefined =>
  value && RELEASE_VERSION.test(value) ? value : undefined;

export const getInstalledVersions = ({
  distribution,
  distributionVersion,
  uiVersion,
}: {
  distribution: UpgradeDistribution;
  distributionVersion?: string;
  uiVersion?: string;
}): ComponentVersions => ({
  cli: distribution === 'cli' ? releaseVersion(distributionVersion) : undefined,
  image: releaseVersion(uiVersion),
  ui: releaseVersion(uiVersion),
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
