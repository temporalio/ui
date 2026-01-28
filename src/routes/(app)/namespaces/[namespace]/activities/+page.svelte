<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import ActivitiesWithSearch from '$lib/pages/activities-with-search.svelte';
  import { routeForStartStandaloneActivity } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
</script>

<PageTitle
  title="{translate(
    'standalone-activities.standalone-activities',
  )} | {namespace}"
  url={page.url.href}
/>

<ActivitiesWithSearch>
  {#snippet headerActions()}
    <Button href={routeForStartStandaloneActivity({ namespace })}>
      {translate('standalone-activities.start-standalone-activity')}
    </Button>
  {/snippet}
</ActivitiesWithSearch>
