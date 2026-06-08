<svelte:options runes />

<script lang="ts">
  import { page } from '$app/state';

  import ScheduleFormView from '$lib/components/schedule/schedule-form/form.svelte';
  import type { ScheduleFormData } from '$lib/components/schedule/schema/schema';
  import { submitCreateSchedule } from '$lib/stores/schedules';
  import { getIdentity } from '$lib/utilities/core-context';

  const identity = getIdentity();

  const handleCreate = async (formData: ScheduleFormData) => {
    await submitCreateSchedule(formData, {
      namespace: page.params.namespace,
      identity,
    });
  };
</script>

<ScheduleFormView onSubmit={handleCreate} />
