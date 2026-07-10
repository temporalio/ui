<script lang="ts">
  import { goto } from '$app/navigation';

  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForWorkflowStart } from '$lib/utilities/route-for';

  export let namespace: string;
  export let workflowId: string;
  export let runId: string;
  export let taskQueue: string | undefined;
  export let workflowType: string;

  $: href = routeForWorkflowStart({
    namespace,
    workflowId,
    runId,
    taskQueue,
    workflowType,
  });
</script>

<Tooltip
  usePortal
  text={translate('workflows.start-workflow-like-this-one')}
  topLeft
>
  <Button
    size="xs"
    variant="ghost"
    class="start-button"
    leadingIcon="lightning-bolt"
    aria-label={translate('workflows.start-workflow-like-this-one')}
    on:click={() => goto(href)}
    {...$$restProps}
  ></Button>
</Tooltip>
