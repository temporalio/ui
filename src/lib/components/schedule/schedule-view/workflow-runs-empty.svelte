<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    class?: string;
    openTriggerConfirmationModal: () => void;
    openBackfillConfirmationModal: () => void;
  }

  const {
    class: className,
    openBackfillConfirmationModal,
    openTriggerConfirmationModal,
  }: Props = $props();
</script>

<EmptyState
  class={className}
  icon="heartbeat"
  title={translate('schedules.workflow-runs-empty-state-title')}
>
  <p>{translate('schedules.workflow-runs-empty-state-description')}</p>
  <div class="flex gap-2">
    <Button
      leadingIcon="play"
      on:click={openTriggerConfirmationModal}
      variant="ghost"
    >
      {translate('schedules.trigger-now')}
    </Button>
    <Button
      leadingIcon="retry"
      on:click={openBackfillConfirmationModal}
      variant="ghost"
    >
      {translate('schedules.backfill-schedule')}
    </Button>
  </div>
</EmptyState>
