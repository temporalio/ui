<script lang="ts">
  import { untrack } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';

  import {
    type ComputeRegion,
    lambdaArnPlaceholderFor,
    type PreviewRegion,
    previewSlot,
    regionPreview,
    resourceValue,
    suggestRegionalArn,
  } from './multi-region';
  import {
    type ComputeFieldErrors,
    type ComputeFormValues,
    type ComputeProviderOption,
    type ComputeProviderValue,
    defaultScaleDownStabilization,
    type RegionComputeValues,
  } from './shared';

  import ComputeFields from './compute-fields.svelte';
  import ComputeProviderPicker from './compute-provider-picker.svelte';
  import FailoverPreview from './failover-preview.svelte';
  import RegionBlock from './region-block.svelte';
  import RegionsHeading from './regions-heading.svelte';

  interface Props {
    namespace: string;
    regions: readonly ComputeRegion[];
    computeProviders?: readonly ComputeProviderOption[];
    deploymentName?: string;
    buildId?: string;
    /** Out: the compute each region saves, kept current as the form changes. */
    regionValues?: RegionComputeValues[];
    /** Field errors per region, keyed by region id. */
    regionErrors?: Record<string, ComputeFieldErrors>;
  }

  let {
    namespace,
    regions,
    computeProviders,
    deploymentName,
    buildId,
    regionValues = $bindable([]),
    regionErrors = {},
  }: Props = $props();

  let provider = $state<ComputeProviderValue>(
    untrack(() => regions[0]?.provider ?? 'lambda'),
  );

  /** The customer runs their own Workers in the primary (replica-only). */
  const emptyEntry = (region: ComputeRegion) => ({
    regionId: region.id,
    label: region.label ?? region.id,
    role: region.role,
    cloud: region.provider,
    lambdaArn: '',
    agentCoreEndpointArn: '',
    iamRoleArn: '',
    roleExternalId: '',
    gcpProject: '',
    gcpRegion: '',
    gcpWorkerPool: '',
    gcpServiceAccount: '',
    minReplicas: 0,
    maxReplicas: 30,
    initialReplicas: 0,
    utilizationTarget: 0.8,
    scaleDownStabilization: defaultScaleDownStabilization,
    scaleUpCooloffMs: undefined as number | undefined,
    scaleUpBacklogThreshold: undefined as number | undefined,
    maxWorkerLifetimeMs: undefined as number | undefined,
    metricsPollIntervalMs: undefined as number | undefined,
  });

  type Entry = ReturnType<typeof emptyEntry>;

  let primary = $state(untrack(() => emptyEntry(regions[0])));

  /**
   * Replicas inherit the primary's Access and Scaling until customized. Their
   * resource ARN is suggested from the primary's until the user edits it.
   * Every Region still saves a complete scaling group of its own.
   */
  let replicas = $state(
    untrack(() =>
      regions.slice(1).map((region) => ({
        ...emptyEntry(region),
        customized: false,
        lambdaArnOverride: undefined as string | undefined,
        agentCoreEndpointArnOverride: undefined as string | undefined,
      })),
    ),
  );

  type Replica = (typeof replicas)[number];

  const inheritsPrimary = (replica: Replica): boolean => !replica.customized;

  const suggestedFor = (arn: string, replica: Replica): string =>
    suggestRegionalArn(arn, replica.label);

  const replicaLambdaArn = (replica: Replica): string =>
    replica.lambdaArnOverride ?? suggestedFor(primary.lambdaArn, replica);

  const replicaAgentCoreArn = (replica: Replica): string =>
    replica.agentCoreEndpointArnOverride ??
    suggestedFor(primary.agentCoreEndpointArn, replica);

  const isSuggested = (replica: Replica): boolean =>
    provider === 'agentcore'
      ? replica.agentCoreEndpointArnOverride === undefined &&
        !!replicaAgentCoreArn(replica)
      : replica.lambdaArnOverride === undefined && !!replicaLambdaArn(replica);

  const INHERITED_FIELDS = [
    'iamRoleArn',
    'roleExternalId',
    'gcpProject',
    'gcpServiceAccount',
    'minReplicas',
    'maxReplicas',
    'initialReplicas',
    'utilizationTarget',
    'scaleDownStabilization',
    'scaleUpCooloffMs',
    'scaleUpBacklogThreshold',
    'maxWorkerLifetimeMs',
    'metricsPollIntervalMs',
  ] as const;

  /** Start the replica's own Access and Scaling from the primary's values. */
  const customize = (replica: Replica) => {
    if (!inheritsPrimary(replica)) return;
    INHERITED_FIELDS.forEach((field) => copyField(primary, replica, field));
    replica.customized = true;
  };

  const copyField = <K extends (typeof INHERITED_FIELDS)[number]>(
    from: Entry,
    to: Entry,
    field: K,
  ) => {
    to[field] = from[field];
  };

  const primaryRegion = $derived(primary.label);

  /** Suggested until the user edits it; previewSlot handles an empty value. */
  const replicaResourceState = (replica: Replica): 'set' | 'suggested' => {
    const edited =
      provider === 'agentcore'
        ? replica.agentCoreEndpointArnOverride !== undefined
        : replica.lambdaArnOverride !== undefined;
    return edited || provider === 'cloud-run' ? 'set' : 'suggested';
  };

  const previewRegions = $derived<PreviewRegion[]>([
    regionPreview(regions[0], provider, primary),
    ...replicas.map((replica, index) => {
      const fields = {
        ...replica,
        lambdaArn: replicaLambdaArn(replica),
        agentCoreEndpointArn: replicaAgentCoreArn(replica),
      };
      const own = regionPreview(regions[index + 1], provider, fields);
      const resource = resourceValue(provider, fields);
      return {
        ...own,
        resource: previewSlot(resource, replicaResourceState(replica)),
        access: inheritsPrimary(replica)
          ? { value: '', state: 'inherited' as const }
          : own.access,
      };
    }),
  ]);
  /**
   * What a region saves. A replica that has not been customized takes the
   * primary's Access and Scaling. Its resource stays its own, because the
   * resource is regional.
   */
  const formValues = (
    settings: Entry,
    resource: Pick<
      Entry,
      'lambdaArn' | 'agentCoreEndpointArn' | 'gcpRegion' | 'gcpWorkerPool'
    >,
  ): ComputeFormValues => ({
    provider,
    lambdaArn: resource.lambdaArn,
    agentCoreEndpointArn: resource.agentCoreEndpointArn,
    gcpRegion: resource.gcpRegion,
    gcpWorkerPool: resource.gcpWorkerPool,
    iamRoleArn: settings.iamRoleArn,
    roleExternalId: settings.roleExternalId,
    gcpProject: settings.gcpProject,
    gcpServiceAccount: settings.gcpServiceAccount,
    minReplicas: settings.minReplicas,
    maxReplicas: settings.maxReplicas,
    initialReplicas: settings.initialReplicas,
    utilizationTarget: settings.utilizationTarget,
    scaleDownStabilization: settings.scaleDownStabilization,
    scaleUpCooloffMs: settings.scaleUpCooloffMs,
    scaleUpBacklogThreshold: settings.scaleUpBacklogThreshold,
    maxWorkerLifetimeMs: settings.maxWorkerLifetimeMs,
    metricsPollIntervalMs: settings.metricsPollIntervalMs,
  });

  const savedValues = $derived<RegionComputeValues[]>([
    { regionId: primary.regionId, values: formValues(primary, primary) },
    ...replicas.map((replica) => ({
      regionId: replica.regionId,
      values: formValues(inheritsPrimary(replica) ? primary : replica, {
        lambdaArn: replicaLambdaArn(replica),
        agentCoreEndpointArn: replicaAgentCoreArn(replica),
        gcpRegion: replica.gcpRegion,
        gcpWorkerPool: replica.gcpWorkerPool,
      }),
    })),
  ]);

  $effect(() => {
    regionValues = savedValues;
  });
</script>

{#snippet regionFields(entry: Entry)}
  <ComputeFields
    {provider}
    leadingDivider={false}
    idPrefix={entry.regionId}
    lambdaArnPlaceholder={lambdaArnPlaceholderFor(entry.label)}
    bind:lambdaArn={entry.lambdaArn}
    bind:agentCoreEndpointArn={entry.agentCoreEndpointArn}
    bind:iamRoleArn={entry.iamRoleArn}
    bind:roleExternalId={entry.roleExternalId}
    bind:gcpProject={entry.gcpProject}
    bind:gcpRegion={entry.gcpRegion}
    bind:gcpWorkerPool={entry.gcpWorkerPool}
    bind:gcpServiceAccount={entry.gcpServiceAccount}
    bind:minReplicas={entry.minReplicas}
    bind:maxReplicas={entry.maxReplicas}
    bind:initialReplicas={entry.initialReplicas}
    bind:utilizationTarget={entry.utilizationTarget}
    bind:scaleDownStabilization={entry.scaleDownStabilization}
    bind:scaleUpCooloffMs={entry.scaleUpCooloffMs}
    bind:scaleUpBacklogThreshold={entry.scaleUpBacklogThreshold}
    bind:maxWorkerLifetimeMs={entry.maxWorkerLifetimeMs}
    bind:metricsPollIntervalMs={entry.metricsPollIntervalMs}
    errors={regionErrors[entry.regionId]}
  />
{/snippet}

<div>
  <ComputeProviderPicker
    layout="summary"
    bind:provider
    providers={computeProviders}
  />

  <hr class="my-5 border-primary" />

  <RegionsHeading {namespace} {regions} />
  <FailoverPreview
    {namespace}
    {provider}
    regions={previewRegions}
    {deploymentName}
    {buildId}
  />

  <div class="flex flex-col gap-4">
    <RegionBlock
      region={regions[0]}
      showRole
      roleTooltip={translate('workers.region-role-primary-tooltip', {
        region: primaryRegion,
      })}
    >
      {@render regionFields(primary)}
    </RegionBlock>

    {#each replicas as replica, index (replica.regionId)}
      <RegionBlock
        region={regions[index + 1]}
        showRole
        roleTooltip={translate('workers.region-role-replica-tooltip', {
          region: replica.label,
        })}
      >
        <ComputeFields
          {provider}
          leadingDivider={false}
          sections={['resource']}
          idPrefix={replica.regionId}
          lambdaArnPlaceholder={lambdaArnPlaceholderFor(replica.label)}
          bind:lambdaArn={
            () => replicaLambdaArn(replica),
            (value) => (replica.lambdaArnOverride = value)
          }
          bind:agentCoreEndpointArn={
            () => replicaAgentCoreArn(replica),
            (value) => (replica.agentCoreEndpointArnOverride = value)
          }
          bind:iamRoleArn={replica.iamRoleArn}
          bind:roleExternalId={replica.roleExternalId}
          bind:gcpProject={replica.gcpProject}
          bind:gcpRegion={replica.gcpRegion}
          bind:gcpWorkerPool={replica.gcpWorkerPool}
          bind:gcpServiceAccount={replica.gcpServiceAccount}
          bind:minReplicas={replica.minReplicas}
          bind:maxReplicas={replica.maxReplicas}
          bind:initialReplicas={replica.initialReplicas}
          bind:utilizationTarget={replica.utilizationTarget}
          bind:scaleDownStabilization={replica.scaleDownStabilization}
          bind:scaleUpCooloffMs={replica.scaleUpCooloffMs}
          bind:scaleUpBacklogThreshold={replica.scaleUpBacklogThreshold}
          bind:maxWorkerLifetimeMs={replica.maxWorkerLifetimeMs}
          bind:metricsPollIntervalMs={replica.metricsPollIntervalMs}
          errors={regionErrors[replica.regionId]}
        />
        {#if isSuggested(replica)}
          <p class="mt-2 text-xs text-secondary">
            {translate('workers.region-arn-suggested')}
            <span class="font-medium text-primary">{primaryRegion}</span>
            {translate('workers.region-arn-suggested-hint')}
            <span class="font-medium text-primary">{replica.label}</span>.
          </p>
        {/if}
        {#if inheritsPrimary(replica)}
          <hr class="my-5 border-primary" />
          <div class="flex flex-col items-start gap-3">
            <p class="text-sm text-secondary">
              {translate('workers.region-inherits-primary')}
              <span class="font-medium text-primary">{primaryRegion}</span>
            </p>
            <Button
              variant="tertiary"
              size="sm"
              onclick={() => customize(replica)}
            >
              {translate('workers.region-customize')}
            </Button>
          </div>
        {:else}
          <ComputeFields
            {provider}
            sections={['access', 'scaling']}
            idPrefix={replica.regionId}
            bind:lambdaArn={
              () => replicaLambdaArn(replica),
              (value) => (replica.lambdaArnOverride = value)
            }
            bind:agentCoreEndpointArn={
              () => replicaAgentCoreArn(replica),
              (value) => (replica.agentCoreEndpointArnOverride = value)
            }
            bind:iamRoleArn={replica.iamRoleArn}
            bind:roleExternalId={replica.roleExternalId}
            bind:gcpProject={replica.gcpProject}
            bind:gcpRegion={replica.gcpRegion}
            bind:gcpWorkerPool={replica.gcpWorkerPool}
            bind:gcpServiceAccount={replica.gcpServiceAccount}
            bind:minReplicas={replica.minReplicas}
            bind:maxReplicas={replica.maxReplicas}
            bind:initialReplicas={replica.initialReplicas}
            bind:utilizationTarget={replica.utilizationTarget}
            bind:scaleDownStabilization={replica.scaleDownStabilization}
            bind:scaleUpCooloffMs={replica.scaleUpCooloffMs}
            bind:scaleUpBacklogThreshold={replica.scaleUpBacklogThreshold}
            bind:maxWorkerLifetimeMs={replica.maxWorkerLifetimeMs}
            bind:metricsPollIntervalMs={replica.metricsPollIntervalMs}
            errors={regionErrors[replica.regionId]}
          />
        {/if}
      </RegionBlock>
    {/each}
  </div>
</div>
