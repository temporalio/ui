<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { Badge } from '$lib/io/badge';
  import {
    BadgeStatus,
    type BadgeStatusExtensions,
  } from '$lib/io/badge-status';
  import { IconPause } from '$lib/io/icon';
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
  }

  let { status, ...rest }: Props = $props();

  const text = $derived(getWorkflowStatusLabel(status));

  const extensions = $derived.by<BadgeStatusExtensions>(() => {
    switch (status) {
      case 'Paused': {
        return [
          {
            colorScheme: 'warning',
            TrailIcon: IconPause,
          },
        ];
      }

      default: {
        return [];
      }
    }
  });
</script>

{#if status && isWorkflowStatusType(status)}
  <BadgeStatus
    {status}
    {text}
    {extensions}
    {...rest}
    data-testid="execution-status"
  />
{:else}
  <Badge {text} {...rest} data-testid="execution-status" />
{/if}
