<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';

  import { type CreateVersionFormData, createVersionSchema } from './shared';

  import ComputeProviderPicker from './compute-provider-picker.svelte';

  type Props = {
    deploymentName: string;
    onSubmit: (data: CreateVersionFormData) => Promise<void>;
    cancelHref: string;
    error?: string;
  };

  let {
    deploymentName: _deploymentName,
    onSubmit,
    cancelHref,
    error,
  }: Props = $props();

  let provider = $state('lambda');

  const superform = superForm(
    {
      buildId: '',
      lambdaArn: '',
      iamRoleArn: '',
      maxWorkers: undefined as number | undefined,
      maxConcurrentActivities: undefined as number | undefined,
      maxTaskQueueRate: undefined as number | undefined,
      idleTimeoutSeconds: undefined as number | undefined,
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
    <Card>
      <h3 class="mb-1 text-base font-semibold">
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

    <Card>
      <h3 class="mb-1 text-base font-semibold">
        {translate('workers.compute-section')}
      </h3>
      <p class="mb-4 text-sm text-secondary">
        {translate('workers.compute-description')}
      </p>
      <ComputeProviderPicker bind:provider>
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

          <div class="border-t border-subtle pt-4">
            <h4 class="mb-4 text-sm font-medium">
              {translate('workers.scaling-section')}
            </h4>
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
                type="number"
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
                type="number"
              />
              <Input
                value={$form.maxTaskQueueRate !== undefined
                  ? String($form.maxTaskQueueRate)
                  : ''}
                oninput={(e) => {
                  const val = (e.currentTarget as HTMLInputElement).value;
                  $form.maxTaskQueueRate = val === '' ? undefined : Number(val);
                }}
                id="maxTaskQueueRate"
                name="maxTaskQueueRate"
                label={translate('workers.max-task-queue-rate-label')}
                hintText={translate('workers.max-task-queue-rate-hint')}
                type="number"
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
                type="number"
              />
            </div>
          </div>
        </div>
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
