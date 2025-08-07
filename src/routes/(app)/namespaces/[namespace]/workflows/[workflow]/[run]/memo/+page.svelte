<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowPaddedLayout from '$lib/layouts/workflow-padded-layout.svelte';
  import WorkflowMemo from '$lib/pages/workflow-memo.svelte';
</script>

<PageTitle
  title={`${translate('workflows.memo-tab')} | ${page.params.workflow}`}
  url={page.url.href}
/>
<WorkflowPaddedLayout>
  <WorkflowMemo />
</WorkflowPaddedLayout>
