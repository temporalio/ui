<script>import { page } from '$app/stores';
import { format } from '../../utilities/format-camel-case';
import { routeForWorkflow, routeForTaskQueue, } from '../../utilities/route-for';
import { getCodeBlockValue, shouldDisplayAsExecutionLink, shouldDisplayAsTaskQueueLink, shouldDisplayAsPlainText, } from '../../utilities/get-single-attribute-for-event';
import CodeBlock from '../../holocene/code-block.svelte';
import Link from '../../holocene/link.svelte';
import Copyable from '../copyable.svelte';
export let key;
export let value;
export let inline = false;
const { workflow, namespace, run } = $page.params;
</script>

<article class="row flex px-4 first:pt-0 {$$props.class}">
  {#if typeof value === 'object'}
    <div class="code-block-row">
      <h2 class="text-sm">
        {format(key)}
      </h2>
      <CodeBlock
        content={getCodeBlockValue(value)}
        class="w-full text-right lg:h-auto"
        {inline}
      />
    </div>
  {:else if shouldDisplayAsExecutionLink(key)}
    <div class="detail-row">
      <h2 class="text-sm">{format(key)}</h2>
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
    <div class="detail-row">
      <h2 class="text-sm">{format(key)}</h2>
      <div class="text-sm">
        <Copyable content={value} container-class="xl:flex-row">
          <Link href={routeForTaskQueue({ namespace, queue: value })}>
            {value}
          </Link>
        </Copyable>
      </div>
    </div>
  {:else}
    <div class="detail-row">
      <h2 class="text-sm">{format(key)}</h2>
      <p class="text-sm">
        <span
          class="select-all px-2"
          class:badge={!shouldDisplayAsPlainText(key)}>{value}</span
        >
      </p>
    </div>
  {/if}
</article>

<style>
  .code-block-row {
    display: block;
    width: 100%;
    border-bottom-width: 2px;
    --tw-border-opacity: 1;
    border-color: rgb(228 228 231 / var(--tw-border-opacity));
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    text-align: left
}
  .detail-row {
    display: block;
    width: 100%;
    align-items: flex-start;
    gap: 1rem;
    border-bottom-width: 2px;
    --tw-border-opacity: 1;
    border-color: rgb(228 228 231 / var(--tw-border-opacity));
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    text-align: left
}
  @media (min-width: 1280px) {
    .detail-row {
        display: flex
    }
}
  .row:last-of-type .detail-row {
    border-bottom-width: 0px
}
  .row:last-of-type .code-block-row {
    border-bottom-width: 0px
}
  .badge {
    --tw-bg-opacity: 1;
    background-color: rgb(212 212 216 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(63 63 70 / var(--tw-text-opacity))
}</style>
