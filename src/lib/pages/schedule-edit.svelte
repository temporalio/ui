<script lang="ts">
  import { page } from '$app/stores';

  import ScheduleFormView from '$lib/components/schedule/schedule-form-view.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';
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
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';

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
  <Loading title={translate('schedules.loading')} />
{:then { schedule, searchAttributes }}
  <ScheduleFormView onConfirm={handleEdit} {schedule} {searchAttributes} />
{/await}
