<script lang="ts">
  import ScheduleFormView from '$lib/components/schedule/schedule-form-view.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { fetchSchedule } from '$lib/services/schedule-service';
  import { submitEditSchedule } from '$lib/stores/schedules';
  import type {
    FullSchedule,
    ScheduleActionParameters,
    ScheduleParameters,
    SchedulePreset,
    SchedulePresetsParameters,
    ScheduleSpecParameters,
  } from '$lib/types/schedule';
  import { getIdentity } from '$lib/utilities/core-context';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';

  interface Props {
    namespace: string;
    schedule: string;
  }

  let { namespace, schedule: scheduleId }: Props = $props();

  const identity = getIdentity();
  const parameters = {
    namespace,
    scheduleId: decodeURIForSvelte(scheduleId),
  };
  const scheduleFetch = fetchSchedule(parameters);

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
      input,
      encoding,
      messageType,
      hour,
      minute,
      second,
      phase,
      cronString,
      daysOfWeek,
      daysOfMonth,
      days,
      months,
      searchAttributes,
      workflowSearchAttributes,
    } = args;
    const action: ScheduleActionParameters = {
      identity,
      namespace,
      name,
      workflowType,
      workflowId,
      taskQueue,
      input,
      encoding,
      messageType,
      searchAttributes,
      workflowSearchAttributes,
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
  <Loading />
{:then { schedule, searchAttributes }}
  <ScheduleFormView onConfirm={handleEdit} {schedule} {searchAttributes} />
{/await}
