<script lang="ts">
  import { page } from '$app/stores';

  import { submitEditSchedule } from '$lib/stores/schedules';

  import Loading from '$lib/holocene/loading.svelte';
  import { fetchSchedule } from '$lib/services/schedule-service';

  import ScheduleFormView from '$lib/components/schedule/schedule-form-view.svelte';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';

  import type {
    FullSchedule,
    SchedulePreset,
    ScheduleParameters,
    ScheduleActionParameters,
    SchedulePresetsParameters,
    ScheduleSpecParameters,
  } from '$lib/types/schedule';

  let namespace = $page.params.namespace;
  let scheduleId = $page.params.schedule;

  const parameters = {
    namespace,
    scheduleId: decodeURIForSvelte(scheduleId),
  };
  let scheduleFetch = fetchSchedule(parameters);

  const handleEdit = (
    preset: SchedulePreset,
    args: Partial<ScheduleParameters>,
    schedule: FullSchedule,
  ) => {
    const {
      name,
      workflowType,
      workflowId,
      taskQueue,
      hour,
      minute,
      second,
      phase,
      cronString,
      daysOfWeek,
      daysOfMonth,
      days,
      months,
    } = args;
    const action: ScheduleActionParameters = {
      namespace,
      name,
      workflowType,
      workflowId,
      taskQueue,
    };
    const spec: Partial<ScheduleSpecParameters> = {
      hour,
      minute,
      second,
      phase,
      cronString,
    };
    const presets: SchedulePresetsParameters = {
      preset,
      daysOfWeek,
      daysOfMonth,
      months,
      days,
    };

    submitEditSchedule({ action, spec, presets }, schedule, scheduleId);
  };
</script>

{#await scheduleFetch}
  <Loading title="Loading Schedule..." />
{:then { schedule }}
  <ScheduleFormView onConfirm={handleEdit} {schedule} />
{/await}
