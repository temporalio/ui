<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import StandaloneActivities from '$lib/pages/standalone-activities.svelte';
  import { standaloneActivityCommandsDisabled } from '$lib/utilities/activity-create-disabled';
  import { routeForStartStandaloneActivity } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
  const activityStartEnabled = $derived(
    !standaloneActivityCommandsDisabled(page),
  );
</script>

<PageTitle
  title="{translate(
    'standalone-activities.standalone-activities',
  )} | {namespace}"
  url={page.url.href}
/>

<StandaloneActivities>
  {#snippet headerActions()}
    {#if activityStartEnabled}
      <Button href={routeForStartStandaloneActivity({ namespace })}>
        {translate('standalone-activities.start-standalone-activity')}
      </Button>
    {/if}
  {/snippet}
</StandaloneActivities>
