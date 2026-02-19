<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import StandaloneActivityDetails from '$lib/pages/standalone-activity-details.svelte';

  const namespace = $derived(page.params.namespace);
  const activityId = $derived(page.params.activityId);
</script>

<PageTitle
  title="Activity Execution Details | {activityId}"
  url={page.url.href}
/>

<StandaloneActivityDetails {namespace} />
