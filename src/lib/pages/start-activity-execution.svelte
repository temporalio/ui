<script lang="ts">
  import StandaloneActivityForm from '$lib/components/activity-execution-form/form.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { activitiesSearchParams } from '$lib/stores/activities';
  import { routeForStandaloneActivities } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
  }

  let { namespace }: Props = $props();

  const activitiesHref = $derived(
    `${routeForStandaloneActivities({ namespace })}?${$activitiesSearchParams}`,
  );
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-center gap-2">
    <Link
      href={activitiesHref}
      data-testid="back-to-activities"
      icon="chevron-left"
    >
      {translate('activities.back-to-activities')}
    </Link>
  </div>
  <h1>{translate('activities.start-standalone-activity')}</h1>
  <StandaloneActivityForm {namespace} />
</div>
