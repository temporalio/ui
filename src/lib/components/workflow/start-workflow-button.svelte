<script lang="ts">
  import { goto } from '$app/navigation';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForWorkflowStart } from '$lib/utilities/route-for';

  export let namespace: string;
  export let workflowId: string;
  export let taskQueue: string;
  export let workflowType: string;
  export let disabled = false;

  $: href = routeForWorkflowStart({
    namespace,
    workflowId,
    taskQueue,
    workflowType,
  });
</script>

<Tooltip text={translate('workflows.start-workflow-like-this-one')} right>
  <button
    {disabled}
    class="start-button"
    class:disabled
    on:click={() => goto(href)}
    {...$$restProps}
  >
    <Icon
      title={translate('workflows.start-workflow-like-this-one')}
      name="lightning-bolt"
    />
  </button>
</Tooltip>

<style lang="postcss">
  .start-button {
    @apply m-1 rounded-md border-2 border-[transparent] bg-transparent p-1 hover:surface-interactive-secondary focus-visible:surface-interactive-secondary focus-visible:border-indigo-600 focus-visible:outline-none;
  }

  .disabled {
    @apply cursor-not-allowed text-slate-100 hover:text-slate-100;
  }
</style>
