<script lang="ts">
  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Payloads } from '$lib/types';
  import type { ActivityExecutionOutcome } from '$lib/types/activity-execution';
  import { has } from '$lib/utilities/has';

  interface Props {
    input?: Payloads;
    outcome?: ActivityExecutionOutcome;
  }

  let { input, outcome }: Props = $props();
</script>

<div class="grid w-full grid-cols-2 gap-4 max-md:grid-cols-1">
  <div class="flex flex-col gap-2">
    <h5>Input</h5>
    <PayloadCodeBlock
      value={input ?? {}}
      label={translate('standalone-activities.activity-input')}
    />
  </div>
  <div class="flex flex-col gap-2">
    <h5>Result</h5>
    {#if has(outcome, 'failure')}
      <PayloadCodeBlock
        value={outcome.failure}
        label={translate('standalone-activities.activity-outcome')}
      />
    {:else if has(outcome, 'result')}
      <PayloadCodeBlock
        value={outcome.result}
        label={translate('standalone-activities.activity-outcome')}
      />
    {:else}
      <CodeBlock
        content={JSON.stringify({}, null, 2)}
        label={translate('standalone-activities.activity-outcome')}
      />
    {/if}
  </div>
</div>
