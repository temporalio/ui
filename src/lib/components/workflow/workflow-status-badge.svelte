<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Badge } from '$lib/io/badge';
  import {
    BadgeStatus,
    type BadgeStatusExtensions,
  } from '$lib/io/badge-status';
  import {
    IconClock,
    IconExclamationOctagon,
    IconTemporalTimeskippingOn,
  } from '$lib/io/icon';
  import { isWorkflowStatusType } from '$lib/models/workflow-status';
  import type { WorkflowStatus } from '$lib/types/workflows';
  import { getWorkflowStatusLabel } from '$lib/utilities/get-workflow-status-label';

  interface Props extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children' | 'class'
  > {
    status: WorkflowStatus;
    delayed?: boolean;
    taskFailure?: boolean;
    timeSkippingEnabled?: boolean;
  }

  let {
    status,
    delayed = false,
    taskFailure = false,
    timeSkippingEnabled = false,
    ...rest
  }: Props = $props();

  const delayedText = $derived(translate('workflows.delayed'));
  const taskFailureText = $derived(translate('workflows.task-failure'));
  const timeSkippingEnabledText = $derived(
    translate('workflows.time-skipping-enabled'),
  );
  const extensions = $derived<BadgeStatusExtensions>([
    timeSkippingEnabled && {
      colorScheme: 'neutral',
      TrailIcon: IconTemporalTimeskippingOn,
    },
    delayed && {
      colorScheme: 'warning',
      TrailIcon: IconClock,
    },
    taskFailure && {
      colorScheme: 'danger',
      TrailIcon: IconExclamationOctagon,
    },
  ]);
  const modifierLabels = $derived([
    ...(timeSkippingEnabled ? [timeSkippingEnabledText] : []),
    ...(delayed ? [delayedText] : []),
    ...(taskFailure ? [taskFailureText] : []),
  ]);
  const tooltipText = $derived(modifierLabels.join(', '));
</script>

<Tooltip topLeft text={tooltipText} hide={!modifierLabels.length}>
  {#if status && isWorkflowStatusType(status)}
    <BadgeStatus
      {status}
      {extensions}
      {...rest}
      data-testid="execution-status"
    />
  {:else}
    <Badge
      text={getWorkflowStatusLabel(status)}
      {...rest}
      data-testid="execution-status"
    />
  {/if}
</Tooltip>
