<script lang="ts">
  import { page } from '$app/stores';

  import { format } from '$lib/utilities/format-camel-case';
  import { routeForWorkflow } from '$lib/utilities/route-for';
  import { shouldDisplayAsWorkflowLink } from '$lib/utilities/get-single-attribute-for-event';

  import CodeBlock from '../code-block.svelte';
  import TableLink from '$lib/components/table-link.svelte';

  export let key: string;
  export let value: string | Record<string, unknown>;

  const { workflow, namespace } = $page.params;
</script>

<article
  class="flex flex-column justify-between xl:flex-row gap-2 xl:gap-4 py-2 last:border-b-0 border-gray-200 first:pt-0 {$$props.class}"
>
  <p class="w-1/2 text-normal">{format(key)}</p>
  <div class="flex-grow w-full text-right xl:text-left">
    {#if typeof value === 'object'}
      <CodeBlock content={value} />
    {:else if shouldDisplayAsWorkflowLink(key)}
      <TableLink href={routeForWorkflow({ namespace, workflow, run: value })}
        >{value}</TableLink
      >
    {:else}
      <p>
        <span class="bg-gray-300 text-gray-700 px-2">{value}</span>
      </p>
    {/if}
  </div>
</article>
