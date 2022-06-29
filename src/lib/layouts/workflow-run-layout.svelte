<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun, loading } from '$lib/stores/workflow-run';

  import PageTransition from '$lib/holocene/page-transition.svelte';
  import Header from '$lib/layouts/workflow-header.svelte';
  import Loading from '$lib/components/loading.svelte';

  const { namespace } = $page.params;
</script>

<main class="flex h-full flex-col gap-6">
  {#if !$loading}
    <PageTransition>
      <Header
        {namespace}
        workflow={$workflowRun.workflow}
        workers={$workflowRun.workers}
      />
      <slot />
    </PageTransition>
  {:else}
    <Loading />
  {/if}
</main>
