<!-- The service account Cloud Run runs the Worker as. -->
<script lang="ts">
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconInfo } from '$lib/io/icon';

  import {
    hasCloudRunImpersonatorPlaceholder,
    interpolateCloudRunTerraformTemplate,
  } from '../cloud-run-terraform';
  import { TERRAFORM_MODULES } from '../terraform-modules';
  import { ACCORDION_CLASS } from './accordion-class';
  import type { ComputeSectionProps } from './types';

  let {
    values = $bindable(),
    errors,
    fieldId,
    provider,
    templates,
  }: ComputeSectionProps = $props();

  const resolvedCloudRunTerraformTemplate = $derived(
    interpolateCloudRunTerraformTemplate(
      templates?.terraform ?? '',
      values.gcpProject,
    ),
  );
  const showCloudRunImpersonatorWarning = $derived(
    hasCloudRunImpersonatorPlaceholder(resolvedCloudRunTerraformTemplate),
  );

  let showCloudRunHelp = $state(false);
</script>

<div class="flex flex-col gap-4">
  <Input
    bind:value={values.gcpServiceAccount}
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
            newTab>{translate('workers.cloud-run-terraform-module-link')}</Link
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
