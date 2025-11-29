<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowPendingActivities from '$lib/pages/workflow-pending-activities.svelte';

  let { params }: PageProps = $props();
  const { workflow } = $derived(params);
</script>

<PageTitle
  title={`${translate('workflows.pending-activities-tab')} | ${workflow}`}
  url={page.url.href}
/>
<WorkflowPendingActivities />
