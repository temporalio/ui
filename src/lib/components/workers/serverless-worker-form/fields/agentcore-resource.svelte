<!-- AgentCore takes the Runtime *Endpoint* ARN, not the Runtime ARN. -->
<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconExternalLinkOptical } from '$lib/io/icon';

  import type { ComputeSectionProps } from './types';

  let { values = $bindable(), errors, fieldId }: ComputeSectionProps = $props();
</script>

<div class="flex flex-wrap items-start gap-4 [&>:not(:first-child)]:mt-7">
  <Input
    bind:value={values.agentCoreEndpointArn}
    id={fieldId('agentCoreEndpointArn')}
    name={fieldId('agentCoreEndpointArn')}
    spellcheck={false}
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
