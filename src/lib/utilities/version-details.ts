import { splitHighAvailabilityGroups } from '$lib/components/workers/serverless-worker-form/multi-region';
import { translate } from '$lib/i18n/translate';
import {
  decodeAgentCoreProviderDetails,
  decodeGcpCloudRunProviderDetails,
  decodeLambdaProviderDetails,
  decodeScalerDetails,
} from '$lib/services/deployments-service';
import type {
  ComputeConfig,
  ComputeConfigScalingGroup,
  DeploymentStatus,
  Payload,
  WorkerDeploymentVersionInfo,
} from '$lib/types/deployments';
import { base64DecodeUnicode } from '$lib/utilities/atob';
import {
  formatDurationMs,
  getScalingGroups,
  type NamespaceRegion,
} from '$lib/utilities/compute-regions';

/** The query parameter that names the Version the details drawer shows. */
export const VERSION_DETAILS_PARAM = 'version';

/**
 * The current page with the details drawer open on a Version, or closed when
 * no Build ID is given. Other query parameters, such as the table's page, stay.
 */
export const versionDetailsHref = (url: URL, buildId?: string): string => {
  const next = new URL(url);
  if (buildId) next.searchParams.set(VERSION_DETAILS_PARAM, buildId);
  else next.searchParams.delete(VERSION_DETAILS_PARAM);
  return `${next.pathname}${next.search}`;
};

type ApiTime = WorkerDeploymentVersionInfo['createTime'];

/** An unset proto timestamp can arrive as the epoch or the zero time. */
const isSet = (time: ApiTime | undefined): time is ApiTime => {
  if (!time) return false;
  if (typeof time !== 'string') return Boolean(time.seconds || time.nanos);
  return !time.startsWith('1970-01-01') && !time.startsWith('0001-01-01');
};

export interface LifecycleRow {
  key: string;
  label: string;
  time?: ApiTime;
  /** Shown in place of a time, or before it. */
  text?: string;
}

const timeRow = (
  key: string,
  labelKey: Parameters<typeof translate>[0],
  time: ApiTime | undefined,
): LifecycleRow[] =>
  isSet(time) ? [{ key, label: translate(labelKey), time }] : [];

/**
 * The timestamps that answer the question each status raises: how long a
 * Version has been live, how long a ramp has run, whether a draining Version
 * is safe to delete, or whether a Version ever took traffic. `all` holds
 * every other timestamp that is set.
 */
export const lifecycleRows = (
  info: WorkerDeploymentVersionInfo,
  status: DeploymentStatus,
): { shown: LifecycleRow[]; all: LifecycleRow[] } => {
  const created = timeRow(
    'created',
    'deployments.details-created',
    info.createTime,
  );
  const firstActivated = timeRow(
    'first-activated',
    'deployments.details-first-activated',
    info.firstActivationTime,
  );
  const neverActivated: LifecycleRow[] = firstActivated.length
    ? firstActivated
    : [
        {
          key: 'first-activated',
          label: translate('deployments.details-first-activated'),
          text: translate('deployments.details-never-activated'),
        },
      ];
  const currentSince = timeRow(
    'current-since',
    'deployments.details-current-since',
    info.currentSinceTime,
  );
  const rampingSince = timeRow(
    'ramping-since',
    'deployments.details-ramping-since',
    info.rampingSinceTime,
  );
  const lastCurrent = timeRow(
    'last-current',
    'deployments.details-last-current',
    info.lastCurrentTime,
  );
  const lastDeactivated = timeRow(
    'last-deactivated',
    'deployments.details-last-deactivated',
    info.lastDeactivationTime,
  );
  const drainage: LifecycleRow[] = info.drainageInfo?.status
    ? [
        {
          key: 'drainage',
          label: translate('deployments.drainage-status'),
          text: drainageLabel(info.drainageInfo.status),
          time: isSet(info.drainageInfo.lastCheckedTime)
            ? info.drainageInfo.lastCheckedTime
            : undefined,
        },
      ]
    : [];

  const shown = ((): LifecycleRow[] => {
    switch (status) {
      case 'Current':
        return [...currentSince, ...firstActivated, ...created];
      case 'Ramping':
        return [...rampingSince, ...created];
      case 'Draining':
      case 'Drained':
        return [...drainage, ...lastCurrent, ...lastDeactivated];
      case 'Created':
        return [...created, ...neverActivated];
      default:
        return [...created, ...neverActivated, ...lastDeactivated];
    }
  })();

  const all = [
    ...created,
    ...firstActivated,
    ...currentSince,
    ...rampingSince,
    ...lastCurrent,
    ...lastDeactivated,
    ...timeRow(
      'routing-changed',
      'deployments.details-routing-changed',
      info.routingChangedTime,
    ),
    ...timeRow(
      'drainage-changed',
      'deployments.details-drainage-changed',
      info.drainageInfo?.lastChangedTime,
    ),
    ...timeRow(
      'drainage-checked',
      'deployments.details-drainage-checked',
      info.drainageInfo?.lastCheckedTime,
    ),
  ];

  // The disclosure adds what the status rows leave out; it never repeats them.
  const shownKeys = new Set(shown.map(({ key }) => key));
  return { shown, all: all.filter(({ key }) => !shownKeys.has(key)) };
};

const drainageLabel = (status: string): string =>
  status.endsWith('DRAINED')
    ? translate('deployments.details-drained')
    : status.endsWith('DRAINING')
      ? translate('deployments.details-draining')
      : status;

/** Every field a scaling group can show, in display order. */
export const GROUP_FIELDS = [
  'lambdaArn',
  'agentCoreEndpointArn',
  'gcpWorkerPool',
  'gcpProject',
  'gcpRegion',
  'iamRoleArn',
  'gcpServiceAccount',
  'roleExternalId',
  'scaleUpCooloff',
  'scaleUpBacklogThreshold',
  'maxWorkerLifetime',
  'metricsPollInterval',
] as const;

export type GroupField = (typeof GROUP_FIELDS)[number];

/**
 * Fields that name a regional resource. A replica sets its own, so they
 * always show and never collapse into "Same as primary".
 */
export const REGIONAL_FIELDS: readonly GroupField[] = [
  'lambdaArn',
  'agentCoreEndpointArn',
  'gcpWorkerPool',
  'gcpRegion',
];

/** Fields shown as long, copyable values on a line of their own. */
export const LONG_FIELDS: readonly GroupField[] = [
  'lambdaArn',
  'agentCoreEndpointArn',
  'gcpWorkerPool',
  'iamRoleArn',
  'gcpServiceAccount',
];

const FIELD_LABELS: Record<GroupField, Parameters<typeof translate>[0]> = {
  lambdaArn: 'workers.preview-resource-lambda',
  agentCoreEndpointArn: 'workers.preview-resource-agentcore',
  gcpWorkerPool: 'workers.gcp-worker-pool-label',
  gcpProject: 'workers.gcp-project-label',
  gcpRegion: 'workers.gcp-region-label',
  iamRoleArn: 'workers.preview-access-aws',
  gcpServiceAccount: 'workers.gcp-service-account-label',
  roleExternalId: 'deployments.role-external-id',
  scaleUpCooloff: 'deployments.scale-up-cooloff',
  scaleUpBacklogThreshold: 'deployments.backlog-threshold',
  maxWorkerLifetime: 'deployments.max-worker-lifetime',
  metricsPollInterval: 'deployments.metrics-poll-interval',
};

export const groupFieldLabel = (field: GroupField): string =>
  translate(FIELD_LABELS[field]);

export interface GroupDetails {
  name: string;
  regionIds: string[];
  providerType?: string;
  taskQueueTypes: string[];
  nexusEndpoint?: string;
  values: Partial<Record<GroupField, string>>;
}

const duration = (ms: number | undefined): string | undefined =>
  ms === undefined ? undefined : formatDurationMs(ms);

/** One scaling group's settings, decoded and formatted for display. */
export const decodeGroup = (
  name: string,
  group: ComputeConfigScalingGroup,
  regionIds: string[] = group.regionIds ?? [],
): GroupDetails => {
  const single: ComputeConfig = { scalingGroups: { [name]: group } };
  const lambda = decodeLambdaProviderDetails(single);
  const agentCore = decodeAgentCoreProviderDetails(single);
  const gcp = decodeGcpCloudRunProviderDetails(single);
  const scaler = decodeScalerDetails(single);
  return {
    name,
    regionIds,
    providerType: group.provider?.type ?? group.providerType,
    taskQueueTypes: group.taskQueueTypes ?? [],
    nexusEndpoint: group.provider?.nexusEndpoint || undefined,
    values: {
      lambdaArn: lambda.lambdaArn,
      agentCoreEndpointArn: agentCore.agentCoreEndpointArn,
      gcpWorkerPool: gcp.gcpWorkerPool,
      gcpProject: gcp.gcpProject,
      gcpRegion: gcp.gcpRegion,
      // Lambda and AgentCore share the assumed-role fields; only one decodes.
      iamRoleArn: lambda.iamRoleArn ?? agentCore.iamRoleArn,
      gcpServiceAccount: gcp.gcpServiceAccount,
      roleExternalId: lambda.roleExternalId ?? agentCore.roleExternalId,
      scaleUpCooloff: duration(scaler.scaleUpCooloffMs),
      scaleUpBacklogThreshold:
        scaler.scaleUpBacklogThreshold === undefined
          ? undefined
          : `${scaler.scaleUpBacklogThreshold}`,
      maxWorkerLifetime: duration(scaler.maxWorkerLifetimeMs),
      metricsPollInterval: duration(scaler.metricsPollIntervalMs),
    },
  };
};

/** An ARN with its region segment removed, so two regions' ARNs compare. */
const withoutArnRegion = (value: string): string =>
  value.replace(/^(arn:[^:]+:[^:]+:)[^:]*:/, '$1:');

/**
 * Fields where a replica's value is not the primary's. A regional resource
 * that differs only in its region is the expected case, not a difference.
 */
export const fieldsDifferingFromPrimary = (
  primary: GroupDetails,
  replica: GroupDetails,
): Set<GroupField> => {
  const differs = new Set<GroupField>();
  for (const field of GROUP_FIELDS) {
    const a = primary.values[field];
    const b = replica.values[field];
    if (a === b) continue;
    if (REGIONAL_FIELDS.includes(field) && a && b) {
      if (withoutArnRegion(a) !== withoutArnRegion(b)) differs.add(field);
      continue;
    }
    if (!REGIONAL_FIELDS.includes(field)) differs.add(field);
  }
  if (primary.providerType !== replica.providerType) {
    for (const field of GROUP_FIELDS) {
      if (replica.values[field] !== undefined) differs.add(field);
    }
  }
  return differs;
};

export interface RegionHeading {
  regionId?: string;
  label: string;
  role?: 'primary' | 'replica';
}

export type RegionBlock =
  | {
      kind: 'group';
      key: string;
      heading?: RegionHeading;
      group: GroupDetails;
      /** The replica, compared with the primary. */
      comparison?: { differs: Set<GroupField>; primaryLabel: string };
    }
  | { kind: 'missing'; key: string; heading: RegionHeading };

const headingFor = (region: NamespaceRegion): RegionHeading => ({
  regionId: region.regionId,
  label: region.label ?? region.regionId,
  role: region.role,
});

/**
 * A Version's scaling groups as the drawer stacks them. On a Namespace with
 * a replica, the unscoped group is the primary and the group scoped to the
 * replica follows it, compared field by field. A replica with no group shows
 * as missing, because a failover would leave its Tasks waiting.
 */
export const regionBlocks = (
  computeConfig: ComputeConfig | undefined,
  namespaceRegions: readonly NamespaceRegion[] = [],
): RegionBlock[] => {
  const groups = getScalingGroups(computeConfig);
  if (!groups.length) return [];

  const regionNamed = (regionIds: string[]): NamespaceRegion | undefined =>
    namespaceRegions.find(({ regionId }) => regionIds.includes(regionId));
  const headingForGroup = (regionIds: string[]): RegionHeading | undefined => {
    const region = regionNamed(regionIds);
    if (region) return headingFor(region);
    return regionIds.length ? { label: regionIds.join(', ') } : undefined;
  };

  const primaryRegion = namespaceRegions.find(({ role }) => role === 'primary');
  const replicaRegion = namespaceRegions.find(({ role }) => role === 'replica');

  if (!replicaRegion) {
    return groups.map(({ name, regionIds, group }) => ({
      kind: 'group',
      key: name,
      heading: groups.length > 1 ? headingForGroup(regionIds) : undefined,
      group: decodeGroup(name, group, regionIds),
    }));
  }

  const { primary, replica } = splitHighAvailabilityGroups(
    computeConfig,
    replicaRegion.regionId,
  );
  const blocks: RegionBlock[] = [];
  const primaryDetails = primary
    ? decodeGroup(primary.name, primary.group, primary.regionIds)
    : undefined;
  const primaryHeading = primaryRegion
    ? headingFor(primaryRegion)
    : primary
      ? headingForGroup(primary.regionIds)
      : undefined;

  if (primary && primaryDetails) {
    blocks.push({
      kind: 'group',
      key: primary.name,
      heading: primaryHeading,
      group: primaryDetails,
    });
  }

  if (replica) {
    const replicaDetails = decodeGroup(
      replica.name,
      replica.group,
      replica.regionIds,
    );
    blocks.push({
      kind: 'group',
      key: replica.name,
      heading: headingFor(replicaRegion),
      group: replicaDetails,
      comparison: primaryDetails
        ? {
            differs: fieldsDifferingFromPrimary(primaryDetails, replicaDetails),
            primaryLabel: primaryHeading
              ? [
                  primaryHeading.label,
                  translate('workers.region-role-primary'),
                ].join(' · ')
              : translate('workers.region-role-primary'),
          }
        : undefined,
    });
  } else {
    blocks.push({
      kind: 'missing',
      key: `missing-${replicaRegion.regionId}`,
      heading: headingFor(replicaRegion),
    });
  }

  for (const { name, regionIds, group } of groups) {
    if (name === primary?.name || name === replica?.name) continue;
    blocks.push({
      kind: 'group',
      key: name,
      heading: headingForGroup(regionIds),
      group: decodeGroup(name, group, regionIds),
    });
  }

  return blocks;
};

/**
 * A metadata value as text. Metadata is not codec-encoded, so a JSON payload
 * decodes in the browser; anything else shows its raw data.
 */
export const metadataValue = (
  payload: Payload | string | undefined,
): string => {
  if (payload === undefined) return '';
  if (typeof payload === 'string') return payload;
  if (!payload.data) return '';
  try {
    const text = base64DecodeUnicode(payload.data);
    try {
      const parsed: unknown = JSON.parse(text);
      return typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
    } catch {
      return text;
    }
  } catch {
    return payload.data;
  }
};

/** A proto Duration as JSON ("130.5s") in milliseconds. */
export const durationToMs = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const seconds = Number.parseFloat(value);
  return Number.isFinite(seconds) ? Math.round(seconds * 1000) : undefined;
};
