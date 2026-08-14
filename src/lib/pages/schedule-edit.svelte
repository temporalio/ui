<script lang="ts">
  import { page } from '$app/state';

  import ScheduleFormView from '$lib/components/schedule/schedule-form/form.svelte';
  import type { FormScheduleSchema } from '$lib/components/schedule/schema/form';
  import Loading from '$lib/holocene/loading.svelte';
  import { fetchSchedule } from '$lib/services/schedule-service';
  import { submitEditSchedule } from '$lib/stores/schedules';
  import type { DescribeFullSchedule } from '$lib/types/schedule';
  import { getIdentity } from '$lib/utilities/core-context';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';

  const identity = getIdentity();

  const scheduleFetch = $derived.by(() => {
    const namespace = page.params.namespace;
    const scheduleId = page.params.schedule;
    return fetchSchedule({
      namespace,
      scheduleId: decodeURIForSvelte(scheduleId),
    });
  });

  const handleEdit =
    (schedule: DescribeFullSchedule) =>
    async (formData: FormScheduleSchema) => {
      await submitEditSchedule(formData, schedule, {
        namespace: page.params.namespace,
        identity,
        scheduleId: page.params.schedule,
      });
    };
</script>

{#await scheduleFetch}
  <Loading />
{:then schedule}
  <ScheduleFormView onSubmit={handleEdit(schedule)} {schedule} />
{/await}
