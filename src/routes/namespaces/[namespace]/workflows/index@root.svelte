<script lang="ts">
  import Workflows from '$lib/pages/workflows.svelte';
  import WorkflowsWithNewSearch from '$lib/pages/workflows-with-new-search.svelte';

  import IsCloudGuard from '$lib/components/is-cloud-guard.svelte';
  import IsOssGuard from '$lib/components/is-oss-guard.svelte';
</script>

<IsOssGuard>
  <WorkflowsWithNewSearch />
</IsOssGuard>
<IsCloudGuard>
  <Workflows />
</IsCloudGuard>
