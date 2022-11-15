<script lang="ts">
  import { page } from '$app/stores';

  import { submitEditSchedule } from '$lib/stores/schedules';
  import { routeForSchedule } from '$lib/utilities/route-for';

  import Loading from '$holocene/loading.svelte';
  import { fetchSchedule } from '$lib/services/schedule-service';

  import ScheduleFormView from '$lib/components/schedule/schedule-form-view.svelte';

  let namespace = $page.params.namespace;
  let scheduleId = $page.params.schedule;

  let scheduleFetch = fetchSchedule({ namespace, scheduleId });

  const handleEdit = (
    preset: SchedulePreset,
    args: ScheduleParameters,
    schedule,
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
  <ScheduleFormView
    title="Edit Schedule"
    loadingText="Editing Schedule..."
    backHref={routeForSchedule({ namespace, scheduleId })}
    backTitle="Back to Schedule"
    confirmText="Save"
    onConfirm={handleEdit}
    {schedule}
  />
{/await}
