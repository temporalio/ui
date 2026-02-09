<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import ActivityExecutionMetadata from '$lib/pages/standalone-activity-metadata.svelte';

  const activityId = $derived(page.params.activityId);
</script>

<PageTitle
  title="Activity Execution User Metadata | {activityId}"
  url={page.url.href}
/>

<ActivityExecutionMetadata />
