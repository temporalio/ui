<script lang="ts">
  import { page } from '$app/stores';

  import { isEventGroup } from '$lib/models/group-events';

  import { format } from '$lib/utilities/format-camel-case';
  import { routeForWorkflow } from '$lib/utilities/route-for';
  import { shouldDisplayAsWorkflowLink } from '$lib/utilities/get-single-attribute-for-event';

  import CodeBlock from '../code-block.svelte';
  import TableLink from '$lib/components/table-link.svelte';

  export let key: string;
  export let value: string;

  const { workflow, namespace } = $page.params;
</script>

<section>
  <article
    class="flex gap-4 py-2 last:border-b-0 border-gray-200 first:pt-0 {$$props.class}"
  >
    <h4 class="w-1/3 text-normal">{format(key)}</h4>
    <div class="flex-grow w-full">
      {#if typeof value === 'object' || isEventGroup(value)}
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
