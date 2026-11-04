<script lang="ts">
  import { untrack } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import { translate } from '$lib/i18n/translate';

  import { type ComputeProviderTemplates } from './compute-providers';
  import { revealFirstProblem } from './motion';
  import {
    type ComputeRegion,
    lambdaArnPlaceholderFor,
    regionPreview,
    regionServerErrors,
  } from './multi-region';
  import {
    type ComputeFieldErrors,
    type ComputeInitialValues,
    type ComputeProviderOption,
    type ComputeProviderValue,
    defaultScaleDownStabilization,
    type EditVersionFormData,
    editVersionSchema,
    getInitialComputeProvider,
    multiRegionEditVersionSchema,
    type RegionComputeValues,
    validateRegionValues,
  } from './shared';

  import ComputeFields from './compute-fields.svelte';
  import ComputeProviderPerRegion from './compute-provider-per-region.svelte';
  import ComputeProviderPicker from './compute-provider-picker.svelte';
  import FailoverPreview from './failover-preview.svelte';
  import RegionBlock from './region-block.svelte';
  import RegionsHeading from './regions-heading.svelte';

  interface Props {
    initialData: ComputeInitialValues;
    /** The replica's saved values, when the Version has a replica group. */
    initialReplicaData?: ComputeInitialValues;
    /** Replica regions that already have a group, so high availability starts on. */
    enabledRegionIds?: readonly string[];
    onSubmit: (
      data: EditVersionFormData,
      regions?: RegionComputeValues[],
    ) => Promise<void>;
    onDelete: () => void;
    cancelHref: string;
    error?: string;
    computeProviders?: readonly ComputeProviderOption[];
    gcpRegions?: string[];
    /**
     * The templates offered per provider. Defaults to the ones bundled here,
     * which is what a self-hosted deployment wants. A consumer overrides them
     * by passing a full map: it is exhaustive over ComputeProviderValue, so
     * adding a provider fails the consumer's type check until it supplies
     * templates for it.
     */
    templates?: Record<ComputeProviderValue, ComputeProviderTemplates>;
    /**
     * Regions this namespace runs in. When more than one is provided (a highly
     * available namespace), the form edits a compute provider per region.
     */
    regions?: readonly ComputeRegion[];
    /** Namespace name, shown in the multi-region heading. */
    namespace?: string;
    /** The Worker Deployment this version belongs to, shown in the preview. */
    deploymentName?: string;
    /** The version being edited, shown in the preview. */
    buildId?: string;
  }

  let {
    initialData,
    initialReplicaData,
    enabledRegionIds = [],
    onSubmit,
    onDelete,
    cancelHref,
    error,
    computeProviders,
    gcpRegions,
    templates,
    regions,
    namespace = '',
    deploymentName,
    buildId,
  }: Props = $props();

  /** High availability is offered when the Namespace has a replica. */
  const offersHighAvailability = $derived(
    !!regions?.some(({ role }) => role === 'replica'),
  );

  let regionValues = $state<RegionComputeValues[]>([]);
  let regionErrors = $state<Record<string, ComputeFieldErrors>>({});

  /** A server error that names a region shows in that region's block. */
  const errorsByRegion = $derived(regionServerErrors(error, regions));

  let formRoot = $state<HTMLElement>();

  // A server error can land in a region card far above the submit button.
  $effect(() => {
    if (error) untrack(() => revealFirstProblem(formRoot));
  });
  const errorInRegion = $derived(Object.keys(errorsByRegion).length > 0);

  const superform = superForm(
    {
      provider: getInitialComputeProvider({
        provider: initialData.provider ?? 'lambda',
        providers: untrack(() => computeProviders),
      }),
      lambdaArn: initialData.lambdaArn,
      agentCoreEndpointArn: initialData.agentCoreEndpointArn ?? '',
      iamRoleArn: initialData.iamRoleArn,
      roleExternalId: initialData.roleExternalId ?? '',
      gcpProject: initialData.gcpProject ?? '',
      gcpRegion: initialData.gcpRegion ?? '',
      gcpWorkerPool: initialData.gcpWorkerPool ?? '',
      gcpServiceAccount: initialData.gcpServiceAccount ?? '',
      minReplicas: initialData.minReplicas ?? 0,
      maxReplicas: initialData.maxReplicas ?? 30,
      initialReplicas: initialData.initialReplicas ?? 0,
      utilizationTarget: initialData.utilizationTarget ?? 0.8,
      scaleDownStabilization:
        initialData.scaleDownStabilization ?? defaultScaleDownStabilization,
      scaleUpCooloffMs: initialData.scaleUpCooloffMs,
      scaleUpBacklogThreshold: initialData.scaleUpBacklogThreshold,
      maxWorkerLifetimeMs: initialData.maxWorkerLifetimeMs,
      metricsPollIntervalMs: initialData.metricsPollIntervalMs,
    },
    {
      SPA: true,
      validators: zodClient(
        untrack(() => offersHighAvailability)
          ? multiRegionEditVersionSchema
          : editVersionSchema,
      ),
      resetForm: false,
      dataType: 'json',
      onUpdate: async ({ form }) => {
        if (!form.valid) return;
        if (offersHighAvailability) {
          regionErrors = validateRegionValues(regionValues);
          if (Object.keys(regionErrors).length) {
            revealFirstProblem(formRoot);
            return;
          }
          // Always the regions: with high availability off the page still has
          // to remove a replica group the Version had.
          await onSubmit(form.data, regionValues);
          return;
        }
        await onSubmit(form.data);
      },
    },
  );

  const { form, errors, enhance, submitting } = superform;
</script>

<div class="relative flex max-w-[45rem] flex-col gap-6" bind:this={formRoot}>
  {#if error && !errorInRegion}
    <Alert intent="error" title={translate('common.error-occurred')}
      >{error}</Alert
    >
  {/if}
  <form class="flex flex-col gap-6" use:enhance novalidate>
    <Card class="p-5">
      <h3 class="text-base font-medium">
        {translate('workers.compute-section')}
      </h3>
      <p class="mb-4 text-sm text-secondary">
        {translate('workers.compute-description')}
      </p>
      {#if offersHighAvailability && regions}
        <ComputeProviderPerRegion
          {namespace}
          {regions}
          {computeProviders}
          {deploymentName}
          {buildId}
          bind:regionValues
          {regionErrors}
          {enabledRegionIds}
          initialPrimary={initialData}
          initialReplica={initialReplicaData}
          regionServerErrors={errorsByRegion}
        />
      {:else}
        <ComputeProviderPicker
          layout="summary"
          bind:provider={$form.provider}
          providers={computeProviders}
        />
        <hr class="my-5 border-primary" />
        {#if regions?.[0]}
          <RegionsHeading regions={regions.slice(0, 1)} />
          <FailoverPreview
            {namespace}
            provider={$form.provider}
            regions={[regionPreview(regions[0], $form.provider, $form)]}
            {deploymentName}
            {buildId}
          />
        {/if}
        <RegionBlock region={regions?.[0]}>
          <ComputeFields
            provider={$form.provider}
            leadingDivider={false}
            lambdaArnPlaceholder={lambdaArnPlaceholderFor(
              regions?.[0]?.providerRegion,
            )}
            bind:lambdaArn={$form.lambdaArn}
            bind:agentCoreEndpointArn={$form.agentCoreEndpointArn}
            bind:iamRoleArn={$form.iamRoleArn}
            bind:roleExternalId={$form.roleExternalId}
            bind:gcpProject={$form.gcpProject}
            bind:gcpRegion={$form.gcpRegion}
            {gcpRegions}
            bind:gcpWorkerPool={$form.gcpWorkerPool}
            bind:gcpServiceAccount={$form.gcpServiceAccount}
            bind:minReplicas={$form.minReplicas}
            bind:maxReplicas={$form.maxReplicas}
            bind:initialReplicas={$form.initialReplicas}
            bind:utilizationTarget={$form.utilizationTarget}
            bind:scaleDownStabilization={$form.scaleDownStabilization}
            bind:scaleUpCooloffMs={$form.scaleUpCooloffMs}
            bind:scaleUpBacklogThreshold={$form.scaleUpBacklogThreshold}
            bind:maxWorkerLifetimeMs={$form.maxWorkerLifetimeMs}
            bind:metricsPollIntervalMs={$form.metricsPollIntervalMs}
            {templates}
            errors={$errors}
          />
        </RegionBlock>
      {/if}
    </Card>

    <div class="flex items-center justify-between">
      <div class="flex gap-4">
        <Button type="submit" loading={$submitting}
          >{translate('common.save')}</Button
        >
        <Button variant="ghost" href={cancelHref}
          >{translate('common.cancel')}</Button
        >
      </div>
      <Button variant="destructive" type="button" onclick={() => onDelete()}>
        {translate('common.delete')}
      </Button>
    </div>
  </form>
</div>
