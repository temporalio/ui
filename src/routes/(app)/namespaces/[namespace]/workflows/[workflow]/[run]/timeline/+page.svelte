<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import LegacyWorkflowTimelineLayout from '$lib/layouts/workflow-timeline-layout.svelte';
  import { shouldUseNewWorkflowTimeline } from '$lib/workflow-view/timeline/feature';
  import WorkflowView from '$lib/workflow-view/workflow-view.svelte';

  const workflow = $derived(page.params.workflow);
  const identity = $derived({
    namespace: page.params.namespace,
    workflowId: page.params.workflow,
    runId: page.params.run,
  });
  const newTimelineEnabled = $derived(
    shouldUseNewWorkflowTimeline(page.url, page.route.id),
  );
</script>

<PageTitle
  title={`${translate('workflows.timeline-tab')} | ${workflow}`}
  url={page.url.href}
/>
{#if newTimelineEnabled}
  {#key page.url.pathname}
    <WorkflowView {identity} />
  {/key}
{:else}
  <LegacyWorkflowTimelineLayout />
{/if}
