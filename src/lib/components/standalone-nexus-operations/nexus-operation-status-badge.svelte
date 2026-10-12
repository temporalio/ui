<script lang="ts">
  import { BadgeStatus } from '$lib/io/badge-status';
  import type { NexusOperationExecutionStatus } from '$lib/types/nexus-operation-execution';
  import { toNexusOperationStatus } from '$lib/utilities/get-nexus-operation-status-and-count';

  interface Props {
    status: NexusOperationExecutionStatus;
  }

  let { status }: Props = $props();

  const badgeStatus = $derived(toNexusOperationStatus(status));
</script>

<BadgeStatus status={badgeStatus} data-testid="execution-status" />
