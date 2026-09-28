<script lang="ts">
  import { untrack } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import { translate } from '$lib/i18n/translate';
  import { shortRegion } from '$lib/utilities/compute-regions';

  import {
    type ComputeRegion,
    lambdaArnPlaceholderFor,
    type RegionCoverageMode,
    regionPreview,
  } from './multi-region';
  import {
    type ComputeProviderOption,
    type ComputeProviderValue,
    defaultScaleDownStabilization,
    type EditVersionFormData,
    editVersionSchema,
    getInitialComputeProvider,
  } from './shared';

  import ComputeFields from './compute-fields.svelte';
  import ComputeProviderPerRegion from './compute-provider-per-region.svelte';
  import ComputeProviderPicker from './compute-provider-picker.svelte';
  import FailoverPreview from './failover-preview.svelte';
  import RegionBlock from './region-block.svelte';
  import RegionsHeading from './regions-heading.svelte';

  interface Props {
    initialData: {
      provider?: ComputeProviderValue;
      lambdaArn: string;
      agentCoreEndpointArn?: string;
      iamRoleArn: string;
      roleExternalId: string;
      gcpProject?: string;
      gcpRegion?: string;
      gcpWorkerPool?: string;
      gcpServiceAccount?: string;
      minReplicas?: number;
      maxReplicas?: number;
      initialReplicas?: number;
      utilizationTarget?: number;
      scaleDownStabilization?: string;
      scaleUpCooloffMs?: number;
      scaleUpBacklogThreshold?: number;
      maxWorkerLifetimeMs?: number;
      metricsPollIntervalMs?: number;
    };
    onSubmit: (data: EditVersionFormData) => Promise<void>;
    onDelete: () => void;
    cancelHref: string;
    error?: string;
    computeProviders?: readonly ComputeProviderOption[];
    gcpRegions?: string[];
    terraformTemplate?: string;
    cloudRunTerraformTemplate?: string;
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
    /** How the existing version covers the namespace's regions. */
    initialRegionMode?: RegionCoverageMode;
  }

  let {
    initialData,
    onSubmit,
    onDelete,
    cancelHref,
    error,
    computeProviders,
    gcpRegions,
    terraformTemplate,
    cloudRunTerraformTemplate,
    regions,
    namespace = '',
    deploymentName,
    buildId,
    initialRegionMode,
  }: Props = $props();

  const isMultiRegion = $derived(!!regions && regions.length > 1);

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
      validators: zodClient(editVersionSchema),
      resetForm: false,
      dataType: 'json',
      onUpdate: async ({ form }) => {
        if (!form.valid) return;
        await onSubmit(form.data);
      },
    },
  );

  const { form, errors, enhance, submitting } = superform;
</script>

<div class="relative flex max-w-[45rem] flex-col gap-6">
  {#if error}
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
      {#if isMultiRegion && regions}
        <ComputeProviderPerRegion
          {namespace}
          {regions}
          {computeProviders}
          initialMode={initialRegionMode}
          {deploymentName}
          {buildId}
        />
      {:else}
        <ComputeProviderPicker
          layout="summary"
          bind:provider={$form.provider}
          providers={computeProviders}
        />
        <hr class="my-5 border-primary" />
        {#if regions?.[0]}
          <RegionsHeading {namespace} {regions} />
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
              regions?.[0] && shortRegion(regions[0].id),
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
            {terraformTemplate}
            {cloudRunTerraformTemplate}
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
