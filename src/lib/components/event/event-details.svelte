<script lang="ts">
  import { format } from '$lib/utilities/format-camel-case';
  import CodeBlock from '$lib/components/code-block.svelte';
  import { shouldDisplayAttribute } from '$lib/utilities/get-single-attribute-for-event';
  export let event: HistoryEventWithId;
</script>

<section>
  {#each Object.entries(event.attributes) as [key, value] (key)}
    {#if shouldDisplayAttribute(key, value)}
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
