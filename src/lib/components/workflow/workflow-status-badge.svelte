<script lang="ts">
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Badge } from '$lib/io/badge';
  import {
    BadgeStatus,
    type BadgeStatusExtensions,
  } from '$lib/io/badge-status';
  import { IconClock, IconExclamationOctagon } from '$lib/io/icon';
  import type { WorkflowStatus } from '$lib/types/workflows';
  import { getWorkflowStatusLabel } from '$lib/utilities/get-status-label';

  interface Props {
    status: WorkflowStatus;
    delayed?: boolean;
    taskFailure?: boolean;
  }

  let { status, delayed = false, taskFailure = false }: Props = $props();

  const text = $derived(getWorkflowStatusLabel(status));
  const delayedText = $derived(translate('workflows.delayed'));
  const taskFailureText = $derived(translate('workflows.task-failure'));
  const extensions = $derived<BadgeStatusExtensions>([
    delayed && {
      TrailIcon: IconClock,
    },
    taskFailure && {
      colorScheme: 'danger',
      TrailIcon: IconExclamationOctagon,
    },
  ]);
  const modifierLabels = $derived([
    ...(delayed ? [delayedText] : []),
    ...(taskFailure ? [taskFailureText] : []),
  ]);
  const tooltipText = $derived(modifierLabels.join(', '));
  const accessibleLabel = $derived([text, ...modifierLabels].join(', '));
</script>

<Tooltip topLeft text={tooltipText} hide={!modifierLabels.length}>
  {#if status}
    <BadgeStatus
      {status}
      {text}
      {extensions}
      role="img"
      aria-label={accessibleLabel}
      data-testid="execution-status"
    />
  {:else}
    <Badge
      {text}
      role="img"
      aria-label={accessibleLabel}
      data-testid="execution-status"
    />
  {/if}
</Tooltip>
