<script lang="ts">
  import Icon from 'svelte-fa';
  import { faSpinner } from '@fortawesome/free-solid-svg-icons';
  import { fade } from 'svelte/transition';

  import { events } from '$lib/stores/events';

  import { getWorkflowStartedAndCompletedEvents } from '$lib/utilities/get-started-and-completed-events';

  import CodeBlock from '$lib/components/code-block.svelte';

  export let running: boolean;

  $: inputContent = getWorkflowStartedAndCompletedEvents($events)['input'];
  $: resultsContent = getWorkflowStartedAndCompletedEvents($events)['results'];

  let showContent = false;
</script>

<article
  class="flex flex-row justify-between border-2 border-gray-300 p-4 rounded-lg w-full"
  class:expanded={showContent}
  data-cy="input-and-results"
>
  <div class="w-full">
    <h3 class="text-lg">
      Input & Result
      {#if running}
        <Icon icon={faSpinner} scale={0.8} class="inline animate-spin" />
      {/if}
    </h3>
    {#if showContent}
      <div class="flex flex-col lg:flex-row gap-4">
        <article class="flex flex-col py-4 w-full" data-cy="workflow-input">
          <div class="w-full">
            <h3 class="text-base text-gray-900">Input</h3>
            {#if inputContent}
              <CodeBlock content={inputContent} class="mb-2 max-h-96" />
            {/if}
          </div>
        </article>
        <article class="flex flex-col py-4 w-full" data-cy="workflow-results">
          <div class="w-full">
            {#if resultsContent}
              <h3 class="text-base text-gray-900">Result</h3>
              <CodeBlock content={resultsContent} class="mb-2 max-h-96" />
            {/if}
          </div>
        </article>
      </div>
    {/if}
  </div>
  <div class="h-8 w-8">
    <div class="expand-icon" on:click={() => (showContent = !showContent)}>
      {showContent ? '-' : '+'}
    </div>
  </div>
</article>

<style lang="postcss">
  .expanded {
    @apply pb-8;
  }

  .expand-icon {
    @apply text-center text-3xl px-1 pt-2 pb-2 leading-4 text-gray-900 rounded-full cursor-pointer select-none;
  }
  .expand-icon:hover {
    @apply bg-gray-100;
    transition: background-color 0.3s linear;
    -webkit-transition: background-color 0.3s linear;
  }
</style>
