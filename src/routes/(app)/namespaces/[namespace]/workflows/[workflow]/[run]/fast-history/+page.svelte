<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowFastHistoryLayout from '$lib/layouts/workflow-fast-history-layout.svelte';
  import type {
    BidirectionalProgress,
    BidirectionalStats,
  } from '$lib/services/events-service';

  const workflow = $derived(page.params.workflow);

  let stats = $state<BidirectionalStats | null>(null);
  let progress = $state<BidirectionalProgress | null>(null);
  export { stats, progress };
</script>

<PageTitle
  title={`${translate('workflows.timeline-tab')} | ${workflow}`}
  url={page.url.href}
/>
<WorkflowFastHistoryLayout bind:stats bind:progress />
