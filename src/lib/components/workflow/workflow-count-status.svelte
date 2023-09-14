<script lang="ts">
import type { WorkflowStatus as Status } from '$lib/types/workflows';

import WorkflowStatus from '../workflow-status.svelte';

export let status: Status | 'all' = 'all';
export let count = 0;
</script>

<WorkflowStatus count={count} status={status} />
