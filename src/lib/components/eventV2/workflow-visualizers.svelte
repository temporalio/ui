<script lang="ts">
  import { page } from '$app/stores';
  import { routeForEventHistory } from '$lib/utilities/route-for';
  import { workflowRun } from '$lib/stores/workflow-run';
  import Card from '$lib/holocene/card.svelte';

  $: ({ workflow, namespace } = $page.params);
</script>

<div class="flex gap-4">
  <Card />
</div>
