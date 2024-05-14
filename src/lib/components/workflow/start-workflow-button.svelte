<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { goto } from '$app/navigation';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { routeForWorkflowStart } from '$lib/utilities/route-for';

  export let namespace: string;
  export let workflowId: string;
  export let taskQueue: string;
  export let workflowType: string;

  let className = '';
  export { className as class };

  $: href = routeForWorkflowStart({
    namespace,
    workflowId,
    taskQueue,
    workflowType,
  });
</script>

<Tooltip text="Start Workflow" topLeft>
  <button
    class={merge('start-button', className)}
    on:click={() => goto(href)}
    {...$$restProps}
  >
    <Icon title="Start Workflow" name="lightning-bolt" />
  </button>
</Tooltip>

<style lang="postcss">
  .start-button {
    @apply m-1 rounded-md border-2 border-[transparent] bg-transparent p-1 hover:surface-interactive-secondary focus-visible:surface-interactive-secondary focus-visible:border-indigo-600 focus-visible:outline-none;
  }
</style>
