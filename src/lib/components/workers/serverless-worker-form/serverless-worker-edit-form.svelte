<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

  import CapabilityGuard from '$lib/components/capability-guard.svelte';
  import DeleteWorkerModal from '$lib/components/workers/delete-worker-modal.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    validateIamRole,
    validateLambdaArn,
  } from '$lib/services/serverless-worker-service';
  import type {
    MockValidationResult,
    ServerlessWorker,
  } from '$lib/types/serverless-workers';

  import { type EditFormData, editSchema } from './shared';

  import ComputeProviderPicker from './compute-provider-picker.svelte';

  type ValidationState = { checking: boolean; result?: MockValidationResult };

  type Props = {
    namespace: string;
    worker: ServerlessWorker;
    onSubmit: (data: EditFormData) => void;
    onDelete: () => void;
    cancelHref: string;
    submitButtonText: string;
  };

  let {
    namespace: _namespace,
    worker,
    onSubmit,
    onDelete,
    cancelHref,
    submitButtonText,
  }: Props = $props();

  const initialData = $derived({
    name: worker.name,
    lambdaArn: worker.lambdaArn,
    iamRoleArn: worker.iamRoleArn,
    region: worker.region,
    minInstances: worker.minInstances,
    maxInstances: worker.maxInstances,
  });

  const superform = superForm(initialData, {
    SPA: true,
    validators: zodClient(editSchema),
    resetForm: false,
    dataType: 'json',
    onUpdate: async ({ form }) => {
      if (!form.valid) return;
      onSubmit(form.data);
    },
  });

  const { form, errors, enhance, submitting } = superform;

  let lambdaValidation = $state<ValidationState>({ checking: false });
  let iamValidation = $state<ValidationState>({ checking: false });

  async function checkLambdaArn() {
    const arn = $form.lambdaArn;
    if (!arn || !/^arn:aws:lambda:/.test(arn)) return;
    lambdaValidation = { checking: true };
    const result = await validateLambdaArn(arn);
    lambdaValidation = { checking: false, result };
  }

  async function checkIamRole() {
    const arn = $form.iamRoleArn;
    if (!arn || !/^arn:aws:iam::/.test(arn)) return;
    iamValidation = { checking: true };
    const result = await validateIamRole(arn);
    iamValidation = { checking: false, result };
  }

  let showDeleteModal = $state(false);
</script>

<form class="flex w-full flex-col gap-5" use:enhance novalidate>
  <Card>
    <div class="flex flex-col gap-5">
      <div class="flex flex-col">
        <h3 class="text-base font-medium">
          {translate('workers.configuration-section')}
        </h3>
        <p class="text-sm text-secondary">
          {translate('workers.configuration-description')}
        </p>
      </div>
      <Input
        bind:value={$form.name}
        id="name"
        name="name"
        label={translate('workers.name-label')}
        hintText={$errors.name?.[0] || translate('workers.name-hint')}
        error={!!$errors.name?.[0]}
        placeholder={translate('workers.name-placeholder')}
        required
        class="max-w-xs"
      />
    </div>
  </Card>

  <Card>
    <div class="flex flex-col gap-5">
      <div class="flex flex-col">
        <h3 class="text-base font-medium">
          {translate('workers.compute-section')}
        </h3>
        <p class="text-sm text-secondary">
          {translate('workers.compute-description')}
        </p>
      </div>

      <ComputeProviderPicker>
        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1">
              <label for="lambdaArn" class="text-sm font-medium">
                {translate('workers.lambda-arn-label')}
              </label>
              <Tooltip top text={translate('workers.lambda-arn-help')}>
                <Icon name="circle-question" class="h-4 w-4 text-secondary" />
              </Tooltip>
            </div>
            <Input
              bind:value={$form.lambdaArn}
              id="lambdaArn"
              name="lambdaArn"
              labelHidden
              label={translate('workers.lambda-arn-label')}
              hintText={$errors.lambdaArn?.[0] ||
                translate('workers.lambda-arn-hint')}
              error={!!$errors.lambdaArn?.[0]}
              placeholder={translate('workers.lambda-arn-placeholder')}
              required
              onblur={checkLambdaArn}
            />
            {#if lambdaValidation.checking}
              <div class="flex items-center gap-2 text-xs text-secondary">
                <Icon name="spinner" class="h-3 w-3 animate-spin" />
                <span>{translate('workers.validation-checking-lambda')}</span>
              </div>
            {:else if lambdaValidation.result}
              <p
                class="text-xs"
                class:text-green-600={lambdaValidation.result.valid}
                class:text-danger={!lambdaValidation.result.valid}
              >
                {lambdaValidation.result.message}
              </p>
            {/if}
          </div>

          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1">
              <label for="iamRoleArn" class="text-sm font-medium">
                {translate('workers.iam-role-label')}
              </label>
              <Tooltip top text={translate('workers.iam-role-help')}>
                <Icon name="circle-question" class="h-4 w-4 text-secondary" />
              </Tooltip>
            </div>
            <Input
              bind:value={$form.iamRoleArn}
              id="iamRoleArn"
              name="iamRoleArn"
              labelHidden
              label={translate('workers.iam-role-label')}
              hintText={$errors.iamRoleArn?.[0] ||
                translate('workers.iam-role-hint')}
              error={!!$errors.iamRoleArn?.[0]}
              placeholder={translate('workers.iam-role-placeholder')}
              required
              onblur={checkIamRole}
            />
            {#if iamValidation.checking}
              <div class="flex items-center gap-2 text-xs text-secondary">
                <Icon name="spinner" class="h-3 w-3 animate-spin" />
                <span>{translate('workers.validation-checking-iam')}</span>
              </div>
            {:else if iamValidation.result}
              <p
                class="text-xs"
                class:text-green-600={iamValidation.result.valid}
                class:text-danger={!iamValidation.result.valid}
              >
                {iamValidation.result.message}
              </p>
            {/if}
          </div>

          <div class="border-t border-subtle"></div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              value={$form.minInstances !== undefined
                ? String($form.minInstances)
                : ''}
              oninput={(e) => {
                const val = (e.currentTarget as HTMLInputElement).value;
                $form.minInstances = val === '' ? undefined : Number(val);
              }}
              id="minInstances"
              name="minInstances"
              label={translate('workers.min-instances-label')}
              hintText={translate('workers.min-instances-hint')}
            />
            <Input
              value={$form.maxInstances !== undefined
                ? String($form.maxInstances)
                : ''}
              oninput={(e) => {
                const val = (e.currentTarget as HTMLInputElement).value;
                $form.maxInstances = val === '' ? undefined : Number(val);
              }}
              id="maxInstances"
              name="maxInstances"
              label={translate('workers.max-instances-label')}
              hintText={translate('workers.max-instances-hint')}
            />
          </div>
        </div>
      </ComputeProviderPicker>
    </div>
  </Card>

  <div class="flex items-center justify-between">
    <div class="flex gap-2">
      <Button type="submit" loading={$submitting}>
        {submitButtonText}
      </Button>
      <Button variant="ghost" href={cancelHref}>
        {translate('common.cancel')}
      </Button>
    </div>
    <CapabilityGuard capability="deleteServerlessDeployment">
      <Button variant="destructive" on:click={() => (showDeleteModal = true)}>
        {translate('common.delete')}
      </Button>
    </CapabilityGuard>
  </div>
</form>

<DeleteWorkerModal
  open={showDeleteModal}
  workerName={worker.name}
  on:confirmModal={onDelete}
  on:cancelModal={() => (showDeleteModal = false)}
/>
