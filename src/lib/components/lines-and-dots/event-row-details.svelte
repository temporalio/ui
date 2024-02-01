<script lang="ts">
  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import type { Payloads } from '$lib/types';
  import { format } from '$lib/utilities/format-camel-case';
  import type { CombinedAttributes } from '$lib/utilities/format-event-attributes';
  import {
    shouldDisplayAsExecutionLink,
    shouldDisplayAsPlainText,
    shouldDisplayAsTaskQueueLink,
    shouldDisplayChildWorkflowLink,
  } from '$lib/utilities/get-single-attribute-for-event';
  import {
    routeForEventHistory,
    routeForTaskQueue,
  } from '$lib/utilities/route-for';

  export let key: string;
  export let value: string | Record<string, unknown> | Payloads;
  export let attributes: CombinedAttributes;

  const { workflow, namespace } = $page.params;

  $: isLink =
    shouldDisplayAsExecutionLink(key) ||
    shouldDisplayChildWorkflowLink(key, attributes) ||
    shouldDisplayAsTaskQueueLink(key);

  const getIconAndHref = () => {
    let href, icon;
    if (shouldDisplayAsExecutionLink(key)) {
      href = routeForEventHistory({
        namespace,
        workflow,
        run: value,
      });
      icon = 'workflow';
    } else if (shouldDisplayChildWorkflowLink(key, attributes)) {
      href = routeForEventHistory({
        namespace,
        workflow: attributes.workflowExecutionWorkflowId,
        run: attributes.workflowExecutionRunId,
      });
      icon = 'relationship';
    } else {
      href = routeForTaskQueue({ namespace, queue: value });
      icon = 'merge';
    }
    return { href, icon };
  };
</script>

<div
  class="flex flex-row items-center gap-2 first:pt-0 last:border-b-0 xl:gap-4 {$$props.class}"
>
  <div class="flex w-full flex-wrap items-center gap-1 pr-1">
    {#if typeof value === 'object'}
      <Tooltip text={format(key)} top>
        <Icon name="json" />
      </Tooltip>
    {:else if isLink}
      {@const { icon, href } = getIconAndHref()}
      <Tooltip text={value} top>
        <Link class="truncate" {href}>
          <Icon name={icon} />
        </Link>
      </Tooltip>
    {:else}
      <Tooltip text={format(key)} top>
        <p class="max-w-[300px] truncate text-right text-sm xl:text-left">
          <span
            class="select-all text-slate-50"
            class:badge={!shouldDisplayAsPlainText(key)}>{value}</span
          >
        </p>
      </Tooltip>
    {/if}
  </div>
</div>

<style lang="postcss">
  .badge {
    @apply rounded-lg bg-slate-800 px-2 py-1 text-slate-50;
  }
</style>
