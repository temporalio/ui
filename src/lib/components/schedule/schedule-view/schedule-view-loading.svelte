<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForSchedules } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    scheduleId: string;
  }

  let { namespace, scheduleId }: Props = $props();
</script>

<header class="mb-2 flex flex-col gap-4">
  <Link href={routeForSchedules({ namespace })} icon="chevron-left">
    {translate('schedules.back-to-schedules')}
  </Link>
  <div class="flex items-start justify-between">
    <div class="flex flex-col gap-2">
      <h1
        class="flex select-all flex-wrap items-center gap-2 text-3xl"
        data-testid="schedule-name"
      >
        <Skeleton class="h-6 w-20 rounded-sm" />
        {scheduleId}
      </h1>

      <div class="flex flex-col gap-2">
        <Skeleton class="h-6 w-48" />
        <Skeleton class="h-6 w-40" />
      </div>
    </div>

    <Skeleton class="h-8 w-28 rounded-sm" />
  </div>

  <dl class="flex flex-col gap-2">
    <dt class="text-sm font-medium text-secondary">
      {translate('workflows.total-workflows')}
    </dt>
    <dd class="flex flex-wrap items-center gap-2">
      <Skeleton class="h-6 w-16 rounded-sm" />
      <Skeleton class="h-6 w-24 rounded-sm" />
    </dd>
  </dl>
</header>
<div class="flex flex-col gap-4 pb-24">
  <div class="flex flex-col gap-4 xl:flex-row">
    <div class="flex w-full flex-col items-start gap-4 xl:w-2/3">
      <Skeleton class="h-96 w-full rounded-sm" />
      <Skeleton class="h-48 w-full rounded-sm" />
      <Skeleton class="h-48 w-full rounded-sm" />
    </div>

    <div class="flex w-full flex-col gap-4 xl:w-1/3">
      <Skeleton class="h-64 w-full rounded-sm" />
      <Skeleton class="h-64 w-full rounded-sm" />
    </div>
  </div>
</div>
