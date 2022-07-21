<script lang="ts">
  import { page } from '$app/stores';

  import { format } from '$lib/utilities/format-camel-case';
  import {
    routeForWorkflow,
    routeForTaskQueue,
  } from '$lib/utilities/route-for';
  import {
    shouldDisplayAsExecutionLink,
    shouldDisplayAsTaskQueueLink,
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
    <h2 class="min-w-fit items-center text-sm xl:items-start">
      {format(key)}
    </h2>
    <CodeBlock content={getCodeBlockValue(value)} class="w-full" {inline} />
  {:else if shouldDisplayAsExecutionLink(key)}
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
  {:else if shouldDisplayAsTaskQueueLink(key)}
    <div class="xl:3/4 flex w-full items-center xl:items-start">
      <h2 class="mr-3 text-sm">{format(key)}</h2>
      <div class="text-sm">
        <Copyable
          content={value}
          container-class="flex-row-reverse xl:flex-row"
        >
          <Link href={routeForTaskQueue({ namespace, queue: value })}>
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
