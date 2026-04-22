<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    lambdaArn: string;
    iamRoleArn: string;
    roleExternalId: string;
    scaleUpCooloffMs?: number;
    scaleUpBacklogThreshold?: number;
    maxWorkerLifetimeMs?: number;
    metricsPollIntervalMs?: number;
    errors?: {
      lambdaArn?: string[];
      iamRoleArn?: string[];
      roleExternalId?: string[];
      scaleUpCooloffMs?: string[];
      scaleUpBacklogThreshold?: string[];
      maxWorkerLifetimeMs?: string[];
      metricsPollIntervalMs?: string[];
    };
  }

  let {
    lambdaArn = $bindable(),
    iamRoleArn = $bindable(),
    roleExternalId = $bindable(),
    scaleUpCooloffMs = $bindable(),
    scaleUpBacklogThreshold = $bindable(),
    maxWorkerLifetimeMs = $bindable(),
    metricsPollIntervalMs = $bindable(),
    errors = {},
  }: Props = $props();

  let showScaling = $state(false);
</script>

<div class="flex flex-col gap-5">
  <Input
    bind:value={lambdaArn}
    id="lambdaArn"
    name="lambdaArn"
    label={translate('workers.lambda-arn-label')}
    hintText={errors.lambdaArn?.[0] || translate('workers.lambda-arn-hint')}
    error={!!errors.lambdaArn?.[0]}
    placeholder={translate('workers.lambda-arn-placeholder')}
    required
  />

  <Input
    bind:value={iamRoleArn}
    id="iamRoleArn"
    name="iamRoleArn"
    label={translate('workers.iam-role-label')}
    hintText={errors.iamRoleArn?.[0] || translate('workers.iam-role-hint')}
    error={!!errors.iamRoleArn?.[0]}
    placeholder={translate('workers.iam-role-placeholder')}
    required
  />

  <Input
    bind:value={roleExternalId}
    id="roleExternalId"
    name="roleExternalId"
    label={translate('workers.external-id-label')}
    hintText={errors.roleExternalId?.[0] ||
      translate('workers.external-id-hint')}
    error={!!errors.roleExternalId?.[0]}
    placeholder={translate('workers.external-id-placeholder')}
    required
  />

  <hr class="border-subtle" />

  <Button
    variant="secondary"
    size="sm"
    type="button"
    trailingIcon={showScaling ? 'chevron-up' : 'chevron-down'}
    on:click={() => (showScaling = !showScaling)}
  >
    {showScaling
      ? translate('workers.hide-scaling-limits')
      : translate('workers.show-scaling-limits')}
  </Button>

  {#if showScaling}
    <Input
      value={scaleUpCooloffMs !== undefined ? String(scaleUpCooloffMs) : ''}
      onchange={(e) => {
        const val = (e.target as HTMLInputElement).value;
        scaleUpCooloffMs = val === '' ? undefined : Number(val);
      }}
      id="scaleUpCooloffMs"
      name="scaleUpCooloffMs"
      label={translate('workers.scale-up-cooloff-ms-label')}
      hintText={errors.scaleUpCooloffMs?.[0] ||
        translate('workers.scale-up-cooloff-ms-hint')}
      error={!!errors.scaleUpCooloffMs?.[0]}
      placeholder="100"
    />
    <Input
      value={scaleUpBacklogThreshold !== undefined
        ? String(scaleUpBacklogThreshold)
        : ''}
      onchange={(e) => {
        const val = (e.target as HTMLInputElement).value;
        scaleUpBacklogThreshold = val === '' ? undefined : Number(val);
      }}
      id="scaleUpBacklogThreshold"
      name="scaleUpBacklogThreshold"
      label={translate('workers.scale-up-backlog-threshold-label')}
      hintText={errors.scaleUpBacklogThreshold?.[0] ||
        translate('workers.scale-up-backlog-threshold-hint')}
      error={!!errors.scaleUpBacklogThreshold?.[0]}
      placeholder="0"
    />
    <Input
      value={maxWorkerLifetimeMs !== undefined
        ? String(maxWorkerLifetimeMs)
        : ''}
      onchange={(e) => {
        const val = (e.target as HTMLInputElement).value;
        maxWorkerLifetimeMs = val === '' ? undefined : Number(val);
      }}
      id="maxWorkerLifetimeMs"
      name="maxWorkerLifetimeMs"
      label={translate('workers.max-worker-lifetime-ms-label')}
      hintText={errors.maxWorkerLifetimeMs?.[0] ||
        translate('workers.max-worker-lifetime-ms-hint')}
      error={!!errors.maxWorkerLifetimeMs?.[0]}
      placeholder="600000"
    />
    <Input
      value={metricsPollIntervalMs !== undefined
        ? String(metricsPollIntervalMs)
        : ''}
      onchange={(e) => {
        const val = (e.target as HTMLInputElement).value;
        metricsPollIntervalMs = val === '' ? undefined : Number(val);
      }}
      id="metricsPollIntervalMs"
      name="metricsPollIntervalMs"
      label={translate('workers.metrics-poll-interval-ms-label')}
      hintText={errors.metricsPollIntervalMs?.[0] ||
        translate('workers.metrics-poll-interval-ms-hint')}
      error={!!errors.metricsPollIntervalMs?.[0]}
      placeholder="60000"
    />
  {/if}
</div>
