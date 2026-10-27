<!--
  Lambda and AgentCore are both invoked through an assumed IAM role, so they
  take the same Access fields and validate them identically. The role each
  needs differs -- one grants lambda:InvokeFunction, the other
  bedrock-agentcore:InvokeAgentRuntime -- so the templates follow the selected
  provider rather than being shared.
-->
<script lang="ts">
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconExternalLinkOptical, IconInfo } from '$lib/io/icon';

  import { TERRAFORM_MODULES } from '../terraform-modules';
  import { interpolateTerraformTemplate } from '../terraform-template';
  import { ACCORDION_CLASS } from './accordion-class';
  import type { ComputeSectionProps } from './types';

  let {
    values = $bindable(),
    errors,
    fieldId,
    provider,
    templates,
    terraformModuleHref = TERRAFORM_MODULES,
  }: ComputeSectionProps = $props();

  // Both AWS providers assume a role, and the role each needs is different:
  // one grants lambda:InvokeFunction, the other
  // bedrock-agentcore:InvokeAgentRuntime. Handing out the Lambda role for
  // AgentCore would produce a role that cannot invoke a runtime, so the
  // templates follow the selected provider rather than being shared.
  const isAgentCore = $derived(provider === 'agentcore');
  const cloudFormation = $derived(templates?.cloudFormation);
  const resolvedCfnTemplate = $derived(cloudFormation?.template ?? '');

  // Only the key belonging to this provider's template is present, so both
  // ARNs are passed and the absent one is a no-op.
  const resolvedTerraformTemplate = $derived(
    interpolateTerraformTemplate(templates?.terraform ?? '', {
      externalId: values.roleExternalId,
      lambdaArn: values.lambdaArn,
      agentCoreEndpointArn: values.agentCoreEndpointArn,
    }),
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
  let activeRoleHelpTab = $state<'cloudformation' | 'terraform'>(
    'cloudformation',
  );

  function downloadCfnTemplate() {
    const blob = new Blob([resolvedCfnTemplate], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = cloudFormation?.fileName ?? 'template.yaml';
    anchor.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="flex flex-col gap-4">
  <Input
    bind:value={values.iamRoleArn}
    id={fieldId('iamRoleArn')}
    name={fieldId('iamRoleArn')}
    spellcheck={false}
    label={translate('workers.iam-role-label')}
    hintText={errors.iamRoleArn?.[0] || translate('workers.iam-role-hint')}
    error={!!errors.iamRoleArn?.[0]}
    placeholder={translate('workers.iam-role-placeholder')}
    required
  />
  <Input
    bind:value={values.roleExternalId}
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
            <Button variant="tertiary" size="sm" onclick={downloadCfnTemplate}>
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
