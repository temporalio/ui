<script lang="ts">
  type Props = {
    triggerConfirmation: () => void;
    backfillConfirmation: () => void;
  };
  let { triggerConfirmation, backfillConfirmation }: Props = $props();

  import Button from '$lib/holocene/button.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import { translate } from '$lib/i18n/translate';
</script>

<EmptyState
  icon="heartbeat"
  title="This Schedule hasn’t triggered any Workflow Execution runs yet."
>
  <p>Runs will appear here once triggered.</p>
  <div class="flex gap-2">
    <Button leadingIcon="play" on:click={triggerConfirmation} variant="ghost">
      {translate('schedules.trigger-now')}
    </Button>
    <Button leadingIcon="retry" on:click={backfillConfirmation} variant="ghost">
      {translate('schedules.backfill-schedule')}
    </Button>
  </div>
</EmptyState>
