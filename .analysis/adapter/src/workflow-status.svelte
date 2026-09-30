<script lang="ts">
  import WorkflowStatusBadge from '$lib/components/workflow/workflow-status-badge.svelte';
  import type { WorkflowStatus as WorkflowStatusValue } from '$lib/types/workflows';

  import { ensureI18n } from './ensure-i18n';
  import './workflow-status.css';

  // Named export so svelte-package can emit declarations (anonymous Props breaks d.ts).
  export type WorkflowStatusProps = {
    status: WorkflowStatusValue;
    delayed?: boolean;
    taskFailure?: boolean;
  };

  let {
    status,
    delayed = false,
    taskFailure = false,
  }: WorkflowStatusProps = $props();
</script>

{#await ensureI18n() then}
  <div class="temporal-ui" data-forkbomb="workflow-status">
    <WorkflowStatusBadge {status} {delayed} {taskFailure} />
  </div>
{/await}
