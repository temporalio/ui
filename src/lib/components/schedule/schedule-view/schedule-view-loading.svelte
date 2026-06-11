<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForSchedules } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    scheduleId: string;
  }

  let { namespace, scheduleId }: Props = $props();
</script>

<header class="mb-8">
  <div class="relative flex flex-col gap-4">
    <Link href={routeForSchedules({ namespace })} icon="chevron-left">
      {translate('schedules.back-to-schedules')}
    </Link>
    <h1 class="select-all" data-testid="schedule-name">
      {scheduleId}
    </h1>
  </div>
</header>
<Loading />
