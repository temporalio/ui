<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowMemo from '$lib/pages/workflow-memo.svelte';

  let { params }: PageProps = $props();
  const { workflow } = $derived(params);
</script>

<PageTitle
  title={`${translate('workflows.memo-tab')} | ${workflow}`}
  url={page.url.href}
/>
<WorkflowMemo />
