<script lang="ts">
  import Icon from 'svelte-fa';
  import { faSpinner } from '@fortawesome/free-solid-svg-icons';

  import { getContext } from 'svelte';
  import { getWorkflowStartedAndCompletedEvents } from '$lib/utilities/get-started-and-completed-events';
  import { capitalize } from '$lib/utilities/format-camel-case';

  import CodeBlock from '$lib/components/code-block.svelte';

  export let type: 'input' | 'results';

  const { events } = getContext('eventHistory');
  $: title = capitalize(type);
  $: content = getWorkflowStartedAndCompletedEvents(events)[type];
</script>

<article
  class="flex flex-col border-2 border-gray-300 p-4 rounded-lg w-full lg:w-1/2"
  data-cy="workflow-{type}"
>
  <h3 class="text-lg">{title}</h3>
  {#if content}
    <CodeBlock {content} class="mb-2 max-h-96" />
  {:else}
    <div class="my-12 flex flex-col justify-start items-center gap-2">
      <div
        class="flex rounded-full items-center justify-center w-16 h-16 bg-gray-200"
      >
        <Icon
          icon={faSpinner}
          scale={1.2}
          class="block w-full h-full animate-spin"
        />
      </div>
      <h2 class="text-xl font-medium">In progress…</h2>
    </div>
  {/if}
</article>
