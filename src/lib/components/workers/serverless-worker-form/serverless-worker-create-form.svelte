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
    type CreateDeploymentFormData,
    createDeploymentSchema,
  } from './shared';

  import ComputeProviderPicker from './compute-provider-picker.svelte';
  import ServerlessWorkerSetupGuide from './serverless-worker-setup-guide.svelte';

  type Props = {
    namespace: string;
    onSubmit: (data: CreateDeploymentFormData) => Promise<void>;
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
    buildId: '1.0.0',
    lambdaArn: '',
    iamRoleArn: '',
    maxWorkers: undefined as number | undefined,
    maxConcurrentActivities: undefined as number | undefined,
    maxTaskQueueRate: undefined as number | undefined,
    idleTimeoutSeconds: undefined as number | undefined,
  };

  const superform = superForm(initialData, {
    SPA: true,
    validators: zodClient(createDeploymentSchema),
    resetForm: false,
    dataType: 'json',
    onUpdate: async ({ form }) => {
      if (!form.valid) return;
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
                  value={$form.maxWorkers !== undefined
                    ? String($form.maxWorkers)
                    : ''}
                  oninput={(e) => {
                    const val = (e.currentTarget as HTMLInputElement).value;
                    $form.maxWorkers = val === '' ? undefined : Number(val);
                  }}
                  id="maxWorkers"
                  name="maxWorkers"
                  label={translate('workers.max-workers-label')}
                  hintText={translate('workers.max-workers-hint')}
                />
                <Input
                  value={$form.maxConcurrentActivities !== undefined
                    ? String($form.maxConcurrentActivities)
                    : ''}
                  oninput={(e) => {
                    const val = (e.currentTarget as HTMLInputElement).value;
                    $form.maxConcurrentActivities =
                      val === '' ? undefined : Number(val);
                  }}
                  id="maxConcurrentActivities"
                  name="maxConcurrentActivities"
                  label={translate('workers.max-concurrent-activities-label')}
                  hintText={translate('workers.max-concurrent-activities-hint')}
                />
                <Input
                  value={$form.maxTaskQueueRate !== undefined
                    ? String($form.maxTaskQueueRate)
                    : ''}
                  oninput={(e) => {
                    const val = (e.currentTarget as HTMLInputElement).value;
                    $form.maxTaskQueueRate =
                      val === '' ? undefined : Number(val);
                  }}
                  id="maxTaskQueueRate"
                  name="maxTaskQueueRate"
                  label={translate('workers.max-task-queue-rate-label')}
                  hintText={translate('workers.max-task-queue-rate-hint')}
                />
                <Input
                  value={$form.idleTimeoutSeconds !== undefined
                    ? String($form.idleTimeoutSeconds)
                    : ''}
                  oninput={(e) => {
                    const val = (e.currentTarget as HTMLInputElement).value;
                    $form.idleTimeoutSeconds =
                      val === '' ? undefined : Number(val);
                  }}
                  id="idleTimeoutSeconds"
                  name="idleTimeoutSeconds"
                  label={translate('workers.idle-timeout-label')}
                  hintText={translate('workers.idle-timeout-hint')}
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
