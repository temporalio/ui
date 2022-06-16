<script lang="ts">
  import { page } from '$app/stores';

  import { format } from '$lib/utilities/format-camel-case';
  import { routeForWorkflow, routeForWorkers } from '$lib/utilities/route-for';
  import {
    shouldDisplayAsWorkflowLink,
    shouldDisplayAsWorkersLink,
    shouldDisplayAsPlainText,
    getCodeBlockValue,
  } from '$lib/utilities/get-single-attribute-for-event';

  import CodeBlock from '../code-block.svelte';
  import Link from '../link.svelte';
  import Copyable from '../copyable.svelte';

  export let key: string;
  export let value: string | Record<string, unknown>;
  export let inline = false;

  const { workflow, namespace, run } = $page.params;
</script>

<article
  class="flex flex-row gap-2 border-b-2 border-gray-200 py-2 first:pt-0 last:border-b-0 xl:gap-4 {$$props.class}"
>
  {#if typeof value === 'object'}
    {@const content = getCodeBlockValue(value)}
    <h2 class="min-w-fit items-center text-sm xl:items-start">
      {format(key)}
    </h2>
    {#key content}
      <CodeBlock {content} class="w-full" {inline} />
    {/key}
  {:else if shouldDisplayAsWorkflowLink(key)}
    <div class="xl:3/4 flex w-full items-center xl:items-start">
      <h2 class="mr-3 text-sm">{format(key)}</h2>
      <div class="text-sm">
        <Copyable
          content={value}
          container-class="flex-row-reverse xl:flex-row"
        >
          <Link href={routeForWorkflow({ namespace, workflow, run: value })}>
            {value}
          </Link>
        </Copyable>
      </div>
    </div>
  {:else if shouldDisplayAsWorkersLink(key)}
    <div class="xl:3/4 flex w-full items-center xl:items-start">
      <h2 class="mr-3 text-sm">{format(key)}</h2>
      <div class="text-sm">
        <Copyable
          content={value}
          container-class="flex-row-reverse xl:flex-row"
        >
          <Link href={routeForWorkers({ namespace, workflow, run })}>
            {value}
          </Link>
        </Copyable>
      </div>
    </div>
  {:else}
    <div class="xl:3/4 flex w-full items-center xl:items-start">
      <h2 class="mr-3 text-sm">{format(key)}</h2>
      <p class="text-right text-sm xl:text-left">
        <span
          class="select-all px-2 text-gray-700"
          class:badge={!shouldDisplayAsPlainText(key)}>{value}</span
        >
      </p>
    </div>
  {/if}
</article>

<style lang="postcss">
  .badge {
    @apply bg-gray-300;
  }
</style>
