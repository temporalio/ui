<script lang="ts">
  // import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  // import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  export let workflow: WorkflowExecution;

  $: elapsedTime = formatDistanceAbbreviated({
    start: workflow?.startTime,
    end: workflow?.endTime || Date.now(),
    includeMilliseconds: true,
  });
</script>

<div class="grid grid-cols-2 gap-2 bg-primary p-2 text-sm">
  <div>
    <p class="font-mono text-xs">{translate('common.start')}</p>
    <p>
      {formatDate(workflow?.startTime, $timeFormat, {
        relative: $relativeTime,
      })}
    </p>
  </div>
  <div>
    <p class="font-mono text-xs">{translate('common.end')}</p>
    <p>
      {formatDate(workflow?.endTime, $timeFormat, {
        relative: $relativeTime,
      })}
    </p>
  </div>
  <div>
    <p><Icon name="clock" /></p>
    <p>{elapsedTime}</p>
  </div>
  <div>
    <p class="font-mono text-xs">{translate('common.run-id')}</p>
    <p class="break-all">{workflow?.runId}</p>
  </div>
</div>
<!-- <div class="h-48 overflow-auto">
  <CodeBlock content={JSON.stringify(workflow)} />
</div> -->
<!-- {#if Object.keys(workflow.memo).length > 0}
  <div class="grid grid-cols-1 gap-2 bg-primary p-2">
    <p class="font-mono text-xs">{translate('common.memo')}</p>
    <PayloadDecoder value={workflow.memo} let:decodedValue>
      <CodeBlock content={decodedValue} />
    </PayloadDecoder>
  </div>
{/if} -->
