<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';

  import {
    type CreateDeploymentFormData,
    createDeploymentSchema,
  } from './shared';

  import ComputeFields from './compute-fields.svelte';
  import ComputeProviderPicker from './compute-provider-picker.svelte';
  import ServerlessWorkerSetupGuide from './serverless-worker-setup-guide.svelte';

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
    submitButtonText: string;
    cfnTemplate?: string;
  }

  let {
    onSubmit,
    onSuccess,
    cancelHref,
    submitButtonText,
    cfnTemplate,
  }: Props = $props();

  let error = $state<string | undefined>();

  const initialData = {
    name: '',
    buildId: '1.0.0',
    lambdaArn: '',
    iamRoleArn: '',
    roleExternalId: '',
    scaleUpCooloffMs: undefined as number | undefined,
    scaleUpBacklogThreshold: undefined as number | undefined,
    maxWorkerLifetimeMs: undefined as number | undefined,
    scaleUpDispatchRateEpsilon: undefined as number | undefined,
    metricsPollIntervalMs: undefined as number | undefined,
  };

  const superform = superForm(initialData, {
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
          e instanceof Error ? e.message : translate('common.unexpected-error');
      }
    },
  });

  const { form, errors, enhance, submitting } = superform;
</script>

<div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
  <div class="col-span-1 flex flex-col gap-6 xl:col-span-2">
    <form class="flex w-full flex-col gap-6" use:enhance novalidate>
      <Card class="p-5">
        <h3 class="text-base font-medium">
          {translate('workers.configuration-section')}
        </h3>
        <p class="mb-4 text-sm text-secondary">
          {translate('workers.configuration-description')}
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
            hintText={$errors.buildId?.[0] ||
              translate('workers.build-id-hint')}
            error={!!$errors.buildId?.[0]}
            placeholder="1.0.0"
            required
          />
        </div>
      </Card>

      <Card class="p-5">
        <h3 class="text-base font-medium">
          {translate('workers.compute-section')}
        </h3>
        <p class="mb-4 text-sm text-secondary">
          {translate('workers.compute-description')}
        </p>
        <ComputeProviderPicker>
          <ComputeFields
            bind:lambdaArn={$form.lambdaArn}
            bind:iamRoleArn={$form.iamRoleArn}
            bind:roleExternalId={$form.roleExternalId}
            bind:scaleUpCooloffMs={$form.scaleUpCooloffMs}
            bind:scaleUpBacklogThreshold={$form.scaleUpBacklogThreshold}
            bind:maxWorkerLifetimeMs={$form.maxWorkerLifetimeMs}
            bind:scaleUpDispatchRateEpsilon={$form.scaleUpDispatchRateEpsilon}
            bind:metricsPollIntervalMs={$form.metricsPollIntervalMs}
            errors={$errors}
          />
        </ComputeProviderPicker>
      </Card>

      {#if error}
        <Alert intent="error" title={translate('common.error-occurred')}
          >{error}</Alert
        >
      {/if}

      <div class="flex gap-4">
        <Button type="submit" loading={$submitting}>
          {submitButtonText}
        </Button>
        <Button variant="ghost" href={cancelHref}>
          {translate('common.cancel')}
        </Button>
      </div>
    </form>
  </div>

  <div class="col-span-1 hidden xl:block">
    <Card class="surface-information sticky top-16">
      <ServerlessWorkerSetupGuide {cfnTemplate} />
    </Card>
  </div>
</div>
