<script>import { page } from '$app/stores';
import { workflowRun, loading } from '../stores/workflow-run';
import { timelineEvents } from '../stores/events';
import PageTransition from '../holocene/page-transition.svelte';
import Header from './workflow-header.svelte';
import Loading from '$holocene/loading.svelte';
import { onDestroy } from 'svelte';
const { namespace } = $page.params;
onDestroy(() => {
    $timelineEvents = null;
});
</script>

<main class="flex h-full flex-col gap-6">
  {#if $loading}
    <Loading />
  {:else}
    <PageTransition>
      <Header
        {namespace}
        workflow={$workflowRun.workflow}
        workers={$workflowRun.workers}
      />
      <slot />
    </PageTransition>
  {/if}
</main>
