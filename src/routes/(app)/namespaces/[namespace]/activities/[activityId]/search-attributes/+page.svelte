<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import ActivityExecutionSearchAttributes from '$lib/pages/activity-execution-search-attributes.svelte';

  const activityId = $derived(page.params.activityId);
</script>

<PageTitle
  title="Activity Execution Search Attributes | {activityId}"
  url={page.url.href}
/>
<ActivityExecutionSearchAttributes />
