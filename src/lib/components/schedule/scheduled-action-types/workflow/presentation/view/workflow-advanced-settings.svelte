<script lang="ts">
  import { translate } from '$lib/i18n/translate';

  import type { WorkflowSchedule } from '../../types';

  type Props = {
    schedule: WorkflowSchedule;
  };

  let { schedule }: Props = $props();

  const keepOriginalWorkflowId = $derived(
    schedule.schedule.policies?.keepOriginalWorkflowId,
  );
</script>

{#if keepOriginalWorkflowId != null}
  <div>
    <dt class="text-secondary">
      {translate('schedules.keep-original-workflow-id')}
    </dt>
    <dd>
      {keepOriginalWorkflowId
        ? translate('common.true')
        : translate('common.false')}
    </dd>
  </div>
{/if}
