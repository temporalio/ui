<script lang="ts">
  import { page } from '$app/stores';

  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchScheduleCount } from '$lib/services/workflow-counts';
  import { schedulesCount } from '$lib/stores/schedules';

  $: namespace = $page.params.namespace;

  let loading = false;

  const fetchCounts = async () => {
    loading = true;
    try {
      $schedulesCount = await fetchScheduleCount({
        namespace,
      });
    } catch (e) {
      console.error('Fetching schedules count failed: ', e?.message);
    } finally {
      loading = false;
    }
  };

  $: namespace, fetchCounts();
</script>

<div class="flex flex-wrap items-center gap-2">
  {#if !loading}
    {$schedulesCount} {translate('common.schedules')}
  {:else}
    <Skeleton class="h-6 w-24 rounded" />
  {/if}
</div>
