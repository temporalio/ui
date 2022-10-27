<script lang="ts">
  import { useForm } from 'svelte-use-form';

  import {
    fields,
    submitScheduleForm,
    loading,
    error,
  } from '$lib/stores/schedules';

  import Icon from '$holocene/icon/icon.svelte';

  import { page } from '$app/stores';
  import { routeForSchedules } from '$lib/utilities/route-for';
  import Button from '$lib/holocene/button.svelte';
  import Loading from '$holocene/loading.svelte';
  import FormInput from '$lib/holocene/forms/form-input.svelte';
  import SchedulesCalendarView from '$lib/components/schedule/schedules-calendar-view.svelte';

  let { namespace } = $page.params;

  let form = useForm();
  let calendars = [1];

  const handleClick = () => {
    submitScheduleForm($form, namespace);
  };
</script>

<article class="pb-20">
  {#if $loading}
    <Loading title="Creating Schedule..." />
  {:else}
    <main class="relative mb-12 flex gap-1">
      <a
        href={routeForSchedules({ namespace })}
        class="back-to-schedules absolute top-0"
        style="left: 0rem"
      >
        <Icon name="chevron-left" class="inline" />Back to Schedules
      </a>
      <h2 class="font-base mt-8 ml-0 text-2xl">Create Schedule</h2>
    </main>
    <form use:form class="mb-4 flex w-full flex-col gap-4 md:w-2/3 xl:w-1/2">
      <div class="w-full">
        <FormInput field={fields.name} />
      </div>
      <div class="w-full">
        <FormInput field={fields.workflowType} />
      </div>
      <div class="w-full">
        <FormInput field={fields.workflowId} />
      </div>
      <div class="w-full">
        <FormInput field={fields.workflowTaskQueue} />
      </div>
      <SchedulesCalendarView />
      <div class="flex justify-between">
        <Button disabled={!$form.valid} on:click={handleClick}>Create</Button>

        <a
          href={routeForSchedules({ namespace })}
          class="back-to-schedules"
          style="left: 0rem">Cancel</a
        >
      </div>
    </form>
  {/if}
  {#if $error}
    <p
      class="rounded-md border-2 border-orange-500 bg-orange-100 p-5 text-center"
    >
      {$error}
    </p>
  {/if}
</article>

<style lang="postcss">
  .back-to-schedules {
    @apply text-sm;
  }

  .back-to-schedules:hover {
    @apply text-blue-700 underline;
  }
</style>
