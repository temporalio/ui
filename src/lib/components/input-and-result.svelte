<script lang="ts">
  import { getWorkflowStartedAndCompletedEvents } from '$lib/utilities/get-started-and-completed-events';
  import CodeBlock from './code-block.svelte';

  export let events: HistoryEventWithId[] | PromiseLike<HistoryEventWithId[]>;

  $: inputAndResult = getWorkflowStartedAndCompletedEvents(events);
</script>

<section class="flex flex-col gap-4">
  {#await inputAndResult then { input, result }}
    <h3 class="text-lg font-medium">Input & Results</h3>
    <div class="flex gap-4">
      <CodeBlock heading="Input" content={input} framed />
      <CodeBlock heading="Result" content={result} framed />
    </div>
  {/await}
</section>
