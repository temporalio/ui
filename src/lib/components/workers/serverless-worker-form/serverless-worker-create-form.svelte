<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';

  import terraformTemplate from './serverless-worker-lambda.tf?raw';
  import {
    type CreateDeploymentFormData,
    createDeploymentSchema,
  } from './shared';
  import cfnTemplate from './temporal-worker-role.yaml?raw';

  import ComputeProviderPicker from './compute-provider-picker.svelte';

  interface SubmitFieldErrors {
    lambdaArn?: string[];
    iamRoleArn?: string[];
  }

  interface Props {
    onSubmit: (
      data: CreateDeploymentFormData,
    ) => Promise<SubmitFieldErrors | void>;
    onSuccess: () => void;
    cancelHref: string;
    cfnTemplateUrl?: string;
    cfnTemplate?: string;
  }

  let {
    onSubmit,
    onSuccess,
    cancelHref,
    cfnTemplateUrl,
    cfnTemplate: cfnTemplateProp,
  }: Props = $props();

  const resolvedCfnTemplate = $derived(cfnTemplateProp ?? cfnTemplate);

  const launchStackHref = $derived(
    cfnTemplateUrl
      ? `https://console.aws.amazon.com/cloudformation/home#/stacks/quickcreate?templateURL=${encodeURIComponent(cfnTemplateUrl)}`
      : 'https://console.aws.amazon.com/cloudformation/',
  );

  let error = $state<string | undefined>();
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

  const superform = superForm(
    {
      name: '',
      buildId: Math.random().toString(16).slice(2, 8),
      provider: 'lambda' as 'lambda' | 'cloud-run',
      lambdaArn: '',
      iamRoleArn: '',
      roleExternalId: '',
      gcpProject: '',
      gcpRegion: '',
      gcpWorkerPool: '',
      gcpServiceAccount: '',
      scaleUpCooloffMs: undefined as number | undefined,
      scaleUpBacklogThreshold: undefined as number | undefined,
      maxWorkerLifetimeMs: undefined as number | undefined,
      metricsPollIntervalMs: undefined as number | undefined,
    },
    {
      SPA: true,
      validators: zodClient(createDeploymentSchema),
      resetForm: false,
      dataType: 'json',
      onUpdate: async ({ form }) => {
        if (!form.valid) return;
        error = undefined;
        try {
          const fieldErrors = await onSubmit(form.data);
          if (fieldErrors) {
            if (fieldErrors.lambdaArn)
              form.errors.lambdaArn = fieldErrors.lambdaArn;
            if (fieldErrors.iamRoleArn)
              form.errors.iamRoleArn = fieldErrors.iamRoleArn;
            return;
          }
          await onSuccess();
          return { type: 'success' as const };
        } catch (e) {
          error =
            e instanceof Error
              ? e.message
              : translate('common.unexpected-error');
        }
      },
    },
  );

  const { form, errors, enhance, submitting } = superform;
</script>

<div class="flex max-w-[45rem] flex-col gap-4">
  <form class="flex flex-col gap-4" use:enhance novalidate>
    <Card class="p-5">
      <h2 class="mb-1 text-base font-medium">
        {translate('workers.configuration-section')}
      </h2>
      <p class="mb-4 text-sm text-secondary">
        {translate('workers.configuration-description')}
      </p>
      <div class="flex flex-col gap-4">
        <Input
          bind:value={$form.name}
          id="name"
          name="name"
          label={translate('workers.name-label')}
          hintText={$errors.name?.[0]}
          error={!!$errors.name?.[0]}
          placeholder={translate('workers.name-placeholder')}
          required
        />
        <Input
          bind:value={$form.buildId}
          id="buildId"
          name="buildId"
          label={translate('workers.build-id-label')}
          hintText={$errors.buildId?.[0] || translate('workers.build-id-hint')}
          error={!!$errors.buildId?.[0]}
          placeholder=""
          required
        />
      </div>
    </Card>

    <Card class="p-5">
      <h2 class="mb-1 text-base font-medium">
        {translate('workers.compute-provider')}
      </h2>
      <p class="mb-4 text-sm text-secondary">
        {translate('workers.compute-description')}
      </p>
      <ComputeProviderPicker bind:provider={$form.provider} />

      <hr class="my-5 border-subtle" />

      <h2 class="mb-1 text-base font-medium">
        {translate('workers.resource-section')}
      </h2>
      <p class="mb-4 text-sm text-secondary">
        {translate('workers.resource-section-description')}
      </p>

      {#if $form.provider === 'lambda'}
        <div class="flex items-end gap-2">
          <div class="flex-1">
            <Input
              bind:value={$form.lambdaArn}
              id="lambdaArn"
              name="lambdaArn"
              label={translate('workers.lambda-arn-label')}
              hintText={$errors.lambdaArn?.[0]}
              error={!!$errors.lambdaArn?.[0]}
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
            bind:value={$form.gcpProject}
            id="gcpProject"
            name="gcpProject"
            label={translate('workers.gcp-project-label')}
            hintText={$errors.gcpProject?.[0]}
            error={!!$errors.gcpProject?.[0]}
            placeholder={translate('workers.gcp-project-placeholder')}
            required
          />
          <Input
            bind:value={$form.gcpRegion}
            id="gcpRegion"
            name="gcpRegion"
            label={translate('workers.gcp-region-label')}
            hintText={$errors.gcpRegion?.[0] ||
              translate('workers.gcp-region-hint')}
            error={!!$errors.gcpRegion?.[0]}
            placeholder={translate('workers.gcp-region-placeholder')}
            required
          />
          <div class="flex items-end gap-2">
            <div class="flex-1">
              <Input
                bind:value={$form.gcpWorkerPool}
                id="gcpWorkerPool"
                name="gcpWorkerPool"
                label={translate('workers.gcp-worker-pool-label')}
                hintText={$errors.gcpWorkerPool?.[0]}
                error={!!$errors.gcpWorkerPool?.[0]}
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

      {#if $form.provider === 'lambda'}
        <div class="flex flex-col gap-4">
          <Input
            bind:value={$form.iamRoleArn}
            id="iamRoleArn"
            name="iamRoleArn"
            label={translate('workers.iam-role-label')}
            hintText={$errors.iamRoleArn?.[0] ||
              translate('workers.iam-role-hint')}
            error={!!$errors.iamRoleArn?.[0]}
            placeholder={translate('workers.iam-role-placeholder')}
            required
          />
          <Input
            bind:value={$form.roleExternalId}
            id="roleExternalId"
            name="roleExternalId"
            label={translate('workers.external-id-label')}
            hintText={$errors.roleExternalId?.[0] ||
              translate('workers.external-id-hint')}
            error={!!$errors.roleExternalId?.[0]}
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
                  class="px-4 py-2 text-sm {activeRoleHelpTab ===
                  'cloudformation'
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
                      newTab
                      >{translate('workers.terraform-iam-module-link')}</Link
                    >{translate('workers.terraform-description-after')}
                  </p>
                  <CodeBlock
                    content={terraformTemplate}
                    language="text"
                    maxHeight={300}
                    copyable
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
          bind:value={$form.gcpServiceAccount}
          id="gcpServiceAccount"
          name="gcpServiceAccount"
          label={translate('workers.gcp-service-account-label')}
          hintText={$errors.gcpServiceAccount?.[0] ||
            translate('workers.gcp-service-account-hint')}
          error={!!$errors.gcpServiceAccount?.[0]}
          placeholder={translate('workers.gcp-service-account-placeholder')}
          required
        />
      {/if}

      <hr class="my-5 border-subtle" />

      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="mb-1 text-base font-medium">
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
          on:click={() => (showScaling = !showScaling)}
        >
          {translate('workers.customize')}
        </Button>
      </div>
      {#if showScaling}
        <div class="mt-4 flex flex-col gap-4">
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
              $form.maxWorkerLifetimeMs = val === '' ? undefined : Number(val);
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
        </div>
      {/if}
    </Card>

    {#if error}
      <Alert intent="error" title={translate('common.error-occurred')}
        >{error}</Alert
      >
    {/if}

    <div class="flex gap-4">
      <Button type="submit" loading={$submitting}>
        {translate('common.create')}
      </Button>
      <Button variant="ghost" href={cancelHref}>
        {translate('common.cancel')}
      </Button>
    </div>
  </form>
</div>
