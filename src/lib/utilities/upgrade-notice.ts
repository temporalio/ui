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
  component: ReleaseComponent;
  current: string;
  latest: string;
  href: string;
};

const DISTRIBUTION_RELEASES: Record<UpgradeDistribution, ReleaseComponent[]> = {
  cli: ['cli'],
  docker: ['ui', 'server'],
  helm: ['helm', 'ui', 'server'],
  server: ['server'],
};

const UPGRADE_LINKS: Record<ReleaseComponent, string> = {
  cli: 'https://docs.temporal.io/cli#install',
  helm: 'https://github.com/temporalio/helm-charts',
  ui: 'https://hub.docker.com/r/temporalio/ui',
  server: 'https://hub.docker.com/r/temporalio/server',
};

const SERVER_RELEASES_LINK = 'https://github.com/temporalio/temporal/releases';

export const toUpgradeDistribution = (value?: string): UpgradeDistribution =>
  UPGRADE_DISTRIBUTIONS.find((distribution) => distribution === value) ??
  'server';

export const upgradeNoticeKey = ({ component, latest }: UpgradeNotice) =>
  `${component}@${latest}`;

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

const upgradeLink = (
  component: ReleaseComponent,
  distribution: UpgradeDistribution,
) =>
  component === 'server' && distribution === 'server'
    ? SERVER_RELEASES_LINK
    : UPGRADE_LINKS[component];

export const getUpgradeNotice = ({
  distribution,
  installed,
  latest,
}: {
  distribution: UpgradeDistribution;
  installed: ComponentVersions;
  latest: ComponentVersions;
}): UpgradeNotice | null => {
  for (const component of DISTRIBUTION_RELEASES[distribution]) {
    const current = installed[component];
    const latestVersion = latest[component];
    if (current && latestVersion && isVersionNewer(latestVersion, current)) {
      return {
        component,
        current,
        latest: latestVersion,
        href: upgradeLink(component, distribution),
      };
    }
  }
  return null;
};
