<script lang="ts">
  import WorkflowJsonNavigator from '$lib/components/workflow/workflow-json-navigator.svelte';

  import { importEvents } from '$lib/stores/import-events';
</script>

<WorkflowJsonNavigator events={$importEvents} />
