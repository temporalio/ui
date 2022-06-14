<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';

  import { events, updating } from '$lib/stores/events';

  import { getWorkflowStartedAndCompletedEvents } from '$lib/utilities/get-started-and-completed-events';
  import { capitalize } from '$lib/utilities/format-camel-case';

  import CodeBlock from '$lib/components/code-block.svelte';

  export let type: 'input' | 'results';

  $: title = capitalize(type);
  $: content = getWorkflowStartedAndCompletedEvents($events)[type];
</script>

<article
  class="flex w-full flex-col rounded-lg border-2 border-gray-300 p-4 lg:w-1/2"
  data-cy="workflow-{type}"
>
  <h3 class="text-lg">{title}</h3>
  {#if content}
    {#if $updating}
      <div class="my-12 flex flex-col items-center justify-start gap-2">
        <div
          class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200"
        >
          <Icon
            name="spinner"
            scale={0.5}
            class="block h-full w-full animate-spin"
          />
        </div>
      </div>
    {:else}
      <CodeBlock {content} class="mb-2 max-h-96" />
    {/if}
  {:else}
    <div class="my-12 flex flex-col items-center justify-start gap-2">
      <div
        class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200"
      >
        <Icon
          name="spinner"
          scale={0.5}
          class="block h-full w-full animate-spin"
        />
      </div>
      <h2 class="text-xl font-medium">In progress…</h2>
    </div>
  {/if}
</article>
