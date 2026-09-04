<script lang="ts">
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    BadgeStatus,
    type BadgeStatusExtensions,
  } from '$lib/io/badge-status';
  import { IconClock } from '$lib/io/icon';
  import type { ActivityStatus } from '$lib/utilities/get-activity-status-and-count';
  import { getWorkflowStatusLabel } from '$lib/utilities/get-workflow-status-label';

  interface Props {
    status: ActivityStatus;
    delayed?: boolean;
  }

  let { status, delayed = false }: Props = $props();

  const text = $derived(getWorkflowStatusLabel(status));
  const delayedText = $derived(translate('workflows.delayed'));
  const extensions = $derived<BadgeStatusExtensions>([
    delayed && {
      TrailIcon: IconClock,
    },
  ]);
</script>

<Tooltip topLeft text={delayedText} hide={!delayed}>
  <BadgeStatus {status} {text} {extensions} data-testid="execution-status" />
</Tooltip>
