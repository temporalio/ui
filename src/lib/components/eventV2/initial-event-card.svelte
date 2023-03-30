<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';
  import Card from './event-summary-card/card.svelte';
  import Collapsed from './event-summary-card/collapsed.svelte';
  import EnhancedStackTrace from './event-summary-card/enhanced-stack-trace.svelte';
  import Expanded from './event-summary-card/expanded.svelte';

  export let event: WorkflowEvent;
  export let events: IterableEvent[];
  export let content: string = '';
  export let showStackTrace = false;

  $: parsedContent = showStackTrace && parseWithBigInt(content);
  $: stackTraceContent =
    showStackTrace &&
    parsedContent?.sources[
      parsedContent?.stacks[0]?.locations[0]?.filePath
    ]?.[0].content;
</script>

<div class="flex gap-2">
  <div class="w-[160px] min-w-[160px]" />
  <div class="flex grow flex-col overflow-auto">
    <CodeBlock
      content={showStackTrace ? stackTraceContent : content}
      title={showStackTrace ? 'Stack Trace' : 'Input'}
      language={showStackTrace ? 'text' : 'json'}
      icon="json"
      class="h-auto"
    />
  </div>
</div>
<Card {event} {events} initial let:expanded>
  <Collapsed {event} {events} {expanded} />
  {#if expanded}
    <Expanded {event} {events} />
  {/if}
</Card>
