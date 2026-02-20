<script lang="ts">
  import { page } from '$app/state';

  import ScheduleFormView from '$lib/components/schedule/schedule-form/form.svelte';
  import { submitCreateSchedule } from '$lib/stores/schedules';
  import type {
    ScheduleActionParameters,
    ScheduleParameters,
    SchedulePreset,
    SchedulePresetsParameters,
    ScheduleSpecParameters,
  } from '$lib/types/schedule';
  import { getIdentity } from '$lib/utilities/core-context';

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
      namespace: page.params.namespace,
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
