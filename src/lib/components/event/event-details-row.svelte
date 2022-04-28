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
  class="flex flex-row xl:gap-4 gap-2 py-2 last:border-b-0 border-b-2 border-gray-200 first:pt-0 {$$props.class}"
>
  {#if typeof value === 'object'}
    <h2 class="w-full items-center xl:items-start xl:w-1/3 text-sm">
      {format(key)}
    </h2>
    <CodeBlock
      content={getCodeBlockValue(value)}
      class="w-full w-96 md:w-auto xl:w-2/3"
      {inline}
    />
  {:else if shouldDisplayAsWorkflowLink(key)}
    <div class="flex items-center xl:items-start w-full xl:3/4">
      <h2 class="w-full xl:w-1/3 text-sm">{format(key)}</h2>
      <div class="w-full xl:w-2/3 text-sm">
        <Copyable
          content={value}
          container-class="flex-row-reverse xl:flex-row"
          size="xs"
        >
          <Link
            href={routeForWorkflow({ namespace, workflow, run: value })}
            class="whitespace-nowrap"
          >
            {value}
          </Link>
        </Copyable>
      </div>
    </div>
  {:else if shouldDisplayAsWorkersLink(key)}
    <div class="flex items-center xl:items-start w-full xl:3/4">
      <h2 class="w-full xl:w-1/3 text-sm">{format(key)}</h2>
      <div class="w-full xl:w-2/3 text-sm">
        <Copyable
          content={value}
          container-class="flex-row-reverse xl:flex-row"
          size="xs"
        >
          <Link
            href={routeForWorkers({ namespace, workflow, run })}
            class="whitespace-nowrap"
          >
            {value}
          </Link>
        </Copyable>
      </div>
    </div>
  {:else}
    <div class="flex items-center xl:items-start w-full xl:3/4">
      <h2 class="w-full xl:w-1/3 text-sm">{format(key)}</h2>
      <p class="w-full xl:w-2/3 text-sm text-right xl:text-left">
        <span
          class="text-gray-700 px-2 select-all"
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
