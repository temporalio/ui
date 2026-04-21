<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';

  import { type CreateVersionFormData, createVersionSchema } from './shared';

  import ComputeFields from './compute-fields.svelte';
  import ComputeProviderPicker from './compute-provider-picker.svelte';

  interface Props {
    onSubmit: (data: CreateVersionFormData) => Promise<void>;
    cancelHref: string;
    error?: string;
  }

  let { onSubmit, cancelHref, error }: Props = $props();

  let provider = $state('lambda');

  const superform = superForm(
    {
      buildId: '',
      lambdaArn: '',
      iamRoleArn: '',
      roleExternalId: '',
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

<div class="flex flex-col gap-6">
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
        {translate('workers.configuration-description')}
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
    </Card>

    <Card class="p-5">
      <h3 class="text-base font-medium">
        {translate('workers.compute-section')}
      </h3>
      <p class="mb-4 text-sm text-secondary">
        {translate('workers.compute-description')}
      </p>
      <ComputeProviderPicker bind:provider>
        <ComputeFields
          bind:lambdaArn={$form.lambdaArn}
          bind:iamRoleArn={$form.iamRoleArn}
          bind:roleExternalId={$form.roleExternalId}
          bind:scaleUpCooloffMs={$form.scaleUpCooloffMs}
          bind:scaleUpBacklogThreshold={$form.scaleUpBacklogThreshold}
          bind:maxWorkerLifetimeMs={$form.maxWorkerLifetimeMs}
          bind:metricsPollIntervalMs={$form.metricsPollIntervalMs}
          errors={$errors}
        />
      </ComputeProviderPicker>
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
