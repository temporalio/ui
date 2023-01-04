<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';

  import WorkflowStackTrace from '$lib/pages/workflow-stack-trace.svelte';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';

  export let data: PageData;

  $: ({ workflow, workers } = data);

  $: isCloud = $page.data?.settings?.runtimeEnvironment?.isCloud;
</script>

<PageTitle title={`Stack Trace | ${workflow.id}`} url={$page.url.href} />
<WorkflowRunLayout
  {workflow}
  {workers}
  cancelEnabled={!isCloud}
  signalEnabled={!isCloud}
>
  <WorkflowStackTrace {workflow} {workers} />
</WorkflowRunLayout>
