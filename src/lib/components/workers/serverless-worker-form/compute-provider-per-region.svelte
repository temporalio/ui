<script lang="ts">
  import { untrack } from 'svelte';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { formatList } from '$lib/i18n/format-list';
  import { translate } from '$lib/i18n/translate';

  import {
    type ComputeRegion,
    lambdaArnPlaceholderFor,
    type PreviewRegion,
    previewSlot,
    regionPreview,
    replicaRegionFor,
    resourceRegion,
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
    /**
     * The Namespace's regions, primary first. Without high availability the
     * compute runs in the primary.
     */
    regions: readonly ComputeRegion[];
    /** Each provider's replicaRegions are the regions high availability offers. */
    computeProviders?: readonly ComputeProviderOption[];
    deploymentName?: string;
    buildId?: string;
    /**
     * Out: the compute each region saves. One entry without high availability,
     * two with it.
     */
    regionValues?: RegionComputeValues[];
    /** Field errors per region, keyed by region id. */
    regionErrors?: Record<string, ComputeFieldErrors>;
    /** A server error that names one region, keyed by region id. */
    regionServerErrors?: Record<string, string>;
    /**
     * A replica region that starts with high availability on, for example
     * because the Version being edited already has a group there. Without
     * one, high availability starts off.
     */
    enabledRegionIds?: readonly string[];
  }

  let {
    namespace,
    regions,
    computeProviders,
    deploymentName,
    buildId,
    regionValues = $bindable([]),
    regionErrors = {},
    regionServerErrors = {},
    enabledRegionIds = [],
  }: Props = $props();

  let provider = $state<ComputeProviderValue>(
    untrack(() => regions[0]?.provider ?? 'lambda'),
  );

  const emptyEntry = () => ({
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

  const primaryRegion = $derived(regions[0]);

  let primary = $state(emptyEntry());

  /**
   * The replica inherits the primary's Access and Scaling until customized.
   * Its resource ARN is suggested from the primary's until the user edits it.
   */
  let replica = $state({
    ...emptyEntry(),
    customized: false,
    lambdaArnOverride: undefined as string | undefined,
    agentCoreEndpointArnOverride: undefined as string | undefined,
  });

  let highAvailability = $state(untrack(() => enabledRegionIds.length > 0));
  /** The region the replica's resource is first suggested in. */
  const preferredReplicaId = untrack(
    () =>
      enabledRegionIds[0] ?? regions.find(({ role }) => role === 'replica')?.id,
  );

  /** The regions the selected provider offers for a replica. */
  const replicaOptions = $derived<ComputeRegion[]>(
    (
      computeProviders?.find(({ value }) => value === provider)
        ?.replicaRegions ?? []
    )
      .filter(({ regionId }) => regionId !== primaryRegion.id)
      .map(({ regionId, label }) => ({
        id: regionId,
        role: 'replica',
        label,
        provider,
      })),
  );

  const suggestedRegion = $derived(
    replicaOptions.find(({ id }) => id === preferredReplicaId) ??
      replicaOptions[0],
  );

  /**
   * A regional resource name needs the provider's own name for the region,
   * which is the label a consumer gives. The id is not one: an ARN naming
   * "aws-us-east-1" is invalid. Without a label, nothing is suggested.
   */
  const suggestFor = (arn: string): string =>
    suggestedRegion?.label
      ? suggestRegionalArn(arn, suggestedRegion.label)
      : '';
  const replicated = $derived(highAvailability && replicaOptions.length > 0);

  const inheritsPrimary = $derived(!replica.customized);

  const replicaLambdaArn = $derived(
    replica.lambdaArnOverride ?? suggestFor(primary.lambdaArn),
  );
  const replicaAgentCoreArn = $derived(
    replica.agentCoreEndpointArnOverride ??
      suggestFor(primary.agentCoreEndpointArn),
  );

  /**
   * The resource decides the region. The replica's group is scoped to the
   * offered region its resource runs in, so the two can never disagree.
   */
  const replicaResourceRegion = $derived(
    resourceRegion(provider, {
      lambdaArn: replicaLambdaArn,
      agentCoreEndpointArn: replicaAgentCoreArn,
      gcpRegion: replica.gcpRegion,
    }),
  );
  const replicaRegion = $derived(
    replicaRegionFor(replicaResourceRegion, replicaOptions),
  );
  const replicaLabel = $derived(
    replicaRegion?.label ?? replicaResourceRegion ?? '',
  );
  /** Errors key a region by id; an unmatched replica has none yet. */
  const replicaKey = $derived(replicaRegion?.id ?? 'replica');

  /** The field that names the resource, and so its region. */
  const resourceField = $derived(
    provider === 'cloud-run'
      ? ('gcpRegion' as const)
      : provider === 'agentcore'
        ? ('agentCoreEndpointArn' as const)
        : ('lambdaArn' as const),
  );

  /** A resource in a region the consumer does not offer as a replica. */
  const replicaRegionError = $derived(
    replicated && replicaResourceRegion && !replicaRegion
      ? translate('workers.replica-region-not-offered', {
          region: replicaResourceRegion,
          regions: formatList(
            replicaOptions.map(({ label, id }) => label ?? id),
            { style: 'long', type: 'disjunction' },
          ),
        })
      : undefined,
  );

  const replicaErrors = $derived<ComputeFieldErrors>({
    ...(replicaRegionError ? { [resourceField]: [replicaRegionError] } : {}),
    ...regionErrors[replicaKey],
  });

  /** Headers name a region only once a resource gives one. */
  const primaryResourceRegion = $derived(resourceRegion(provider, primary));

  const isSuggested = $derived(
    provider === 'agentcore'
      ? replica.agentCoreEndpointArnOverride === undefined &&
          !!replicaAgentCoreArn
      : replica.lambdaArnOverride === undefined && !!replicaLambdaArn,
  );

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

  const copyField = <K extends (typeof INHERITED_FIELDS)[number]>(
    from: Entry,
    to: Entry,
    field: K,
  ) => {
    to[field] = from[field];
  };

  /** Start the replica's own Access and Scaling from the primary's values. */
  const customize = () => {
    if (!inheritsPrimary) return;
    INHERITED_FIELDS.forEach((field) => copyField(primary, replica, field));
    replica.customized = true;
  };

  /**
   * The project is shared across regions, so an inheriting replica shows the
   * primary's. Editing it there starts the replica's own settings.
   */
  const replicaProject = $derived(
    inheritsPrimary ? primary.gcpProject : replica.gcpProject,
  );
  const setReplicaProject = (value: string) => {
    customize();
    replica.gcpProject = value;
  };

  /** Suggested until the user edits it; previewSlot handles an empty value. */
  const replicaResourceState = $derived.by((): 'set' | 'suggested' => {
    const edited =
      provider === 'agentcore'
        ? replica.agentCoreEndpointArnOverride !== undefined
        : replica.lambdaArnOverride !== undefined;
    return edited || provider === 'cloud-run' ? 'set' : 'suggested';
  });

  const replicaFields = $derived({
    ...replica,
    lambdaArn: replicaLambdaArn,
    agentCoreEndpointArn: replicaAgentCoreArn,
  });

  /** The replica as the preview and heading show it: matched, else suggested. */
  const shownReplica = $derived(replicaRegion ?? suggestedRegion);

  const previewRegions = $derived<PreviewRegion[]>([
    regionPreview(primaryRegion, provider, primary),
    ...(replicated && shownReplica
      ? [
          {
            ...regionPreview(shownReplica, provider, replicaFields),
            resource: previewSlot(
              resourceValue(provider, replicaFields),
              replicaResourceState,
            ),
            access: inheritsPrimary
              ? { value: '', state: 'inherited' as const }
              : regionPreview(shownReplica, provider, replicaFields).access,
          },
        ]
      : []),
  ]);

  const shownRegions = $derived(
    replicated && shownReplica
      ? [primaryRegion, shownReplica]
      : [primaryRegion],
  );

  /**
   * What a region saves. An inheriting replica takes the primary's Access and
   * Scaling. Its resource stays its own, because the resource is regional.
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
    {
      regionId: primaryRegion.id,
      values: formValues(primary, primary),
      scoped: false,
    },
    ...(replicated
      ? [
          {
            regionId: replicaKey,
            resourceError: replicaRegionError
              ? { field: resourceField, message: replicaRegionError }
              : undefined,
            values: formValues(inheritsPrimary ? primary : replica, {
              lambdaArn: replicaLambdaArn,
              agentCoreEndpointArn: replicaAgentCoreArn,
              gcpRegion: replica.gcpRegion,
              gcpWorkerPool: replica.gcpWorkerPool,
            }),
          },
        ]
      : []),
  ]);

  $effect(() => {
    regionValues = savedValues;
  });
</script>

{#snippet serverError(regionId: string)}
  {#if regionServerErrors[regionId]}
    <Alert
      intent="error"
      title={translate('common.error-occurred')}
      class="mb-4"
    >
      {regionServerErrors[regionId]}
    </Alert>
  {/if}
{/snippet}

<div>
  <ComputeProviderPicker
    layout="summary"
    bind:provider
    providers={computeProviders}
  />

  <hr class="my-5 border-primary" />

  <!-- Always present, so turning high availability on adds a region to the
  line rather than a heading to the page. -->
  <RegionsHeading regions={shownRegions} />
  <FailoverPreview
    {namespace}
    {provider}
    regions={previewRegions}
    {deploymentName}
    {buildId}
  />

  <div class="flex flex-col gap-4">
    <!-- The primary saves as the unscoped default group, so its only region is
    the one its resource names. The header shows it once there is one. -->
    <RegionBlock
      region={primaryResourceRegion
        ? {
            id: primaryRegion.id,
            role: 'primary',
            label: primaryResourceRegion,
            provider,
          }
        : undefined}
      title={translate('workers.region-role-primary')}
      showRole
    >
      {@render serverError(primaryRegion.id)}
      <ComputeFields
        {provider}
        leadingDivider={false}
        idPrefix={primaryRegion.id}
        lambdaArnPlaceholder={lambdaArnPlaceholderFor(primaryRegion.label)}
        bind:lambdaArn={primary.lambdaArn}
        bind:agentCoreEndpointArn={primary.agentCoreEndpointArn}
        bind:iamRoleArn={primary.iamRoleArn}
        bind:roleExternalId={primary.roleExternalId}
        bind:gcpProject={primary.gcpProject}
        bind:gcpRegion={primary.gcpRegion}
        bind:gcpWorkerPool={primary.gcpWorkerPool}
        bind:gcpServiceAccount={primary.gcpServiceAccount}
        bind:minReplicas={primary.minReplicas}
        bind:maxReplicas={primary.maxReplicas}
        bind:initialReplicas={primary.initialReplicas}
        bind:utilizationTarget={primary.utilizationTarget}
        bind:scaleDownStabilization={primary.scaleDownStabilization}
        bind:scaleUpCooloffMs={primary.scaleUpCooloffMs}
        bind:scaleUpBacklogThreshold={primary.scaleUpBacklogThreshold}
        bind:maxWorkerLifetimeMs={primary.maxWorkerLifetimeMs}
        bind:metricsPollIntervalMs={primary.metricsPollIntervalMs}
        errors={regionErrors[primaryRegion.id]}
      />
    </RegionBlock>

    {#if replicaOptions.length}
      <RegionBlock
        region={replicated && replicaResourceRegion
          ? { id: replicaKey, role: 'replica', label: replicaLabel, provider }
          : undefined}
        title={translate('workers.region-role-replica')}
        showRole
        roleTooltip={translate('workers.region-role-replica-tooltip', {
          region: replicaLabel,
        })}
        bodyClass={highAvailability ? '' : 'py-3'}
      >
        {#snippet action()}
          <ToggleSwitch
            id="high-availability"
            label={translate('workers.high-availability')}
            labelPosition="left"
            bind:checked={highAvailability}
          />
        {/snippet}
        {#if replicated}
          {@render serverError(replicaKey)}
          <ComputeFields
            {provider}
            leadingDivider={false}
            sections={['resource']}
            idPrefix="replica"
            lambdaArnPlaceholder={lambdaArnPlaceholderFor(
              suggestedRegion?.label,
            )}
            bind:lambdaArn={
              () => replicaLambdaArn,
              (value) => (replica.lambdaArnOverride = value)
            }
            bind:agentCoreEndpointArn={
              () => replicaAgentCoreArn,
              (value) => (replica.agentCoreEndpointArnOverride = value)
            }
            bind:iamRoleArn={replica.iamRoleArn}
            bind:roleExternalId={replica.roleExternalId}
            bind:gcpProject={() => replicaProject, setReplicaProject}
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
            errors={replicaErrors}
          />
          {#if isSuggested}
            <p class="mt-2 text-xs text-secondary">
              {translate('workers.region-arn-suggested-from-primary')}
              <span class="font-medium text-primary">{replicaLabel}</span>.
            </p>
          {/if}
          {#if inheritsPrimary}
            <hr class="my-5 border-primary" />
            <div class="flex flex-col items-start gap-3">
              <p class="text-sm text-secondary">
                {translate('workers.region-inherits-primary')}
                {translate('workers.region-the-primary')}
              </p>
              <Button variant="tertiary" size="sm" onclick={customize}>
                {translate('workers.region-customize')}
              </Button>
            </div>
          {:else}
            <ComputeFields
              {provider}
              sections={['access', 'scaling']}
              idPrefix="replica"
              bind:lambdaArn={
                () => replicaLambdaArn,
                (value) => (replica.lambdaArnOverride = value)
              }
              bind:agentCoreEndpointArn={
                () => replicaAgentCoreArn,
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
              errors={replicaErrors}
            />
          {/if}
        {:else}
          <p class="text-sm text-secondary">
            {translate('workers.high-availability-off')}
          </p>
        {/if}
      </RegionBlock>
    {/if}
  </div>
</div>
