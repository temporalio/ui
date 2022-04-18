<script lang="ts">
  import { page } from '$app/stores';

  import { format } from '$lib/utilities/format-camel-case';
  import { routeForWorkflow } from '$lib/utilities/route-for';
  import { shouldDisplayAsWorkflowLink } from '$lib/utilities/get-single-attribute-for-event';

  import CodeBlock from '../code-block.svelte';
  import Link from '../link.svelte';
  import Copyable from '../copyable.svelte';

  export let key: string;
  export let value: string | Record<string, unknown>;

  const { workflow, namespace } = $page.params;
</script>

<article
  class="flex flex-column justify-between xl:flex-row xl:gap-4 gap-2 py-2 last:border-b-0 border-gray-200 first:pt-0 {$$props.class}"
>
  <p class="w-1/2 text-normal">{format(key)}</p>
  <div class="flex-grow w-full text-right xl:text-left">
    {#if typeof value === 'object'}
      <CodeBlock content={value} />
    {:else if shouldDisplayAsWorkflowLink(key)}
      <Copyable content={value}>
        <Link href={routeForWorkflow({ namespace, workflow, run: value })}>
          {value}
        </Link>
      </Copyable>
    {:else}
      <p>
        <span class="bg-gray-300 text-gray-700 px-2 select-all">{value}</span>
      </p>
    {/if}
  </div>
</article>
