<script lang="ts">
  import WorkflowJsonNavigator from '$lib/holocene/workflow-json-navigator.svelte';

  import { importEvents } from '$lib/stores/import-events';
</script>

<WorkflowJsonNavigator events={$importEvents} />
