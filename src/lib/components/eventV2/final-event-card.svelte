<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { workflowRun } from '$lib/stores/workflow-run';
  import Card from './event-summary-card/card.svelte';
  import Collapsed from './event-summary-card/collapsed.svelte';
  import Expanded from './event-summary-card/expanded.svelte';

  export let event: WorkflowEvent;
  export let events: IterableEvent[];
  export let firstEvent: WorkflowEvent;

  export let content: string = '';
  export let stackTrace: string = '';
</script>

<Card
  {event}
  {events}
  {firstEvent}
  final={!$workflowRun?.workflow?.isRunning}
  let:expanded
>
  <Collapsed {event} {events} {firstEvent} {expanded} showClassification />
  {#if expanded}
    <Expanded {event} {events} {firstEvent} />
  {/if}
</Card>
<div class="flex gap-2 -mt-2">
  <div class="w-[160px] min-w-[160px]" />
  <div class="flex grow flex-col overflow-auto">
    <div class:code-with-stack-trace={stackTrace}>
      <div class="flex flex-col {stackTrace ? 'lg:w-1/2' : ''}">
        <CodeBlock
          {content}
          title="Results"
          unroundTitle
          icon="json"
          class="h-auto {stackTrace ? 'mb-2' : ''}"
        />
      </div>
      {#if stackTrace}
        <div class="flex flex-col lg:w-1/2">
          <p class="text-sm">Stack trace</p>
          <CodeBlock
            content={stackTrace}
            title="Stack Trace"
            unroundTitle
            class="mb-2 h-full lg:pr-2"
            language="text"
          />
        </div>
      {/if}
    </div>
  </div>
</div>

<style lang="postcss">
  .row {
    @apply w-full flex-wrap items-center rounded-xl border-gray-900 py-2 pl-8 pr-2 text-sm no-underline xl:text-base;
  }

  .failure {
    @apply text-red-700;
  }

  .canceled {
    @apply text-yellow-700;
  }

  .terminated {
    @apply rounded bg-pink-700 px-1 text-white;
  }

  .row.typedError {
    @apply rounded-lg;
  }
</style>
