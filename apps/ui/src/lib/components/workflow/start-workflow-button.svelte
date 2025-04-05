<script lang="ts">
  import { goto } from '$app/navigation';

  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForWorkflowStart } from '$lib/utilities/route-for';

  export let namespace: string;
  export let workflowId: string;
  export let taskQueue: string;
  export let workflowType: string;

  $: href = routeForWorkflowStart({
    namespace,
    workflowId,
    taskQueue,
    workflowType,
  });
</script>

<Tooltip text={translate('workflows.start-workflow-like-this-one')} topLeft>
  <Button
    size="xs"
    variant="ghost"
    class="start-button"
    leadingIcon="lightning-bolt"
    on:click={() => goto(href)}
    {...$$restProps}
  ></Button>
</Tooltip>
