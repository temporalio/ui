<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun, loading } from '$lib/stores/workflow-run';

  import PageTransition from '$lib/holocene/page-transition.svelte';
  import Header from '$lib/layouts/workflow-header.svelte';

  const { namespace } = $page.params;
</script>

<PageTransition>
  <main class="flex h-full flex-col gap-6">
    {#if !$loading}
      <Header
        {namespace}
        workflow={$workflowRun.workflow}
        workers={$workflowRun.workers}
      />
      <slot />
    {/if}
  </main>
</PageTransition>
