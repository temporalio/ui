<script lang="ts">
  import type { Payloads } from '$lib/types';
  import type { ActivityExecutionOutcome } from '$lib/types/activity-execution';
  import { has } from '$lib/utilities/has';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  import InputAndResultsPayload from '../workflow/input-and-results-payload.svelte';

  interface Props {
    input: Payloads | undefined;
    outcome: ActivityExecutionOutcome | undefined;
    pending: boolean;
  }

  let { input, outcome, pending }: Props = $props();
</script>

<div class="grid w-full grid-cols-2 gap-4 max-md:grid-cols-1">
  <InputAndResultsPayload title="Input" content={stringifyWithBigInt(input)} />
  {#if has(outcome, 'failure')}
    <InputAndResultsPayload
      title="Result"
      content={stringifyWithBigInt(outcome.failure)}
      isPending={pending}
    />
  {:else if has(outcome, 'result')}
    <InputAndResultsPayload
      title="Result"
      content={stringifyWithBigInt(outcome.result)}
      isPending={pending}
    />
  {:else}
    <InputAndResultsPayload
      title="Result"
      content={stringifyWithBigInt(outcome)}
      isPending={pending}
    />
  {/if}
</div>
