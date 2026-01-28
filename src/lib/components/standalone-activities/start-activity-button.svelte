<script lang="ts">
  import { goto } from '$app/navigation';

  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForStartStandaloneActivity } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    activityId: string;
    activityType: string;
    taskQueue: string;
    scheduleToCloseTimeout?: string;
    startToCloseTimeout?: string;
  }

  let {
    namespace,
    activityId,
    activityType,
    taskQueue,
    scheduleToCloseTimeout,
    startToCloseTimeout,
  }: Props = $props();

  const href = $derived(
    routeForStartStandaloneActivity({
      namespace,
      activityId,
      activityType,
      taskQueue,
      scheduleToCloseTimeout,
      startToCloseTimeout,
    }),
  );
</script>

<Tooltip
  text={translate('standalone-activities.start-activity-like-this-one')}
  topLeft
>
  <Button
    size="xs"
    variant="ghost"
    class="start-button"
    leadingIcon="lightning-bolt"
    on:click={() => goto(href)}
  ></Button>
</Tooltip>
