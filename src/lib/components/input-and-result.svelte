<script lang="ts">
  import { getWorkflowStartedAndCompletedEvents } from '$lib/utilities/get-started-and-completed-events';
  import CodeBlock from './code-block.svelte';

  export let events: HistoryEventWithId[];

  let inputAndResult = getWorkflowStartedAndCompletedEvents(events);
</script>

<section class="flex flex-col gap-4">
  {#await inputAndResult then { input, result }}
    <div class="flex gap-4">
      <CodeBlock heading="Input" content={input} framed />
      <CodeBlock heading="Result" content={result} framed />
    </div>
  {/await}
</section>
