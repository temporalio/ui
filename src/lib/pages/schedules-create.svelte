<svelte:options runes />

<script lang="ts">
  import { page } from '$app/state';

  import ScheduleFormView from '$lib/components/schedule/schedule-form/form.svelte';
  import type { FormScheduleSchema } from '$lib/components/schedule/schema/form';
  import { submitCreateSchedule } from '$lib/stores/schedules';
  import { getIdentity } from '$lib/utilities/core-context';

  const identity = getIdentity();

  const handleCreate = async (formData: FormScheduleSchema) => {
    await submitCreateSchedule(formData, {
      namespace: page.params.namespace,
      identity,
    });
  };
</script>

<ScheduleFormView onSubmit={handleCreate} />
