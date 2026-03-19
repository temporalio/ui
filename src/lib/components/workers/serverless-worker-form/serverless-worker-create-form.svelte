<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

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

  import { type CreateFormData, createSchema } from './shared';

  import ComputeProviderPicker from './compute-provider-picker.svelte';
  import ServerlessWorkerSetupGuide from './serverless-worker-setup-guide.svelte';

  type Props = {
    namespace: string;
    onSubmit: (data: CreateFormData) => Promise<void>;
    cancelHref: string;
    submitButtonText: string;
    error?: string;
  };

  let {
    namespace: _namespace,
    onSubmit,
    cancelHref,
    submitButtonText,
    error,
  }: Props = $props();

  const initialData = {
    name: '',
    lambdaArn: '',
    iamRoleArn: '',
    region: '',
    minInstances: undefined,
    maxInstances: undefined,
  };

  const superform = superForm(initialData, {
    SPA: true,
    validators: zodClient(createSchema),
    resetForm: false,
    dataType: 'json',
    onUpdate: async ({ form }) => {
      if (!form.valid) return;

      const [lambdaResult, iamResult] = await Promise.all([
        validateLambdaArn(form.data.lambdaArn),
        validateIamRole(form.data.iamRoleArn),
      ]);

      if (!lambdaResult?.valid) {
        form.errors.lambdaArn = [
          lambdaResult?.message ??
            translate('workers.validation-function-not-found'),
        ];
        return;
      }

      if (!iamResult?.valid) {
        form.errors.iamRoleArn = [
          iamResult?.message ??
            translate('workers.validation-permissions-missing'),
        ];
        return;
      }

      onSubmit(form.data);
    },
  });

  const { form, errors, enhance, submitting } = superform;

  let showScaling = $state(false);
</script>

<div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
  <div class="col-span-1 flex flex-col gap-6 xl:col-span-2">
    <form class="flex w-full flex-col gap-6" use:enhance novalidate>
      <Card>
        <h3 class="mb-1 text-base font-semibold">
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
            hintText={$errors.name?.[0] || translate('workers.name-hint')}
            error={!!$errors.name?.[0]}
            placeholder={translate('workers.name-placeholder')}
            required
          />
        </div>
      </Card>

      <Card>
        <h3 class="mb-1 text-base font-semibold">
          {translate('workers.compute-section')}
        </h3>
        <p class="mb-4 text-sm text-secondary">
          {translate('workers.compute-description')}
        </p>
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
              />
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
              />
            </div>

            <div class="border-t border-subtle"></div>

            <Button
              variant="secondary"
              on:click={() => (showScaling = !showScaling)}
            >
              {translate('workers.show-scaling-limits')}
            </Button>

            {#if showScaling}
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
            {/if}
          </div>
        </ComputeProviderPicker>
      </Card>

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
    <Card class="sticky top-16">
      <ServerlessWorkerSetupGuide />
    </Card>
  </div>
</div>
