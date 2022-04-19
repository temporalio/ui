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
  class="flex flex-col justify-between xl:flex-row xl:gap-4 gap-2 py-2 last:border-b-0 border-gray-200 first:pt-0 {$$props.class}"
>
  {#if typeof value === 'object'}
    <h2 class="w-full xl:w-1/4 text-sm">{format(key)}</h2>
    <CodeBlock content={value} class="w-full xl:w-3/4" />
  {:else if shouldDisplayAsWorkflowLink(key)}
    <div class="flex w-full xl:3/4">
      <h2 class="w-full xl:w-1/4 text-sm">{format(key)}</h2>
      <div class="w-full xl:w-3/4 text-sm">
        <Copyable content={value} container-class="flex-row-reverse">
          <Link href={routeForWorkflow({ namespace, workflow, run: value })}>
            {value}
          </Link>
        </Copyable>
      </div>
    </div>
  {:else}
    <div class="flex w-full xl:3/4">
      <h2 class="w-full xl:w-1/4 text-sm">{format(key)}</h2>
      <p class="w-full xl:w-3/4 text-sm text-right">
        <span class="bg-gray-300 text-gray-700 px-2 select-all">{value}</span>
      </p>
    </div>
  {/if}
</article>
