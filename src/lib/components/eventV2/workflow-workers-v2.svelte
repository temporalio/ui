<script lang="ts">
  import { workflowRun } from '$lib/stores/workflow-run';

  import Accordion from '$lib/holocene/accordion.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import WorkersListV2 from './workers-list-v2.svelte';

  export let taskQueue: string;

  $: ({ workers } = $workflowRun);
</script>

<section>
  <Accordion title="Workers">
    <div slot="summary" class="flex gap-2">
      <Badge type="green">{workers?.pollers?.length}</Badge>
      <Badge type="alpha">{taskQueue}</Badge>
    </div>
    <WorkersListV2 {workers} />
  </Accordion>
</section>
