<script lang="ts">
  import { fade, slide } from 'svelte/transition';

  import { tick, untrack } from 'svelte';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';

  import { motion } from './motion';
  import {
    type ComputeRegion,
    lambdaArnPlaceholderFor,
    type PreviewRegion,
    previewSlot,
    regionPreview,
    resourceRegion,
    resourceValue,
    suggestRegionalArn,
  } from './multi-region';
  import {
    type ComputeFieldErrors,
    type ComputeFormValues,
    type ComputeInitialValues,
    type ComputeProviderOption,
    type ComputeProviderValue,
    defaultScaleDownStabilization,
    fieldValuesWith,
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
    /** The primary's saved values, when editing. */
    initialPrimary?: ComputeInitialValues;
    /** The replica's saved values, when editing a Version that has one. */
    initialReplica?: ComputeInitialValues;
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
    initialPrimary,
    initialReplica,
  }: Props = $props();

  let provider = $state<ComputeProviderValue>(
    untrack(() => initialPrimary?.provider ?? regions[0]?.provider ?? 'lambda'),
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

  /** An empty entry with whatever saved values there are. */
  const withInitial = (initial: ComputeInitialValues | undefined): Entry => {
    const entry = emptyEntry();
    if (!initial) return entry;
    for (const key of Object.keys(entry) as (keyof Entry)[]) {
      const value = initial[key as keyof ComputeInitialValues];
      if (value !== undefined) (entry as Record<string, unknown>)[key] = value;
    }
    return entry;
  };

  const primaryRegion = $derived(regions[0]);

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

  let primary = $state(untrack(() => withInitial(initialPrimary)));

  /**
   * The replica inherits the primary's Access and Scaling until customized.
   * Its resource ARN is suggested from the primary's until the user edits it.
   */
  let replica = $state(
    untrack(() => {
      const saved = withInitial(initialReplica);
      return {
        ...saved,
        // A saved replica whose settings differ from the primary's has its
        // own, so editing it must not quietly take the primary's.
        customized:
          !!initialReplica &&
          INHERITED_FIELDS.some((field) => saved[field] !== primary[field]),
        lambdaArnOverride: initialReplica?.lambdaArn || undefined,
        agentCoreEndpointArnOverride:
          initialReplica?.agentCoreEndpointArn || undefined,
      };
    }),
  );

  let highAvailability = $state(untrack(() => enabledRegionIds.length > 0));

  /**
   * The Namespace's replica. The replica's group is scoped to it, because the
   * worker controller picks a group by matching its own region, not by trying
   * one resource and falling back to another.
   */
  const replicaRegion = $derived(
    regions.find(({ role }) => role === 'replica'),
  );
  const replicaLabel = $derived(
    replicaRegion ? (replicaRegion.label ?? replicaRegion.id) : '',
  );
  const replicaKey = $derived(replicaRegion?.id ?? 'replica');
  const replicated = $derived(highAvailability && !!replicaRegion);

  /**
   * A regional resource name needs the provider's own name for the region,
   * which the consumer gives. A cluster or region id is not one: an ARN naming
   * "aws-us-east-1" is invalid. Without it, nothing is suggested.
   */
  const suggestFor = (arn: string): string =>
    replicaRegion?.providerRegion
      ? suggestRegionalArn(arn, replicaRegion.providerRegion)
      : '';

  const inheritsPrimary = $derived(!replica.customized);

  const replicaLambdaArn = $derived(
    replica.lambdaArnOverride ?? suggestFor(primary.lambdaArn),
  );
  const replicaAgentCoreArn = $derived(
    replica.agentCoreEndpointArnOverride ??
      suggestFor(primary.agentCoreEndpointArn),
  );

  const replicaResourceRegion = $derived(
    resourceRegion(provider, {
      lambdaArn: replicaLambdaArn,
      agentCoreEndpointArn: replicaAgentCoreArn,
      gcpRegion: replica.gcpRegion,
    }),
  );

  const replicaErrors = $derived<ComputeFieldErrors>(
    regionErrors[replicaKey] ?? {},
  );

  /** Where the primary's resource runs, for the same-region warning. */
  const primaryResourceRegion = $derived(resourceRegion(provider, primary));

  /**
   * Both resources in one region: a regional outage takes both down, so a
   * failover gains nothing. Allowed, because the platform does not require
   * otherwise, but worth saying.
   */
  const sameRegionWarning = $derived(
    replicated &&
      primaryResourceRegion &&
      primaryResourceRegion === replicaResourceRegion
      ? translate('workers.replica-same-region', {
          region: primaryResourceRegion,
        })
      : undefined,
  );

  /**
   * The warning, once the ARN stops changing. Typing an ARN passes through
   * regions on the way, and a warning that comes and goes on each keystroke
   * moves the fields below it.
   */
  let shownSameRegionWarning = $state(untrack(() => sameRegionWarning));
  $effect(() => {
    const next = sameRegionWarning;
    if (next === untrack(() => shownSameRegionWarning)) return;
    const timer = setTimeout(() => (shownSameRegionWarning = next), 400);
    return () => clearTimeout(timer);
  });

  const isSuggested = $derived(
    provider === 'agentcore'
      ? replica.agentCoreEndpointArnOverride === undefined &&
          !!replicaAgentCoreArn
      : replica.lambdaArnOverride === undefined && !!replicaLambdaArn,
  );

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

  let replicaSettings = $state<HTMLElement>();

  /**
   * Customize removes its own button, so focus moves to the first field it
   * reveals rather than falling to the page.
   */
  const customizeAndFocus = async () => {
    customize();
    await tick();
    replicaSettings
      ?.querySelector<HTMLElement>('input, select, textarea')
      ?.focus();
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

  // The replica edits the same fields as the primary, except for the three it
  // derives: its ARN is suggested from the primary's until someone types one,
  // and a write has to land on the override rather than the derived value.
  const replicaValues = fieldValuesWith(replica, {
    lambdaArn: {
      get: () => replicaLambdaArn,
      set: (value) => (replica.lambdaArnOverride = value),
    },
    agentCoreEndpointArn: {
      get: () => replicaAgentCoreArn,
      set: (value) => (replica.agentCoreEndpointArnOverride = value),
    },
    gcpProject: { get: () => replicaProject, set: setReplicaProject },
  });

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

  const previewRegions = $derived<PreviewRegion[]>([
    regionPreview(primaryRegion, provider, primary),
    ...(replicated && replicaRegion
      ? [
          {
            ...regionPreview(replicaRegion, provider, replicaFields),
            resource: previewSlot(
              resourceValue(provider, replicaFields),
              replicaResourceState,
            ),
            access: inheritsPrimary
              ? { value: '', state: 'inherited' as const }
              : regionPreview(replicaRegion, provider, replicaFields).access,
          },
        ]
      : []),
  ]);

  const shownRegions = $derived(
    replicated && replicaRegion
      ? [primaryRegion, replicaRegion]
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
    <!-- With high availability on, the headers name the Namespace regions the
    worker controller runs in, which is what region_ids means and what the
    config saves. A resource's own region does not change them. -->
    <RegionBlock
      region={replicated ? primaryRegion : undefined}
      title={translate('workers.region-role-primary')}
      showRole
    >
      {@render serverError(primaryRegion.id)}
      <!-- A new provider brings new labels (Function, Worker Pool). The fade
      shows the fields changed; a slide would move every field twice. -->
      {#key provider}
        <div in:fade={motion('swap')}>
          <ComputeFields
            {provider}
            leadingDivider={false}
            idPrefix={primaryRegion.id}
            bind:values={primary}
            lambdaArnPlaceholder={lambdaArnPlaceholderFor(
              primaryRegion.providerRegion,
            )}
            errors={regionErrors[primaryRegion.id]}
          />
        </div>
      {/key}
    </RegionBlock>

    {#if replicaRegion}
      <RegionBlock
        region={replicated ? replicaRegion : undefined}
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
        <!-- Each branch grows down from the toggle, so nothing above it moves.
        flow-root keeps the children's margins inside the sliding box. -->
        {#if replicated}
          <div
            class="flow-root"
            in:slide={motion('reveal')}
            out:slide={motion('conceal')}
          >
            {#key provider}
              <div in:fade={motion('swap')}>
                {@render serverError(replicaKey)}
                <ComputeFields
                  {provider}
                  leadingDivider={false}
                  sections={['resource']}
                  idPrefix="replica"
                  bind:values={() => replicaValues, () => {}}
                  lambdaArnPlaceholder={lambdaArnPlaceholderFor(
                    replicaRegion?.providerRegion,
                  )}
                  errors={replicaErrors}
                />
                <!-- Mounted while the replica shows, so a screen reader announces
          the warning when it appears. -->
                <div aria-live="polite">
                  {#if shownSameRegionWarning}
                    <div
                      class="pt-3"
                      in:slide={motion('reveal')}
                      out:slide={motion('conceal')}
                    >
                      <Alert intent="warning" title={shownSameRegionWarning} />
                    </div>
                  {/if}
                </div>
                {#if isSuggested}
                  <p
                    class="mt-2 text-xs text-secondary"
                    in:fade={motion('swap')}
                  >
                    {translate('workers.region-arn-suggested-from-primary')}
                    <span class="font-medium text-primary">{replicaLabel}</span
                    >.
                  </p>
                {/if}
                {#if inheritsPrimary}
                  <hr class="my-5 border-primary" />
                  <div class="flex flex-col items-start gap-3">
                    <p class="text-sm text-secondary">
                      {translate('workers.region-inherits-primary')}
                      {translate('workers.region-the-primary')}
                    </p>
                    <Button
                      variant="tertiary"
                      size="sm"
                      onclick={customizeAndFocus}
                    >
                      {translate('workers.region-customize')}
                    </Button>
                  </div>
                {:else}
                  <div
                    class="flow-root"
                    bind:this={replicaSettings}
                    in:slide={motion('reveal')}
                  >
                    <ComputeFields
                      {provider}
                      sections={['access', 'scaling']}
                      idPrefix="replica"
                      bind:values={() => replicaValues, () => {}}
                      errors={replicaErrors}
                    />
                  </div>
                {/if}
              </div>
            {/key}
          </div>
        {:else}
          <p
            class="text-sm text-secondary"
            in:slide={motion('reveal')}
            out:slide={motion('conceal')}
          >
            {translate('workers.high-availability-off')}
          </p>
        {/if}
      </RegionBlock>
    {/if}
  </div>
</div>
