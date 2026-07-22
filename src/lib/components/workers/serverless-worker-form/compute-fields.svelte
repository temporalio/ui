<script lang="ts">
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';

  import { GCP_REGIONS } from './gcp-regions';
  import defaultTerraformTemplate from './serverless-worker-lambda.tf?raw';
  import cfnTemplate from './temporal-worker-role.yaml?raw';

  interface Props {
    provider?: string;
    lambdaArn: string;
    iamRoleArn: string;
    roleExternalId: string;
    gcpProject?: string;
    gcpRegion?: string;
    gcpRegions?: string[];
    gcpWorkerPool?: string;
    gcpServiceAccount?: string;
    minReplicas?: number;
    maxReplicas?: number;
    initialReplicas?: number;
    utilizationTarget?: number;
    scaleUpCooloffMs?: number;
    scaleUpBacklogThreshold?: number;
    maxWorkerLifetimeMs?: number;
    metricsPollIntervalMs?: number;
    cfnTemplateUrl?: string;
    cfnTemplate?: string;
    terraformTemplate?: string;
    errors?: {
      lambdaArn?: string[];
      iamRoleArn?: string[];
      roleExternalId?: string[];
      gcpProject?: string[];
      gcpRegion?: string[];
      gcpWorkerPool?: string[];
      gcpServiceAccount?: string[];
      minReplicas?: string[];
      maxReplicas?: string[];
      initialReplicas?: string[];
      utilizationTarget?: string[];
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
    gcpRegions = [...GCP_REGIONS],
    gcpWorkerPool = $bindable(''),
    gcpServiceAccount = $bindable(''),
    minReplicas = $bindable(0),
    maxReplicas = $bindable(30),
    initialReplicas = $bindable(0),
    utilizationTarget = $bindable(0.8),
    scaleUpCooloffMs = $bindable(),
    scaleUpBacklogThreshold = $bindable(),
    maxWorkerLifetimeMs = $bindable(),
    metricsPollIntervalMs = $bindable(),
    cfnTemplateUrl,
    cfnTemplate: cfnTemplateProp,
    terraformTemplate,
    errors = {},
  }: Props = $props();

  const resolvedCfnTemplate = $derived(cfnTemplateProp ?? cfnTemplate);
  const resolvedTerraformTemplate = $derived(
    terraformTemplate ?? defaultTerraformTemplate,
  );

  const launchStackHref = $derived.by(() => {
    if (!cfnTemplateUrl) {
      return 'https://console.aws.amazon.com/cloudformation/';
    }
    const params = [`templateURL=${encodeURIComponent(cfnTemplateUrl)}`];
    if (roleExternalId) {
      params.push(
        `param_AssumeRoleExternalId=${encodeURIComponent(roleExternalId)}`,
      );
    }
    if (lambdaArn) {
      params.push(`param_LambdaFunctionARNs=${encodeURIComponent(lambdaArn)}`);
    }
    return `https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?${params.join('&')}`;
  });

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

<h2 class="text-base font-medium">
  {translate('workers.resource-section')}
</h2>
<p class="mb-4 text-sm text-secondary">
  {translate('workers.resource-section-description')}
</p>

{#if provider === 'lambda'}
  <div class="flex flex-wrap items-end gap-4">
    <Input
      bind:value={lambdaArn}
      id="lambdaArn"
      name="lambdaArn"
      label={translate('workers.lambda-arn-label')}
      hintText={errors.lambdaArn?.[0]}
      error={!!errors.lambdaArn?.[0]}
      placeholder={translate('workers.lambda-arn-placeholder')}
      required
      class="flex-1"
    />
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
    <Combobox
      bind:value={gcpRegion}
      id="gcpRegion"
      name="gcpRegion"
      label={translate('workers.gcp-region-label')}
      hintText={translate('workers.gcp-region-hint')}
      placeholder={translate('workers.gcp-region-placeholder')}
      options={gcpRegions}
      noResultsText={translate('common.no-results')}
      valid={!errors.gcpRegion?.[0]}
      error={errors.gcpRegion?.[0]}
      allowCustomValue
      showChevron
      required
    />
    <div class="flex flex-wrap items-end gap-4">
      <Input
        bind:value={gcpWorkerPool}
        id="gcpWorkerPool"
        name="gcpWorkerPool"
        label={translate('workers.gcp-worker-pool-label')}
        hintText={errors.gcpWorkerPool?.[0]}
        error={!!errors.gcpWorkerPool?.[0]}
        placeholder={translate('workers.gcp-worker-pool-placeholder')}
        required
        class="flex-1"
      />
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

<h2 class="text-base font-medium">
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
    <Accordion
      icon="info"
      title={translate('workers.no-role-prompt')}
      bind:open={showRoleHelp}
      class="[&_h3]:text-sm"
    >
      <div class="-mt-8 flex flex-col gap-3 border-t border-subtle pt-3">
        <ToggleButtons>
          <ToggleButton
            active={activeRoleHelpTab === 'cloudformation'}
            on:click={() => (activeRoleHelpTab = 'cloudformation')}
          >
            {translate('workers.cfn-tab')}
          </ToggleButton>
          <ToggleButton
            active={activeRoleHelpTab === 'terraform'}
            on:click={() => (activeRoleHelpTab = 'terraform')}
          >
            {translate('workers.terraform-tab')}
          </ToggleButton>
        </ToggleButtons>
        {#if activeRoleHelpTab === 'cloudformation'}
          <p class="text-sm text-secondary">
            {translate('workers.launch-stack-description')}
          </p>
          <div class="flex flex-wrap items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              href={launchStackHref}
              target="_blank"
              trailingIcon="external-link"
            >
              {translate('workers.launch-stack')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              on:click={downloadCfnTemplate}
            >
              {translate('workers.download-template')}
            </Button>
          </div>
        {:else}
          <p class="text-sm text-secondary">
            {translate('workers.terraform-description-before')}<Link
              href="https://github.com/temporalio/terraform-modules/tree/main/modules/serverless-workers/aws/lambda"
              newTab>{translate('workers.terraform-iam-module-link')}</Link
            >{translate('workers.terraform-description-after')}
          </p>
          <CodeBlock
            content={resolvedTerraformTemplate}
            language="text"
            maxHeight={300}
            copyable
            label={translate('workers.terraform-iam-module-link')}
            copyIconTitle={translate('workers.copy-snippet')}
            copySuccessIconTitle={translate('workers.copied')}
          />
        {/if}
      </div>
    </Accordion>
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

<div class="flex flex-wrap items-center justify-between gap-4">
  <div>
    <h2 class="text-base font-medium">
      {translate('workers.scaling-lifecycle-section')}
    </h2>
    <p class="text-sm text-secondary">
      {translate('workers.scaling-lifecycle-description')}
    </p>
  </div>
  <Button
    variant="secondary"
    size="sm"
    type="button"
    trailingIcon={showScaling ? 'chevron-up' : 'chevron-down'}
    on:click={() => (showScaling = !showScaling)}
  >
    {showScaling
      ? translate('workers.hide-defaults')
      : translate('workers.show-defaults')}
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
{:else if showScaling && provider === 'cloud-run'}
  <div class="mt-4 flex flex-col gap-4">
    <Input
      value={String(minReplicas)}
      onchange={(e) => {
        minReplicas = Number((e.target as HTMLInputElement).value);
      }}
      id="minReplicas"
      name="minReplicas"
      type="number"
      min={0}
      max={2_147_483_647}
      step={1}
      label={translate('workers.min-replicas-label')}
      hintText={errors.minReplicas?.[0] ||
        translate('workers.min-replicas-hint')}
      error={!!errors.minReplicas?.[0]}
      required
    />
    <Input
      value={String(maxReplicas)}
      onchange={(e) => {
        maxReplicas = Number((e.target as HTMLInputElement).value);
      }}
      id="maxReplicas"
      name="maxReplicas"
      type="number"
      min={1}
      max={2_147_483_647}
      step={1}
      label={translate('workers.max-replicas-label')}
      hintText={errors.maxReplicas?.[0] ||
        translate('workers.max-replicas-hint')}
      error={!!errors.maxReplicas?.[0]}
      required
    />
    <Input
      value={String(initialReplicas)}
      onchange={(e) => {
        initialReplicas = Number((e.target as HTMLInputElement).value);
      }}
      id="initialReplicas"
      name="initialReplicas"
      type="number"
      min={0}
      max={2_147_483_647}
      step={1}
      label={translate('workers.initial-replicas-label')}
      hintText={errors.initialReplicas?.[0] ||
        translate('workers.initial-replicas-hint')}
      error={!!errors.initialReplicas?.[0]}
      required
    />
    <Input
      value={String(utilizationTarget)}
      onchange={(e) => {
        utilizationTarget = Number((e.target as HTMLInputElement).value);
      }}
      id="utilizationTarget"
      name="utilizationTarget"
      type="number"
      min={0}
      max={1}
      step="any"
      label={translate('workers.utilization-target-label')}
      hintText={errors.utilizationTarget?.[0] ||
        translate('workers.utilization-target-hint')}
      error={!!errors.utilizationTarget?.[0]}
      required
    />
  </div>
{/if}
