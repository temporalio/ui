<script lang="ts">
  import { untrack } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';

  import {
    type ComputeProviderTemplates,
    type ComputeProviderValue,
  } from './compute-providers';
  import {
    type ComputeRegion,
    lambdaArnPlaceholderFor,
    regionPreview,
    regionServerErrors,
  } from './multi-region';
  import {
    type ComputeFieldErrors,
    type ComputeProviderOption,
    type CreateDeploymentFormData,
    createDeploymentSchema,
    defaultScaleDownStabilization,
    getInitialComputeProvider,
    multiRegionCreateDeploymentSchema,
    type RegionComputeValues,
    validateRegionValues,
  } from './shared';

  import CloudRunLatencyNotice from './cloud-run-latency-notice.svelte';
  import ComputeFields from './compute-fields.svelte';
  import ComputeProviderPerRegion from './compute-provider-per-region.svelte';
  import ComputeProviderPicker from './compute-provider-picker.svelte';
  import FailoverPreview from './failover-preview.svelte';
  import RegionBlock from './region-block.svelte';
  import RegionsHeading from './regions-heading.svelte';

  interface SubmitFieldErrors {
    lambdaArn?: string[];
    agentCoreEndpointArn?: string[];
    iamRoleArn?: string[];
  }

  interface Props {
    onSubmit: (
      data: CreateDeploymentFormData,
      regions?: RegionComputeValues[],
    ) => Promise<SubmitFieldErrors | void>;
    onSuccess: () => void;
    cancelHref: string;
    templates?: Record<ComputeProviderValue, ComputeProviderTemplates>;
    computeProviders?: readonly ComputeProviderOption[];
    gcpRegions?: string[];
    /**
     * Regions this namespace runs in. When more than one is provided (a highly
     * available namespace), the form collects a compute provider per region.
     */
    regions?: readonly ComputeRegion[];
    /** Namespace name, shown in the multi-region heading. */
    namespace?: string;
  }

  let {
    onSubmit,
    onSuccess,
    cancelHref,
    templates,
    computeProviders,
    gcpRegions,
    regions,
    namespace = '',
  }: Props = $props();

  let error = $state<string | undefined>();

  /** High availability is offered when the Namespace has a replica. */
  const offersHighAvailability = $derived(
    !!regions?.some(({ role }) => role === 'replica'),
  );

  let regionValues = $state<RegionComputeValues[]>([]);
  let regionErrors = $state<Record<string, ComputeFieldErrors>>({});

  /** A server error that names a region shows in that region's block. */
  const errorsByRegion = $derived(regionServerErrors(error, regions));
  const errorInRegion = $derived(Object.keys(errorsByRegion).length > 0);

  const superform = superForm(
    {
      name: '',
      buildId: crypto.randomUUID() as string,
      provider: getInitialComputeProvider({
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
      validators: zodClient(
        untrack(() => offersHighAvailability)
          ? multiRegionCreateDeploymentSchema
          : createDeploymentSchema,
      ),
      resetForm: false,
      dataType: 'json',
      onUpdate: async ({ form }) => {
        if (!form.valid) return;
        error = undefined;
        if (offersHighAvailability) {
          regionErrors = validateRegionValues(regionValues);
          if (Object.keys(regionErrors).length) return;
        }
        try {
          // Without high availability the one region saves what a
          // single-region Version saves.
          const replicated = offersHighAvailability && regionValues.length > 1;
          const fieldErrors = await onSubmit(
            offersHighAvailability && !replicated
              ? { ...form.data, ...regionValues[0]?.values }
              : form.data,
            replicated ? regionValues : undefined,
          );
          if (fieldErrors) {
            if (fieldErrors.lambdaArn)
              form.errors.lambdaArn = fieldErrors.lambdaArn;
            if (fieldErrors.agentCoreEndpointArn)
              form.errors.agentCoreEndpointArn =
                fieldErrors.agentCoreEndpointArn;
            if (fieldErrors.iamRoleArn)
              form.errors.iamRoleArn = fieldErrors.iamRoleArn;
            return;
          }
          await onSuccess();
          return { type: 'success' as const };
        } catch (e) {
          error =
            e instanceof Error
              ? e.message
              : translate('common.unexpected-error');
        }
      },
    },
  );

  const { form, errors, enhance, submitting } = superform;
</script>

<div class="relative flex max-w-[45rem] flex-col gap-4">
  <form class="flex flex-col gap-4" use:enhance novalidate>
    <Card class="p-5">
      <h2 class="text-base font-medium">
        {translate('workers.configuration-section')}
      </h2>
      <p class="mb-4 text-sm text-secondary">
        {translate('workers.deployment-configuration-description')}
      </p>
      <div class="flex flex-col gap-4">
        <Input
          bind:value={$form.name}
          id="name"
          name="name"
          label={translate('workers.name-label')}
          hintText={$errors.name?.[0]}
          error={!!$errors.name?.[0]}
          placeholder={translate('workers.name-placeholder')}
          required
        />
        <Input
          bind:value={$form.buildId}
          id="buildId"
          name="buildId"
          label={translate('workers.build-id-label')}
          hintText={$errors.buildId?.[0] || translate('workers.build-id-hint')}
          error={!!$errors.buildId?.[0]}
          placeholder=""
          required
        />
      </div>
    </Card>

    <Card class="p-5">
      <h2 class="text-base font-medium">
        {translate('workers.compute-provider')}
      </h2>
      <p class="mb-4 text-sm text-secondary">
        {translate('workers.compute-description')}
      </p>
      {#if offersHighAvailability && regions}
        <ComputeProviderPerRegion
          {namespace}
          {regions}
          {computeProviders}
          deploymentName={$form.name}
          buildId={$form.buildId}
          bind:regionValues
          {regionErrors}
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
            deploymentName={$form.name}
            buildId={$form.buildId}
          />
        {/if}
        <CloudRunLatencyNotice provider={$form.provider} class="mb-4" />
        <RegionBlock region={regions?.[0]}>
          <ComputeFields
            provider={$form.provider}
            leadingDivider={false}
            lambdaArnPlaceholder={lambdaArnPlaceholderFor(regions?.[0]?.label)}
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

    {#if error && !errorInRegion}
      <Alert intent="error" title={translate('common.error-occurred')}
        >{error}</Alert
      >
    {/if}

    <div class="flex gap-4">
      <Button type="submit" loading={$submitting}>
        {translate('common.create')}
      </Button>
      <Button variant="ghost" href={cancelHref}>
        {translate('common.cancel')}
      </Button>
    </div>
  </form>
</div>
