<svelte:options runes />

<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowHistoryLayout from '$lib/layouts/workflow-history-layout.svelte';
</script>

<PageTitle
  title={`${translate('workflows.workflow-history')} | ${page.params.workflow}`}
  url={page.url.href}
/>
<WorkflowHistoryLayout />
