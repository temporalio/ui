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
  import {
    COMPUTE_PROVIDERS,
    computeProviderFromType,
    type ComputeProviderTemplates,
    type ComputeProviderValue,
    defaultComputeProviderTemplates,
    TERRAFORM_MODULES,
  } from './compute-providers';
  import { GCP_REGIONS } from './gcp-regions';
  import {
    type ComputeFieldValues,
    interpolateTerraformTemplate,
    scaleDownStabilizationUnits,
  } from './shared';

  interface Props {
    provider?: string;
    /** Every provider field, as one object. See ComputeFieldValues. */
    values: ComputeFieldValues;
    gcpRegions?: string[];
    /**
     * The templates offered per provider. Defaults to the ones bundled here,
     * which is what a self-hosted deployment wants. A consumer overrides them
     * by passing a full map: it is exhaustive over ComputeProviderValue, so
     * adding a provider fails the consumer's type check until it supplies
     * templates for it.
     */
    templates?: Record<
      ComputeProviderValue,
      ComputeProviderTemplates | undefined
    >;
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
      modalAppName?: string[];
      modalFunctionName?: string[];
      modalEnvironment?: string[];
      modalWorkspaceId?: string[];
      modalVersion?: string[];
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
    values = $bindable(),
    gcpRegions = [...GCP_REGIONS],
    templates = defaultComputeProviderTemplates,
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
  // produce a role that cannot invoke a runtime, so the templates follow the
  // selected provider rather than being shared.
  const isAgentCore = $derived(provider === 'agentcore');
  // `provider` arrives as a form field, so it is a string until proven one of
  // ours. Narrowing here rather than asserting keeps an unrecognised value from
  // reading as a provider that happens to have no entry.
  const providerValue = $derived(computeProviderFromType(provider));
  // The provider's own fields, from the registry. Adding a provider needs no
  // branch here.
  const ResourceFields = $derived(
    providerValue
      ? COMPUTE_PROVIDERS[providerValue].fields.resource
      : undefined,
  );
  // Absent for a provider that collects no credentials: the whole Access
  // section, heading and dividers included, then goes with it.
  const AccessFields = $derived(
    providerValue ? COMPUTE_PROVIDERS[providerValue].fields.access : undefined,
  );
  // A provider that declares no Access section loses the heading and the
  // dividers with it, rather than showing an empty one.
  const hasAccessFields = $derived(!!AccessFields);

  const providerTemplates = $derived(
    providerValue ? templates[providerValue] : undefined,
  );
  const cloudFormation = $derived(providerTemplates?.cloudFormation);

  const resolvedCfnTemplate = $derived(cloudFormation?.template ?? '');
  // Only the key belonging to this provider's template is present, so both
  // ARNs are passed and the absent one is a no-op.
  const resolvedTerraformTemplate = $derived(
    interpolateTerraformTemplate(providerTemplates?.terraform ?? '', {
      externalId: values.roleExternalId,
      lambdaArn: values.lambdaArn,
      agentCoreEndpointArn: values.agentCoreEndpointArn,
    }),
  );
  const terraformModuleHref = $derived(
    (providerValue && COMPUTE_PROVIDERS[providerValue].terraformModuleHref) ||
      TERRAFORM_MODULES,
  );
  // Read from the map rather than the selected provider: the Cloud Run block
  // renders inside its own branch, where `provider` is already 'cloud-run'.
  const resolvedCloudRunTerraformTemplate = $derived(
    interpolateCloudRunTerraformTemplate(
      templates['cloud-run']?.terraform ?? '',
      values.gcpProject,
    ),
  );
  const showCloudRunImpersonatorWarning = $derived(
    hasCloudRunImpersonatorPlaceholder(resolvedCloudRunTerraformTemplate),
  );

  const launchStackHref = $derived.by(() => {
    const templateUrl = cloudFormation?.url;

    if (!templateUrl) {
      return 'https://console.aws.amazon.com/cloudformation/';
    }
    const params = [`templateURL=${encodeURIComponent(templateUrl)}`];
    if (values.roleExternalId) {
      params.push(
        `param_AssumeRoleExternalId=${encodeURIComponent(values.roleExternalId)}`,
      );
    }
    const resource = isAgentCore
      ? values.agentCoreEndpointArn
      : values.lambdaArn;
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
    a.download = cloudFormation?.fileName ?? 'temporal-worker-role.yaml';
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

  {#if ResourceFields}
    <ResourceFields
      bind:values
      {errors}
      {fieldId}
      resourcePlaceholder={lambdaArnPlaceholder}
      deployRegions={gcpRegions}
    />
  {/if}
{/if}

{#if sections.includes('resource') && sections.includes('access') && hasAccessFields}
  <hr class="my-5 border-primary" />
{/if}

{#if sections.includes('access') && hasAccessFields}
  <h2 class="text-base font-medium">
    {translate('workers.access-section')}
  </h2>
  <p class="mb-4 text-sm text-secondary">
    {translate('workers.access-section-description')}
  </p>

  {#if AccessFields}
    <AccessFields
      bind:values
      {errors}
      {fieldId}
      {provider}
      templates={providerTemplates}
      {terraformModuleHref}
    />
  {/if}
{/if}

{#if (sections.includes('resource') || (sections.includes('access') && hasAccessFields)) && sections.includes('scaling')}
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
  <!-- Modal joins the invoke-based providers: it pairs with the same `no-sync`
  scaler, and these are the four knobs the Modal demo tuned. -->
  {#if showScaling && (provider === 'lambda' || provider === 'agentcore' || provider === 'modal')}
    <div class="mt-4 flex flex-col gap-4">
      <Input
        value={values.scaleUpCooloffMs !== undefined
          ? String(values.scaleUpCooloffMs)
          : ''}
        onchange={(e) => {
          const val = (e.target as HTMLInputElement).value;
          values.scaleUpCooloffMs = val === '' ? undefined : Number(val);
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
        value={values.scaleUpBacklogThreshold !== undefined
          ? String(values.scaleUpBacklogThreshold)
          : ''}
        onchange={(e) => {
          const val = (e.target as HTMLInputElement).value;
          values.scaleUpBacklogThreshold = val === '' ? undefined : Number(val);
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
        value={values.maxWorkerLifetimeMs !== undefined
          ? String(values.maxWorkerLifetimeMs)
          : ''}
        onchange={(e) => {
          const val = (e.target as HTMLInputElement).value;
          values.maxWorkerLifetimeMs = val === '' ? undefined : Number(val);
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
        value={values.metricsPollIntervalMs !== undefined
          ? String(values.metricsPollIntervalMs)
          : ''}
        onchange={(e) => {
          const val = (e.target as HTMLInputElement).value;
          values.metricsPollIntervalMs = val === '' ? undefined : Number(val);
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
        value={String(values.minReplicas)}
        onchange={(e) => {
          values.minReplicas = Number((e.target as HTMLInputElement).value);
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
        value={String(values.maxReplicas)}
        onchange={(e) => {
          values.maxReplicas = Number((e.target as HTMLInputElement).value);
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
        value={String(values.initialReplicas)}
        onchange={(e) => {
          values.initialReplicas = Number((e.target as HTMLInputElement).value);
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
        value={String(values.utilizationTarget)}
        onchange={(e) => {
          values.utilizationTarget = Number(
            (e.target as HTMLInputElement).value,
          );
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
        bind:value={values.scaleDownStabilization}
        id={fieldId('scaleDownStabilization')}
        name={fieldId('scaleDownStabilization')}
        inputmode="numeric"
        min={0}
        units={scaleDownStabilizationUnits}
        initialUnit={getFirstWholeNumberUnit(
          values.scaleDownStabilization,
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
