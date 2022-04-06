<script lang="ts">
  import { page } from '$app/stores';
  import { routeForWorkflow } from '$lib/utilities/route-for';
  import {
    getSingleAttributeForEvent,
    shouldDisplayAsWorkflowLink,
  } from '$lib/utilities/get-single-attribute-for-event';
  import CodeBlock from '../code-block.svelte';
  import TableLink from '$lib/components/table-link.svelte';

  export let event: HistoryEventWithId | null = null;
  export let eventGroup: CompactEventGroup | null = null;

  let { key, value } = getSingleAttributeForEvent({ event, eventGroup });
  const { workflow, namespace } = $page.params;
</script>

<section>
  <article
    class="flex py-2 last:border-b-0 border-gray-200 first:pt-0 {$$props.class}"
  >
    <h4 class="w-96 flex-grow text-normal">{key}</h4>
    <div class="flex-grow w-full">
      {#if eventGroup}
        <CodeBlock content={value} />
      {:else if shouldDisplayAsWorkflowLink(key)}
        <TableLink href={routeForWorkflow({ namespace, workflow, run: value })}
          >{value}</TableLink
        >
      {:else}
        <p><span class="bg-gray-300 text-gray-700 px-2">{value}</span></p>
      {/if}
    </div>
  </article>
</section>
