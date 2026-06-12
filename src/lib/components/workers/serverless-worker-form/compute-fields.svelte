<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';

  import terraformTemplate from './serverless-worker-lambda.tf?raw';
  import cfnTemplate from './temporal-worker-role.yaml?raw';

  interface Props {
    provider?: string;
    lambdaArn: string;
    iamRoleArn: string;
    roleExternalId: string;
    gcpProject?: string;
    gcpRegion?: string;
    gcpWorkerPool?: string;
    gcpServiceAccount?: string;
    scaleUpCooloffMs?: number;
    scaleUpBacklogThreshold?: number;
    maxWorkerLifetimeMs?: number;
    metricsPollIntervalMs?: number;
    cfnTemplateUrl?: string;
    cfnTemplate?: string;
    errors?: {
      lambdaArn?: string[];
      iamRoleArn?: string[];
      roleExternalId?: string[];
      gcpProject?: string[];
      gcpRegion?: string[];
      gcpWorkerPool?: string[];
      gcpServiceAccount?: string[];
      scaleUpCooloffMs?: string[];
      scaleUpBacklogThreshold?: string[];
      maxWorkerLifetimeMs?: string[];
      metricsPollIntervalMs?: string[];
    };
  }

  let {
    provider = 'lambda',
    lambdaArn = $bindable(),
    iamRoleArn = $bindable(),
    roleExternalId = $bindable(),
    gcpProject = $bindable(''),
    gcpRegion = $bindable(''),
    gcpWorkerPool = $bindable(''),
    gcpServiceAccount = $bindable(''),
    scaleUpCooloffMs = $bindable(),
    scaleUpBacklogThreshold = $bindable(),
    maxWorkerLifetimeMs = $bindable(),
    metricsPollIntervalMs = $bindable(),
    cfnTemplateUrl,
    cfnTemplate: cfnTemplateProp,
    errors = {},
  }: Props = $props();

  const resolvedCfnTemplate = $derived(cfnTemplateProp ?? cfnTemplate);

  const launchStackHref = $derived(
    cfnTemplateUrl
      ? `https://console.aws.amazon.com/cloudformation/home#/stacks/quickcreate?templateURL=${encodeURIComponent(cfnTemplateUrl)}`
      : 'https://console.aws.amazon.com/cloudformation/',
  );

  let showRoleHelp = $state(false);
  let showScaling = $state(false);
  let activeRoleHelpTab = $state<'cloudformation' | 'terraform'>(
    'cloudformation',
  );

  function downloadCfnTemplate() {
    const blob = new Blob([resolvedCfnTemplate], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'temporal-worker-role.yaml';
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<hr class="my-5 border-subtle" />

<h2 class="mb-1 text-base font-medium">
  {translate('workers.resource-section')}
</h2>
<p class="mb-4 text-sm text-secondary">
  {translate('workers.resource-section-description')}
</p>

{#if provider === 'lambda'}
  <div class="flex items-end gap-2">
    <div class="flex-1">
      <Input
        bind:value={lambdaArn}
        id="lambdaArn"
        name="lambdaArn"
        label={translate('workers.lambda-arn-label')}
        hintText={errors.lambdaArn?.[0]}
        error={!!errors.lambdaArn?.[0]}
        placeholder={translate('workers.lambda-arn-placeholder')}
        required
      />
    </div>
    <Button
      variant="secondary"
      type="button"
      href="https://console.aws.amazon.com/lambda"
      target="_blank"
      trailingIcon="external-link"
    >
      {translate('workers.open-lambda-console')}
    </Button>
  </div>
{:else}
  <div class="flex flex-col gap-4">
    <Input
      bind:value={gcpProject}
      id="gcpProject"
      name="gcpProject"
      label={translate('workers.gcp-project-label')}
      hintText={errors.gcpProject?.[0]}
      error={!!errors.gcpProject?.[0]}
      placeholder={translate('workers.gcp-project-placeholder')}
      required
    />
    <Input
      bind:value={gcpRegion}
      id="gcpRegion"
      name="gcpRegion"
      label={translate('workers.gcp-region-label')}
      hintText={errors.gcpRegion?.[0] || translate('workers.gcp-region-hint')}
      error={!!errors.gcpRegion?.[0]}
      placeholder={translate('workers.gcp-region-placeholder')}
      required
    />
    <div class="flex items-end gap-2">
      <div class="flex-1">
        <Input
          bind:value={gcpWorkerPool}
          id="gcpWorkerPool"
          name="gcpWorkerPool"
          label={translate('workers.gcp-worker-pool-label')}
          hintText={errors.gcpWorkerPool?.[0]}
          error={!!errors.gcpWorkerPool?.[0]}
          placeholder={translate('workers.gcp-worker-pool-placeholder')}
          required
        />
      </div>
      <Button
        variant="secondary"
        type="button"
        href="https://console.cloud.google.com/run/worker-pools"
        target="_blank"
        trailingIcon="external-link"
      >
        {translate('workers.open-cloud-run-console')}
      </Button>
    </div>
  </div>
{/if}

<hr class="my-5 border-subtle" />

<h2 class="mb-1 text-base font-medium">
  {translate('workers.access-section')}
</h2>
<p class="mb-4 text-sm text-secondary">
  {translate('workers.access-section-description')}
</p>

{#if provider === 'lambda'}
  <div class="flex flex-col gap-4">
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
    <button
      type="button"
      class="surface-primary flex w-full items-center justify-between rounded border border-subtle px-4 py-3 text-sm hover:surface-interactive-secondary"
      onclick={() => (showRoleHelp = !showRoleHelp)}
    >
      <span class="flex items-center gap-2">
        <Icon name="info" />
        {translate('workers.no-role-prompt')}
      </span>
      <Icon name={showRoleHelp ? 'chevron-up' : 'chevron-down'} />
    </button>
    {#if showRoleHelp}
      <div class="rounded border border-subtle">
        <div class="flex border-b border-subtle">
          <button
            type="button"
            class="px-4 py-2 text-sm {activeRoleHelpTab === 'cloudformation'
              ? 'surface-interactive-secondary font-medium'
              : 'text-secondary'}"
            onclick={() => (activeRoleHelpTab = 'cloudformation')}
          >
            {translate('workers.cfn-tab')}
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm {activeRoleHelpTab === 'terraform'
              ? 'surface-interactive-secondary font-medium'
              : 'text-secondary'}"
            onclick={() => (activeRoleHelpTab = 'terraform')}
          >
            {translate('workers.terraform-tab')}
          </button>
        </div>
        {#if activeRoleHelpTab === 'cloudformation'}
          <div class="flex flex-col gap-3 p-4">
            <p class="text-sm text-secondary">
              {translate('workers.launch-stack-description')}
            </p>
            <div class="flex items-center gap-4">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                href={launchStackHref}
                target="_blank"
                trailingIcon="external-link"
              >
                {translate('workers.launch-stack')}
              </Button>
              <button
                type="button"
                class="text-sm underline"
                onclick={downloadCfnTemplate}
              >
                {translate('workers.download-template')}
              </button>
            </div>
          </div>
        {:else}
          <div class="flex flex-col gap-3 p-4">
            <p class="text-sm text-secondary">
              {translate('workers.terraform-description-before')}<Link
                href="https://github.com/temporalio/terraform-modules/tree/main/modules/serverless-workers/aws/lambda"
                newTab>{translate('workers.terraform-iam-module-link')}</Link
              >{translate('workers.terraform-description-after')}
            </p>
            <CodeBlock
              content={terraformTemplate}
              language="text"
              maxHeight={300}
              copyable
              label={translate('workers.terraform-iam-module-link')}
              copyIconTitle={translate('workers.copy-snippet')}
              copySuccessIconTitle={translate('workers.copied')}
            />
          </div>
        {/if}
      </div>
    {/if}
  </div>
{:else}
  <Input
    bind:value={gcpServiceAccount}
    id="gcpServiceAccount"
    name="gcpServiceAccount"
    label={translate('workers.gcp-service-account-label')}
    hintText={errors.gcpServiceAccount?.[0] ||
      translate('workers.gcp-service-account-hint')}
    error={!!errors.gcpServiceAccount?.[0]}
    placeholder={translate('workers.gcp-service-account-placeholder')}
    required
  />
{/if}

<hr class="my-5 border-subtle" />

<div class="flex items-start justify-between gap-4">
  <div>
    <div class="mb-1 flex items-center gap-2">
      <h2 class="text-base font-medium">
        {translate('workers.scaling-lifecycle-section')}
      </h2>
      {#if provider === 'cloud-run'}
        <Badge type="secondary">{translate('workers.coming-soon')}</Badge>
      {/if}
    </div>
    <p class="text-sm text-secondary">
      {translate('workers.scaling-lifecycle-description')}
    </p>
  </div>
  <Button
    variant="secondary"
    size="sm"
    type="button"
    disabled={provider === 'cloud-run'}
    on:click={() => (showScaling = !showScaling)}
  >
    {translate('workers.customize')}
  </Button>
</div>
{#if showScaling && provider === 'lambda'}
  <div class="mt-4 flex flex-col gap-4">
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
  </div>
{/if}
