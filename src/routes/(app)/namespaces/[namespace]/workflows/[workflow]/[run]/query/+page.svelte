<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';

  import WorkflowQuery from '$lib/pages/workflow-query.svelte';

  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';
  import PageTitle from '$lib/components/page-title.svelte';

  export let data: PageData;

  $: ({ workflow, workers } = data);

  $: isCloud = $page.data?.settings?.runtimeEnvironment?.isCloud;
</script>

<PageTitle title={`Query | ${workflow.id}`} url={$page.url.href} />
<WorkflowRunLayout
  {workflow}
  {workers}
  cancelEnabled={!isCloud}
  signalEnabled={!isCloud}
>
  <WorkflowQuery {workflow} />
</WorkflowRunLayout>
