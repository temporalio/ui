<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import ActivityExecutions from '$lib/pages/activity-executions.svelte';

  const namespace = $derived(page.params.namespace);
</script>

<PageTitle
  title="{translate('activities.standalone-activities')} | {namespace}"
  url={page.url.href}
/>

<ActivityExecutions {namespace} />
