<script lang="ts">
  import { page } from '$app/stores';

  import { format } from '$lib/utilities/format-camel-case';
  import { routeForWorkflow } from '$lib/utilities/route-for';
  import {
    shouldDisplayAttribute,
    shouldDisplayAsWorkflowLink,
  } from '$lib/utilities/get-single-attribute-for-event';

  import CodeBlock from '$lib/components/code-block.svelte';
  import TableLink from '$lib/components/table-link.svelte';

  export let event: HistoryEventWithId;

  const { workflow, namespace } = $page.params;
</script>

<section>
  {#each Object.entries(event.attributes) as [key, value] (key)}
    {#if shouldDisplayAttribute(key, value)}
      <article
        class="flex gap-4 py-2 last:border-b-0 border-gray-200 first:pt-0 {$$props.class}"
      >
        <p class="w-96">{format(key)}</p>
        <div class="w-full">
          {#if typeof value === 'object'}
            <CodeBlock content={value} />
          {:else if shouldDisplayAsWorkflowLink(key)}
            <TableLink
              href={routeForWorkflow({ namespace, workflow, run: value })}
            >
              {value}
            </TableLink>
          {:else}
            <p><span class="bg-gray-300 text-gray-700 px-2">{value}</span></p>
          {/if}
        </div>
      </article>
    {/if}
  {/each}
</section>
