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
  let showScaling = $state(false);

  const superform = superForm(
    {
      buildId: '',
      lambdaArn: '',
      iamRoleArn: '',
      roleExternalId: '',
      scaleUpCooloffMs: undefined as number | undefined,
      scaleUpBacklogThreshold: undefined as number | undefined,
      maxWorkerLifetimeMs: undefined as number | undefined,
      scaleUpDispatchRateEpsilon: undefined as number | undefined,
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

          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1">
              <label for="roleExternalId" class="text-sm font-medium">
                {translate('workers.external-id-label')}
              </label>
              <Tooltip top text={translate('workers.external-id-help')}>
                <Icon name="circle-question" class="h-4 w-4 text-secondary" />
              </Tooltip>
            </div>
            <Input
              bind:value={$form.roleExternalId}
              id="roleExternalId"
              name="roleExternalId"
              labelHidden
              label={translate('workers.external-id-label')}
              hintText={$errors.roleExternalId?.[0] ||
                translate('workers.external-id-hint')}
              error={!!$errors.roleExternalId?.[0]}
              placeholder={translate('workers.external-id-placeholder')}
              required
            />
          </div>

          <hr class="border-subtle" />

          <Button
            variant="secondary"
            type="button"
            on:click={() => (showScaling = !showScaling)}
          >
            {showScaling
              ? 'Hide Scaling and Limits'
              : translate('workers.show-scaling-limits')}
          </Button>

          {#if showScaling}
            <Input
              value={$form.scaleUpCooloffMs !== undefined
                ? String($form.scaleUpCooloffMs)
                : ''}
              onchange={(e) => {
                const val = (e.target as HTMLInputElement).value;
                $form.scaleUpCooloffMs = val === '' ? undefined : Number(val);
              }}
              id="scaleUpCooloffMs"
              name="scaleUpCooloffMs"
              label={translate('workers.scale-up-cooloff-ms-label')}
              hintText={$errors.scaleUpCooloffMs?.[0] ||
                translate('workers.scale-up-cooloff-ms-hint')}
              error={!!$errors.scaleUpCooloffMs?.[0]}
              placeholder="100"
            />
            <Input
              value={$form.scaleUpBacklogThreshold !== undefined
                ? String($form.scaleUpBacklogThreshold)
                : ''}
              onchange={(e) => {
                const val = (e.target as HTMLInputElement).value;
                $form.scaleUpBacklogThreshold =
                  val === '' ? undefined : Number(val);
              }}
              id="scaleUpBacklogThreshold"
              name="scaleUpBacklogThreshold"
              label={translate('workers.scale-up-backlog-threshold-label')}
              hintText={$errors.scaleUpBacklogThreshold?.[0] ||
                translate('workers.scale-up-backlog-threshold-hint')}
              error={!!$errors.scaleUpBacklogThreshold?.[0]}
              placeholder="0"
            />
            <Input
              value={$form.maxWorkerLifetimeMs !== undefined
                ? String($form.maxWorkerLifetimeMs)
                : ''}
              onchange={(e) => {
                const val = (e.target as HTMLInputElement).value;
                $form.maxWorkerLifetimeMs =
                  val === '' ? undefined : Number(val);
              }}
              id="maxWorkerLifetimeMs"
              name="maxWorkerLifetimeMs"
              label={translate('workers.max-worker-lifetime-ms-label')}
              hintText={$errors.maxWorkerLifetimeMs?.[0] ||
                translate('workers.max-worker-lifetime-ms-hint')}
              error={!!$errors.maxWorkerLifetimeMs?.[0]}
              placeholder="600000"
            />
            <Input
              value={$form.scaleUpDispatchRateEpsilon !== undefined
                ? String($form.scaleUpDispatchRateEpsilon)
                : ''}
              onchange={(e) => {
                const val = (e.target as HTMLInputElement).value;
                $form.scaleUpDispatchRateEpsilon =
                  val === '' ? undefined : Number(val);
              }}
              id="scaleUpDispatchRateEpsilon"
              name="scaleUpDispatchRateEpsilon"
              label={translate('workers.scale-up-dispatch-rate-epsilon-label')}
              hintText={$errors.scaleUpDispatchRateEpsilon?.[0] ||
                translate('workers.scale-up-dispatch-rate-epsilon-hint')}
              error={!!$errors.scaleUpDispatchRateEpsilon?.[0]}
              placeholder="0"
            />
            <Input
              value={$form.metricsPollIntervalMs !== undefined
                ? String($form.metricsPollIntervalMs)
                : ''}
              onchange={(e) => {
                const val = (e.target as HTMLInputElement).value;
                $form.metricsPollIntervalMs =
                  val === '' ? undefined : Number(val);
              }}
              id="metricsPollIntervalMs"
              name="metricsPollIntervalMs"
              label={translate('workers.metrics-poll-interval-ms-label')}
              hintText={$errors.metricsPollIntervalMs?.[0] ||
                translate('workers.metrics-poll-interval-ms-hint')}
              error={!!$errors.metricsPollIntervalMs?.[0]}
              placeholder="60000"
            />
          {/if}
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
