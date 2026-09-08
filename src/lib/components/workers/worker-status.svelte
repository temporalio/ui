<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import Badge, { type BadgeColorScheme } from '$lib/io/badge/badge.svelte';
  import type { WorkerStatus } from '$lib/models/worker-status';

  interface Props {
    status?: WorkerStatus;
  }

  let { status = 'Running' }: Props = $props();

  const colorSchemeByWorkerStatus: Record<WorkerStatus, BadgeColorScheme> = {
    Running: 'info',
    Unspecified: 'neutral',
    ShuttingDown: 'warning',
  };

  const label: Record<WorkerStatus, string> = {
    Running: translate('workflows.running'),
    ShuttingDown: translate('workers.shutting-down'),
    Unspecified: translate('events.event-classification.unspecified'),
  };
</script>

<Badge text={label[status]} colorScheme={colorSchemeByWorkerStatus[status]} />
