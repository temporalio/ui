<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForSchedules } from '$lib/utilities/route-for';

  import ScheduleError from '../schedule-error.svelte';

  interface Props {
    namespace: string;
    scheduleId: string;
    errorMessage?: string;
  }

  let { namespace, scheduleId, errorMessage }: Props = $props();
</script>

<header class="mb-8">
  <div class="relative flex flex-col gap-1">
    <Link href={routeForSchedules({ namespace })} icon="chevron-left">
      {translate('schedules.back-to-schedules')}
    </Link>
    <h1 class="mt-8 select-all" data-testid="schedule-name">
      {scheduleId}
    </h1>
    <p class="text-sm">
      {namespace}
    </p>
  </div>
</header>
<ScheduleError error={errorMessage} />
