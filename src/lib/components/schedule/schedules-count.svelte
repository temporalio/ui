<script lang="ts">
  import { page } from '$app/stores';

  import { translate } from '$lib/i18n/translate';
  import { fetchScheduleCount } from '$lib/services/workflow-counts';
  import { schedulesCount } from '$lib/stores/schedules';

  $: namespace = $page.params.namespace;

  const fetchCounts = async () => {
    try {
      $schedulesCount = await fetchScheduleCount({
        namespace,
      });
    } catch (e) {
      console.error('Fetching schedules count failed: ', e?.message);
    }
  };

  $: namespace, fetchCounts();

  console.log('schedulesCount', $schedulesCount);
</script>

<div class="flex flex-wrap items-center gap-2">
  {translate('common.schedules-plural', { count: Number($schedulesCount) })}
</div>
