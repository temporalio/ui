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
    type ComputeProviderOption,
    type CreateDeploymentFormData,
    createDeploymentSchema,
    getInitialComputeProvider,
  } from './shared';

  import ComputeFields from './compute-fields.svelte';
  import ComputeProviderPicker from './compute-provider-picker.svelte';

  interface SubmitFieldErrors {
    lambdaArn?: string[];
    iamRoleArn?: string[];
  }

  interface Props {
    onSubmit: (
      data: CreateDeploymentFormData,
    ) => Promise<SubmitFieldErrors | void>;
    onSuccess: () => void;
    cancelHref: string;
    cfnTemplateUrl?: string;
    cfnTemplate?: string;
    computeProviders?: readonly ComputeProviderOption[];
    gcpRegions?: string[];
  }

  let {
    onSubmit,
    onSuccess,
    cancelHref,
    cfnTemplateUrl,
    cfnTemplate,
    computeProviders,
    gcpRegions,
  }: Props = $props();

  let error = $state<string | undefined>();

  const superform = superForm(
    {
      name: '',
      buildId: crypto.randomUUID() as string,
      provider: getInitialComputeProvider({
        providers: untrack(() => computeProviders),
      }),
      lambdaArn: '',
      iamRoleArn: '',
      roleExternalId: '',
      gcpProject: '',
      gcpRegion: '',
      gcpWorkerPool: '',
      gcpServiceAccount: '',
      scaleUpCooloffMs: undefined as number | undefined,
      scaleUpBacklogThreshold: undefined as number | undefined,
      maxWorkerLifetimeMs: undefined as number | undefined,
      metricsPollIntervalMs: undefined as number | undefined,
    },
    {
      SPA: true,
      validators: zodClient(createDeploymentSchema),
      resetForm: false,
      dataType: 'json',
      onUpdate: async ({ form }) => {
        if (!form.valid) return;
        error = undefined;
        try {
          const fieldErrors = await onSubmit(form.data);
          if (fieldErrors) {
            if (fieldErrors.lambdaArn)
              form.errors.lambdaArn = fieldErrors.lambdaArn;
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

<div class="flex max-w-[45rem] flex-col gap-4">
  <form class="flex flex-col gap-4" use:enhance novalidate>
    <Card class="p-5">
      <h2 class="mb-1 text-base font-medium">
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
      <h2 class="mb-1 text-base font-medium">
        {translate('workers.compute-provider')}
      </h2>
      <p class="mb-4 text-sm text-secondary">
        {translate('workers.compute-description')}
      </p>
      <ComputeProviderPicker
        bind:provider={$form.provider}
        providers={computeProviders}
      />
      <ComputeFields
        provider={$form.provider}
        bind:lambdaArn={$form.lambdaArn}
        bind:iamRoleArn={$form.iamRoleArn}
        bind:roleExternalId={$form.roleExternalId}
        bind:gcpProject={$form.gcpProject}
        bind:gcpRegion={$form.gcpRegion}
        {gcpRegions}
        bind:gcpWorkerPool={$form.gcpWorkerPool}
        bind:gcpServiceAccount={$form.gcpServiceAccount}
        bind:scaleUpCooloffMs={$form.scaleUpCooloffMs}
        bind:scaleUpBacklogThreshold={$form.scaleUpBacklogThreshold}
        bind:maxWorkerLifetimeMs={$form.maxWorkerLifetimeMs}
        bind:metricsPollIntervalMs={$form.metricsPollIntervalMs}
        {cfnTemplateUrl}
        {cfnTemplate}
        errors={$errors}
      />
    </Card>

    {#if error}
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
