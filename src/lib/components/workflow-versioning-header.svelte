<script lang="ts">
  import CompatibilityBadge from '$lib/holocene/compatibility-badge.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { getCurrentWorkflowBuildId } from '$lib/utilities/task-queue-compatibility';

  export let workflow: WorkflowExecution | null;

  $: buildId = getCurrentWorkflowBuildId(workflow);
</script>

<p class="flex items-center gap-1">
  <span>{translate('workers.buildId')}</span><CompatibilityBadge
    active
    {buildId}
  />
</p>
