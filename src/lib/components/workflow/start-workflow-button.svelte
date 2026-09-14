<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import { goto } from '$app/navigation';

  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconLightningBolt } from '$lib/io/icon';
  import { routeForWorkflowStart } from '$lib/utilities/route-for';

  type Props = ComponentProps<typeof Button> & {
    namespace: string;
    workflowId: string;
    runId: string;
    taskQueue: string | undefined;
    workflowType: string;
  };

  let {
    namespace,
    workflowId,
    runId,
    taskQueue,
    workflowType,
    ...rest
  }: Props = $props();

  const href = $derived(
    routeForWorkflowStart({
      namespace,
      workflowId,
      runId,
      taskQueue,
      workflowType,
    }),
  );
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
    LeadingIcon={IconLightningBolt}
    aria-label={translate('workflows.start-workflow-like-this-one')}
    onclick={() => goto(href)}
    {...rest}
  ></Button>
</Tooltip>
