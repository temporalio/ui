<script lang="ts">
  import { BadgeStatus } from '$lib/io/badge-status';
  import type { NexusOperationExecutionStatus } from '$lib/types/nexus-operation-execution';
  import { toNexusOperationStatus } from '$lib/utilities/get-nexus-operation-status-and-count';
  import { getWorkflowStatusLabel } from '$lib/utilities/get-workflow-status-label';

  interface Props {
    status: NexusOperationExecutionStatus;
  }

  let { status }: Props = $props();

  const badgeStatus = $derived(toNexusOperationStatus(status));
  const text = $derived(getWorkflowStatusLabel(badgeStatus));
</script>

<BadgeStatus status={badgeStatus} {text} data-testid="execution-status" />
