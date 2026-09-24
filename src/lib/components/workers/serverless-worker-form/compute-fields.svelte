<script lang="ts">
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Combobox from '$lib/holocene/combobox/combobox.svelte';
  import DurationInput, {
    getFirstWholeNumberUnit,
  } from '$lib/holocene/duration-input/duration-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconExternalLinkOptical, IconInfo } from '$lib/io/icon';

  import {
    hasCloudRunImpersonatorPlaceholder,
    interpolateCloudRunTerraformTemplate,
  } from './cloud-run-terraform';
  import { GCP_REGIONS } from './gcp-regions';
  import defaultAgentCoreTerraformTemplate from './serverless-worker-agentcore.tf?raw';
  import defaultCloudRunTerraformTemplate from './serverless-worker-cloud-run.tf?raw';
  import defaultTerraformTemplate from './serverless-worker-lambda.tf?raw';
  import {
    defaultScaleDownStabilization,
    interpolateTerraformTemplate,
    scaleDownStabilizationUnits,
  } from './shared';
  import agentCoreCfnTemplate from './temporal-agentcore-role.yaml?raw';
  import cfnTemplate from './temporal-worker-role.yaml?raw';

  interface Props {
    provider?: string;
    lambdaArn: string;
    agentCoreEndpointArn?: string;
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
    scaleDownStabilization?: string;
    scaleUpCooloffMs?: number;
    scaleUpBacklogThreshold?: number;
    maxWorkerLifetimeMs?: number;
    metricsPollIntervalMs?: number;
    cfnTemplateUrl?: string;
    cfnTemplate?: string;
    terraformTemplate?: string;
    cloudRunTerraformTemplate?: string;
    agentCoreCfnTemplateUrl?: string;
    agentCoreCfnTemplate?: string;
    agentCoreTerraformTemplate?: string;
    lambdaArnPlaceholder?: string;
    leadingDivider?: boolean;
    sections?: ('resource' | 'access' | 'scaling')[];
    /** Prefixes field ids so the fields can render more than once on a page. */
    idPrefix?: string;
    errors?: {
      lambdaArn?: string[];
      agentCoreEndpointArn?: string[];
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
      scaleDownStabilization?: string[];
      scaleUpCooloffMs?: string[];
      scaleUpBacklogThreshold?: string[];
      maxWorkerLifetimeMs?: string[];
      metricsPollIntervalMs?: string[];
    };
  }

  let {
    provider = 'lambda',
    lambdaArn = $bindable(),
    agentCoreEndpointArn = $bindable(''),
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
    scaleDownStabilization = $bindable(defaultScaleDownStabilization),
    scaleUpCooloffMs = $bindable(),
    scaleUpBacklogThreshold = $bindable(),
    maxWorkerLifetimeMs = $bindable(),
    metricsPollIntervalMs = $bindable(),
    cfnTemplateUrl,
    cfnTemplate: cfnTemplateProp,
    terraformTemplate,
    cloudRunTerraformTemplate,
    agentCoreCfnTemplateUrl,
    agentCoreCfnTemplate: agentCoreCfnTemplateProp,
    agentCoreTerraformTemplate,
    lambdaArnPlaceholder = translate('workers.lambda-arn-placeholder'),
    leadingDivider = true,
    sections = ['resource', 'access', 'scaling'],
    idPrefix = '',
    errors = {},
  }: Props = $props();

  const fieldId = (base: string): string =>
    idPrefix ? `${idPrefix}-${base}` : base;

  // Both AWS providers assume a role, and the role each needs is different:
  // one grants lambda:InvokeFunction, the other bedrock-agentcore:
  // InvokeAgentRuntime. Handing out the Lambda role for AgentCore would
  // produce a role that cannot invoke a runtime, so the helper follows the
  // selected provider rather than being shared.
  const isAgentCore = $derived(provider === 'agentcore');

  const resolvedCfnTemplate = $derived(
    isAgentCore
      ? (agentCoreCfnTemplateProp ?? agentCoreCfnTemplate)
      : (cfnTemplateProp ?? cfnTemplate),
  );
  const resolvedTerraformTemplate = $derived(
    isAgentCore
      ? interpolateTerraformTemplate(
          agentCoreTerraformTemplate ?? defaultAgentCoreTerraformTemplate,
          { externalId: roleExternalId, agentCoreEndpointArn },
        )
      : interpolateTerraformTemplate(
          terraformTemplate ?? defaultTerraformTemplate,
          { externalId: roleExternalId, lambdaArn },
        ),
  );
  const terraformModuleHref = $derived(
    `https://github.com/temporalio/terraform-modules/tree/main/modules/serverless-workers/aws/${isAgentCore ? 'agentcore' : 'lambda'}`,
  );
  const resolvedCloudRunTerraformTemplate = $derived(
    interpolateCloudRunTerraformTemplate(
      cloudRunTerraformTemplate ?? defaultCloudRunTerraformTemplate,
      gcpProject,
    ),
  );
  const showCloudRunImpersonatorWarning = $derived(
    hasCloudRunImpersonatorPlaceholder(resolvedCloudRunTerraformTemplate),
  );

  const launchStackHref = $derived.by(() => {
    const templateUrl = isAgentCore ? agentCoreCfnTemplateUrl : cfnTemplateUrl;

    if (!templateUrl) {
      return 'https://console.aws.amazon.com/cloudformation/';
    }
    const params = [`templateURL=${encodeURIComponent(templateUrl)}`];
    if (roleExternalId) {
      params.push(
        `param_AssumeRoleExternalId=${encodeURIComponent(roleExternalId)}`,
      );
    }
    const resource = isAgentCore ? agentCoreEndpointArn : lambdaArn;
    if (resource) {
      params.push(
        `param_${isAgentCore ? 'AgentRuntimeArns' : 'LambdaFunctionARNs'}=${encodeURIComponent(resource)}`,
      );
    }
    return `https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?${params.join('&')}`;
  });

  let showRoleHelp = $state(false);
  let showCloudRunHelp = $state(false);
  let showScaling = $state(false);
  let activeRoleHelpTab = $state<'cloudformation' | 'terraform'>(
    'cloudformation',
  );

  function downloadCfnTemplate() {
    const blob = new Blob([resolvedCfnTemplate], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isAgentCore
      ? 'temporal-agentcore-role.yaml'
      : 'temporal-worker-role.yaml';
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * The whole row toggles, but only the chevron shows hover, so the row reads
   * as content rather than as a button.
   */
  const ACCORDION_CLASS = [
    'rounded-lg border-0 bg-surface-secondary [&_h3]:text-sm',
    '[&>div>button:hover]:bg-transparent',
    '[&>div>button>div>svg:last-child]:-m-1 [&>div>button>div>svg:last-child]:box-content [&>div>button>div>svg:last-child]:rounded [&>div>button>div>svg:last-child]:p-1',
    '[&>div>button:hover>div>svg:last-child]:bg-interactive-tertiary-hover',
  ].join(' ');
</script>

{#if leadingDivider}
  <hr class="my-5 border-primary" />
{/if}

{#if sections.includes('resource')}
  <h2 class="text-base font-medium">
    {translate('workers.resource-section')}
  </h2>
  <p class="mb-4 text-sm text-secondary">
    {translate('workers.resource-section-description')}
  </p>

  {#if provider === 'lambda'}
    <div class="flex flex-wrap items-start gap-4 [&>:not(:first-child)]:mt-6">
      <Input
        bind:value={lambdaArn}
        id={fieldId('lambdaArn')}
        name={fieldId('lambdaArn')}
        label={translate('workers.lambda-arn-label')}
        hintText={errors.lambdaArn?.[0]}
        error={!!errors.lambdaArn?.[0]}
        placeholder={lambdaArnPlaceholder}
        required
        class="flex-1"
      />
      <Button
        variant="tertiary"
        type="button"
        href="https://console.aws.amazon.com/lambda"
        target="_blank"
        TrailingIcon={IconExternalLinkOptical}
      >
        {translate('workers.open-lambda-console')}
      </Button>
    </div>
  {:else if provider === 'agentcore'}
    <div class="flex flex-wrap items-start gap-4 [&>:not(:first-child)]:mt-6">
      <Input
        bind:value={agentCoreEndpointArn}
        id={fieldId('agentCoreEndpointArn')}
        name={fieldId('agentCoreEndpointArn')}
        label={translate('workers.agentcore-endpoint-arn-label')}
        hintText={errors.agentCoreEndpointArn?.[0] ||
          translate('workers.agentcore-endpoint-arn-hint')}
        error={!!errors.agentCoreEndpointArn?.[0]}
        placeholder={translate('workers.agentcore-endpoint-arn-placeholder')}
        required
        class="flex-1"
      />
      <Button
        variant="tertiary"
        type="button"
        href="https://console.aws.amazon.com/bedrock-agentcore"
        target="_blank"
        TrailingIcon={IconExternalLinkOptical}
      >
        {translate('workers.open-agentcore-console')}
      </Button>
    </div>
  {:else}
    <div class="flex flex-col gap-4">
      <Input
        bind:value={gcpProject}
        id={fieldId('gcpProject')}
        name={fieldId('gcpProject')}
        label={translate('workers.gcp-project-label')}
        hintText={errors.gcpProject?.[0]}
        error={!!errors.gcpProject?.[0]}
        placeholder={translate('workers.gcp-project-placeholder')}
        required
      />
      <Combobox
        bind:value={gcpRegion}
        id={fieldId('gcpRegion')}
        name={fieldId('gcpRegion')}
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
      <div class="flex flex-wrap items-start gap-4 [&>:not(:first-child)]:mt-6">
        <Input
          bind:value={gcpWorkerPool}
          id={fieldId('gcpWorkerPool')}
          name={fieldId('gcpWorkerPool')}
          label={translate('workers.gcp-worker-pool-label')}
          hintText={errors.gcpWorkerPool?.[0]}
          error={!!errors.gcpWorkerPool?.[0]}
          placeholder={translate('workers.gcp-worker-pool-placeholder')}
          required
          class="flex-1"
        />
        <Button
          variant="tertiary"
          type="button"
          href="https://console.cloud.google.com/run/worker-pools"
          target="_blank"
          TrailingIcon={IconExternalLinkOptical}
        >
          {translate('workers.open-cloud-run-console')}
        </Button>
      </div>
    </div>
  {/if}
{/if}

{#if sections.includes('resource') && sections.includes('access')}
  <hr class="my-5 border-primary" />
{/if}

{#if sections.includes('access')}
  <h2 class="text-base font-medium">
    {translate('workers.access-section')}
  </h2>
  <p class="mb-4 text-sm text-secondary">
    {translate('workers.access-section-description')}
  </p>

  {#if provider === 'lambda' || provider === 'agentcore'}
    <div class="flex flex-col gap-4">
      <Input
        bind:value={iamRoleArn}
        id={fieldId('iamRoleArn')}
        name={fieldId('iamRoleArn')}
        label={translate('workers.iam-role-label')}
        hintText={errors.iamRoleArn?.[0] || translate('workers.iam-role-hint')}
        error={!!errors.iamRoleArn?.[0]}
        placeholder={translate('workers.iam-role-placeholder')}
        required
      />
      <Input
        bind:value={roleExternalId}
        id={fieldId('roleExternalId')}
        name={fieldId('roleExternalId')}
        label={translate('workers.external-id-label')}
        hintText={errors.roleExternalId?.[0] ||
          translate('workers.external-id-hint')}
        error={!!errors.roleExternalId?.[0]}
        placeholder={translate('workers.external-id-placeholder')}
        required
      />
      {#if provider === 'lambda' || provider === 'agentcore'}
        <Accordion
          Icon={IconInfo}
          title={translate('workers.no-role-prompt')}
          bind:open={showRoleHelp}
          class={ACCORDION_CLASS}
        >
          <div class="-mt-8 flex flex-col gap-3 pt-3">
            <ToggleButtons>
              <ToggleButton
                variant="tertiary"
                size="sm"
                active={activeRoleHelpTab === 'cloudformation'}
                onclick={() => (activeRoleHelpTab = 'cloudformation')}
              >
                {translate('workers.cfn-tab')}
              </ToggleButton>
              <ToggleButton
                variant="tertiary"
                size="sm"
                active={activeRoleHelpTab === 'terraform'}
                onclick={() => (activeRoleHelpTab = 'terraform')}
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
                  variant="tertiary"
                  size="sm"
                  href={launchStackHref}
                  target="_blank"
                  TrailingIcon={IconExternalLinkOptical}
                >
                  {translate('workers.launch-stack')}
                </Button>
                <Button
                  variant="tertiary"
                  size="sm"
                  onclick={downloadCfnTemplate}
                >
                  {translate('workers.download-template')}
                </Button>
              </div>
            {:else}
              <p class="text-sm text-secondary">
                {translate('workers.terraform-description-before')}<Link
                  href={terraformModuleHref}
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
      {/if}
    </div>
  {:else}
    <div class="flex flex-col gap-4">
      <Input
        bind:value={gcpServiceAccount}
        id={fieldId('gcpServiceAccount')}
        name={fieldId('gcpServiceAccount')}
        label={translate('workers.gcp-service-account-label')}
        hintText={errors.gcpServiceAccount?.[0] ||
          translate('workers.gcp-service-account-hint')}
        error={!!errors.gcpServiceAccount?.[0]}
        placeholder={translate('workers.gcp-service-account-placeholder')}
        required
      />
      {#if provider === 'cloud-run'}
        <Accordion
          Icon={IconInfo}
          title={translate('workers.cloud-run-setup-prompt')}
          bind:open={showCloudRunHelp}
          class={ACCORDION_CLASS}
        >
          <div class="-mt-8 flex flex-col gap-3 pt-3">
            <p class="text-sm text-secondary">
              {translate('workers.cloud-run-terraform-description-before')}<Link
                href="https://github.com/temporalio/terraform-modules/tree/main/modules/serverless-workers/gcp/cloud-run"
                newTab
                >{translate('workers.cloud-run-terraform-module-link')}</Link
              >{translate('workers.cloud-run-terraform-description-after')}
            </p>
            {#if showCloudRunImpersonatorWarning}
              <p class="text-sm text-warning">
                {translate('workers.cloud-run-impersonator-warning')}
              </p>
            {/if}
            <CodeBlock
              content={resolvedCloudRunTerraformTemplate}
              language="text"
              maxHeight={300}
              copyable
              label={translate('workers.cloud-run-terraform-module-link')}
              copyIconTitle={translate('workers.copy-snippet')}
              copySuccessIconTitle={translate('workers.copied')}
            />
            <p class="text-sm text-secondary">
              {translate('workers.cloud-run-invoker-handoff')}
            </p>
          </div>
        </Accordion>
      {/if}
    </div>
  {/if}
{/if}

{#if (sections.includes('resource') || sections.includes('access')) && sections.includes('scaling')}
  <hr class="my-5 border-primary" />
{/if}

{#if sections.includes('scaling')}
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
      variant="tertiary"
      size="sm"
      type="button"
      onclick={() => (showScaling = !showScaling)}
    >
      {showScaling
        ? translate('workers.hide-defaults')
        : translate('workers.show-defaults')}
    </Button>
  </div>
  {#if showScaling && (provider === 'lambda' || provider === 'agentcore')}
    <div class="mt-4 flex flex-col gap-4">
      <Input
        value={scaleUpCooloffMs !== undefined ? String(scaleUpCooloffMs) : ''}
        onchange={(e) => {
          const val = (e.target as HTMLInputElement).value;
          scaleUpCooloffMs = val === '' ? undefined : Number(val);
        }}
        id={fieldId('scaleUpCooloffMs')}
        name={fieldId('scaleUpCooloffMs')}
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
        id={fieldId('scaleUpBacklogThreshold')}
        name={fieldId('scaleUpBacklogThreshold')}
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
        id={fieldId('maxWorkerLifetimeMs')}
        name={fieldId('maxWorkerLifetimeMs')}
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
        id={fieldId('metricsPollIntervalMs')}
        name={fieldId('metricsPollIntervalMs')}
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
        id={fieldId('minReplicas')}
        name={fieldId('minReplicas')}
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
        id={fieldId('maxReplicas')}
        name={fieldId('maxReplicas')}
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
        id={fieldId('initialReplicas')}
        name={fieldId('initialReplicas')}
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
        id={fieldId('utilizationTarget')}
        name={fieldId('utilizationTarget')}
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
      <DurationInput
        bind:value={scaleDownStabilization}
        id={fieldId('scaleDownStabilization')}
        name={fieldId('scaleDownStabilization')}
        inputmode="numeric"
        min={0}
        units={scaleDownStabilizationUnits}
        initialUnit={getFirstWholeNumberUnit(
          scaleDownStabilization,
          scaleDownStabilizationUnits,
          'second(s)',
        )}
        label={translate('workers.scale-down-stabilization-label')}
        hintText={errors.scaleDownStabilization?.[0] ||
          translate('workers.scale-down-stabilization-hint')}
        error={!!errors.scaleDownStabilization?.[0]}
        required
      />
    </div>
  {/if}
{/if}
