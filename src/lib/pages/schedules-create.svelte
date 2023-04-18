<script lang="ts">
  import { page } from '$app/stores';

  import { submitCreateSchedule } from '$lib/stores/schedules';

  import ScheduleFormView from '$lib/components/schedule/schedule-form-view.svelte';

  import type {
    SchedulePreset,
    ScheduleParameters,
    ScheduleActionParameters,
    SchedulePresetsParameters,
    ScheduleSpecParameters,
  } from '$lib/types/schedule';

  let { namespace } = $page.params;

  const handleCreate = (
    preset: SchedulePreset,
    args: Partial<ScheduleParameters>,
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
    submitCreateSchedule({ action, spec, presets });
  };
</script>

<ScheduleFormView onConfirm={handleCreate} />
