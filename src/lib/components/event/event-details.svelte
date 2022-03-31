<script lang="ts">
  import { format } from '$lib/utilities/format-camel-case';
  import CodeBlock from '$lib/components/code-block.svelte';

  export let event: HistoryEventWithId;

  const shouldDisplay = (key: string, value: unknown): boolean => {
    if (value === null) return false;
    if (value === undefined) return false;
    if (value === '') return false;
    if (value === '0s') return false;
    if (key === 'type') return false;
    return true;
  };
</script>

<section>
  {#each Object.entries(event.attributes) as [key, value] (key)}
    {#if shouldDisplay(key, value)}
      <article
        class="flex py-2 last:border-b-0 border-gray-200 first:pt-0 {$$props.class}"
      >
        <p class="w-96 flex-grow">{format(key)}</p>
        <div class="flex-grow w-full">
          {#if typeof value === 'object'}
            <CodeBlock content={value} />
          {:else}
            <p><span class="bg-gray-300 text-gray-700 px-2">{value}</span></p>
          {/if}
        </div>
      </article>
    {/if}
  {/each}
</section>
