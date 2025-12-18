<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getActivityExecutions } from '$lib/services/standalone-activities';
  import { routeForStartStandaloneActivity } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
</script>

<PageTitle
  title="{translate('activities.standalone-activities')} | {namespace}"
  url={page.url.href}
/>
<div class="flex items-center justify-between">
  <h1>{translate('activities.standalone-activities')}</h1>
  <Button href={routeForStartStandaloneActivity({ namespace })}>
    {translate('activities.start-standalone-activity')}
  </Button>
</div>

{#await getActivityExecutions(namespace) then executions}
  {JSON.stringify(executions, null, 2)}
{/await}
