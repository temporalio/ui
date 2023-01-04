<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';

  import WorkflowWorkers from '$lib/pages/workflow-workers.svelte';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';

  export let data: PageData;

  $: ({ workflow, workers } = data);

  $: isCloud = $page.data?.settings?.runtimeEnvironment?.isCloud;
</script>

<PageTitle title={`Workers | ${workflow.id}`} url={$page.url.href} />
<WorkflowRunLayout
  {workflow}
  {workers}
  cancelEnabled={!isCloud}
  signalEnabled={!isCloud}
>
  <WorkflowWorkers {workflow} {workers} />
</WorkflowRunLayout>
