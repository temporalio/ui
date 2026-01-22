<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowTimelineLayout from '$lib/layouts/workflow-timeline-layout.svelte';

  const workflow = $page.params.workflow;
</script>

<PageTitle
  title={`${translate('workflows.timeline-tab')} | ${workflow}`}
  url={$page.url.href}
/>
<WorkflowTimelineLayout />
