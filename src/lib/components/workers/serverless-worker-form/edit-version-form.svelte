<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import { translate } from '$lib/i18n/translate';

  import { type EditVersionFormData, editVersionSchema } from './shared';

  import ComputeFields from './compute-fields.svelte';
  import ComputeProviderPicker from './compute-provider-picker.svelte';

  interface Props {
    initialData: {
      lambdaArn: string;
      iamRoleArn: string;
      roleExternalId: string;
      scaleUpCooloffMs?: number;
      scaleUpBacklogThreshold?: number;
      maxWorkerLifetimeMs?: number;
      metricsPollIntervalMs?: number;
    };
    onSubmit: (data: EditVersionFormData) => Promise<void>;
    onDelete: () => void;
    cancelHref: string;
    error?: string;
  }

  let { initialData, onSubmit, onDelete, cancelHref, error }: Props = $props();

  let provider = $state('lambda');

  const superform = superForm(
    {
      lambdaArn: initialData.lambdaArn,
      iamRoleArn: initialData.iamRoleArn,
      roleExternalId: initialData.roleExternalId ?? '',
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

<div class="flex flex-col gap-6">
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

    <div class="flex items-center justify-between">
      <div class="flex gap-4">
        <Button type="submit" loading={$submitting}
          >{translate('common.save')}</Button
        >
        <Button variant="ghost" href={cancelHref}
          >{translate('common.cancel')}</Button
        >
      </div>
      <Button variant="destructive" type="button" on:click={() => onDelete()}>
        {translate('common.delete')}
      </Button>
    </div>
  </form>
</div>
