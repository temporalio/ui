<script lang="ts">
  import { onDestroy } from 'svelte';

  import { page } from '$app/stores';

  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchScheduleCount } from '$lib/services/workflow-counts';
  import { getExponentialBackoffSeconds } from '$lib/utilities/refresh-rate';

  $: namespace = $page.params.namespace;

  let refreshInterval: ReturnType<typeof setInterval>;

  let attempt = 1;
  let loading = false;
  let count = '0';
  const initialIntervalSeconds = 5;
  const maxAttempts = 100;

  onDestroy(() => {
    clearNewCounts();
  });

  const setBackoffInterval = () => {
    attempt += 1;
    clearInterval(refreshInterval);
    if (attempt <= maxAttempts) {
      const interval =
        getExponentialBackoffSeconds(
          initialIntervalSeconds,
          attempt,
          maxAttempts,
        ) * 1000;
      refreshInterval = setInterval(() => fetchNewCounts(), interval);
    }
  };

  const clearNewCounts = () => {
    clearInterval(refreshInterval);
    attempt = 1;
    loading = true;
    count = '0';
  };

  const fetchNewCounts = async () => {
    setBackoffInterval();
    try {
      count = await fetchScheduleCount({
        namespace,
      });
    } catch (e) {
      console.error('Fetching workflow counts failed: ', e?.message);
    } finally {
      loading = false;
    }
  };

  const fetchCounts = async () => {
    clearNewCounts();
    const interval =
      getExponentialBackoffSeconds(
        initialIntervalSeconds,
        attempt,
        maxAttempts,
      ) * 1000;
    refreshInterval = setInterval(() => fetchNewCounts(), interval);
    try {
      count = await fetchScheduleCount({
        namespace,
      });
    } catch (e) {
      console.error('Fetching workflow counts failed: ', e?.message);
    } finally {
      loading = false;
    }
  };

  $: namespace, fetchCounts();
</script>

<div class="flex min-h-[24px] flex-wrap items-center gap-2">
  {#if !loading}
    {count} {translate('common.schedules')}
  {:else}
    <Skeleton class="h-6 w-24 rounded" />
  {/if}
</div>
