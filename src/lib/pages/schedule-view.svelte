<script lang="ts">
  import { page } from '$app/state';

  import ScheduleViewError from '$lib/components/schedule/schedule-view/schedule-view-error.svelte';
  import ScheduleViewLoading from '$lib/components/schedule/schedule-view/schedule-view-loading.svelte';
  import ScheduleView from '$lib/components/schedule/schedule-view/schedule-view.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import {
    currentScheduleFetch,
    loading,
    refreshCurrentScheduleFetch,
  } from '$lib/stores/schedules';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';

  const namespace = $derived(page.params.namespace);
  const scheduleId = $derived(decodeURIForSvelte(page.params.schedule));

  $effect.pre(() => {
    refreshCurrentScheduleFetch({ namespace, scheduleId });
  });
</script>

{#await $currentScheduleFetch}
  <ScheduleViewLoading {namespace} {scheduleId} />
{:then currentSchedule}
  {#if $loading || !currentSchedule}
    <Loading class="my-2" />
  {:else}
    <ScheduleView schedule={currentSchedule} {namespace} {scheduleId} />
  {/if}
{:catch error}
  <ScheduleViewError {namespace} {scheduleId} errorMessage={error?.message} />
{/await}
