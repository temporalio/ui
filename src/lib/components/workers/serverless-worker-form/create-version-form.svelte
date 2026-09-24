<script lang="ts">
  import { untrack } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { VersionSummary } from '$lib/types/deployments';
  import { shortRegion } from '$lib/utilities/compute-regions';

  import {
    type ComputeRegion,
    lambdaArnPlaceholderFor,
    regionPreview,
  } from './multi-region';
  import {
    type ComputeProviderOption,
    type CreateVersionFormData,
    createVersionSchema,
    defaultScaleDownStabilization,
    getInitialComputeProvider,
  } from './shared';

  import CloudRunLatencyNotice from './cloud-run-latency-notice.svelte';
  import ComputeFields from './compute-fields.svelte';
  import ComputeProviderPerRegion from './compute-provider-per-region.svelte';
  import ComputeProviderPicker from './compute-provider-picker.svelte';
  import FailoverPreview from './failover-preview.svelte';
  import RecentVersions from './recent-versions.svelte';
  import RegionBlock from './region-block.svelte';
  import RegionsHeading from './regions-heading.svelte';

  interface Props {
    onSubmit: (data: CreateVersionFormData) => Promise<void>;
    cancelHref: string;
    error?: string;
    versions?: VersionSummary[];
    computeProviders?: readonly ComputeProviderOption[];
    initialProvider?: ComputeProviderOption['value'];
    gcpRegions?: string[];
    terraformTemplate?: string;
    cloudRunTerraformTemplate?: string;
    /**
     * Regions this namespace runs in. When more than one is provided (a highly
     * available namespace), the form collects a compute provider per region.
     */
    regions?: readonly ComputeRegion[];
    /** Namespace name, shown in the multi-region heading. */
    namespace?: string;
    /** The Worker Deployment this version belongs to, shown in the preview. */
    deploymentName?: string;
  }

  let {
    onSubmit,
    cancelHref,
    error,
    versions = [],
    computeProviders,
    initialProvider,
    gcpRegions,
    terraformTemplate,
    cloudRunTerraformTemplate,
    regions,
    namespace = '',
    deploymentName,
  }: Props = $props();

  const isMultiRegion = $derived(!!regions && regions.length > 1);

  const superform = superForm(
    {
      buildId: '',
      provider: getInitialComputeProvider({
        provider: untrack(() => initialProvider),
        providers: untrack(() => computeProviders),
      }),
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
    },
    {
      SPA: true,
      validators: zodClient(createVersionSchema),
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
        {translate('workers.configuration-section')}
      </h3>
      <p class="mb-4 text-sm text-secondary">
        {translate('workers.version-configuration-description')}
      </p>
      <Input
        bind:value={$form.buildId}
        id="buildId"
        name="buildId"
        label={translate('workers.build-id-label')}
        hintText={$errors.buildId?.[0] || translate('workers.build-id-hint')}
        error={!!$errors.buildId?.[0]}
        placeholder="1.0.0"
        required
      />
      <RecentVersions {versions} />
    </Card>

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
          {deploymentName}
          buildId={$form.buildId}
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
            buildId={$form.buildId}
          />
        {/if}
        <CloudRunLatencyNotice provider={$form.provider} class="mb-4" />
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

    <div class="flex gap-4">
      <Button type="submit" loading={$submitting}
        >{translate('common.save')}</Button
      >
      <Button variant="ghost" href={cancelHref}
        >{translate('common.cancel')}</Button
      >
    </div>
  </form>
</div>
