<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getActivityExecutions } from '$lib/services/standalone-activities';
  import { routeForStartStandaloneActivity } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
  }

  let { namespace }: Props = $props();
</script>

<div class="flex items-center justify-between">
  <h1>{translate('activities.standalone-activities')}</h1>
  <Button href={routeForStartStandaloneActivity({ namespace })}>
    {translate('activities.start-standalone-activity')}
  </Button>
</div>

{#await getActivityExecutions(namespace) then executions}
  {JSON.stringify(executions, null, 2)}
{/await}
