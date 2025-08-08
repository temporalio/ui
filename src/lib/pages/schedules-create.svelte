<script lang="ts">
  import { page } from '$app/stores';

  import ScheduleFormView from '$lib/components/schedule/schedule-form-view.svelte';
  import { submitCreateSchedule } from '$lib/stores/schedules';
  import type {
    ScheduleActionParameters,
    ScheduleParameters,
    SchedulePreset,
    SchedulePresetsParameters,
    ScheduleSpecParameters,
  } from '$lib/types/schedule';
  import { getIdentity } from '$lib/utilities/core-context';

  let { namespace } = $page.params;

  const identity = getIdentity();

  const handleCreate = (
    preset: SchedulePreset,
    args: Partial<ScheduleParameters>,
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
    submitCreateSchedule({ action, spec, presets });
  };
</script>

<ScheduleFormView onConfirm={handleCreate} />
