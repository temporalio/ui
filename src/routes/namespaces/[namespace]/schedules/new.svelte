<script lang="ts">
  import { useForm } from 'svelte-use-form';

  import { formValues, scheduleBody } from '$lib/stores/schedules';
  import { createSchedule } from '$lib/services/schedule-service';

  import ToggleButton from '$lib/components/toggle-button.svelte';
  import ToggleButtons from '$lib/components/toggle-buttons.svelte';
  import Icon from '$holocene/icon/index.svelte';

  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { routeForSchedules } from '$lib/utilities/route-for';
  import Button from '$lib/holocene/button.svelte';
  import Loading from '$lib/components/loading.svelte';
  import FormInput from '$lib/holocene/forms/form-input.svelte';
  import debounce from 'just-debounce';

  let tab = 'interval';
  let loading = false;

  let { namespace } = $page.params;

  const form = useForm();

  function setBodyProperty(path: string, body: unknown, value: unknown) {
    const properties = path.split('.');
    return properties.reduce(
      (o, p, index) =>
        (o[p] = properties.length === ++index ? value : o[p] || {}),
      body,
    );
  }

  const handleClick = async () => {
    const body = scheduleBody;
    const values = $form.values;

    Object.keys(values).forEach((key) => {
      setBodyProperty(key, body, values[key]);
    });

    const interval = values['schedule.spec.interval.interval'];
    const phase = values['schedule.spec.interval.phase'];
    const year = values['schedule.spec.calendar.year'];
    const month = values['schedule.spec.calendar.month'];
    const dayOfMonth = values['schedule.spec.calendar.dayOfMonth'];
    const dayOfWeek = values['schedule.spec.calendar.dayOfWeek'];
    const hour = values['schedule.spec.calendar.hour'];
    const minute = values['schedule.spec.calendar.minute'];
    const second = values['schedule.spec.calendar.second'];

    if (interval) {
      body.schedule.spec.interval = [{ interval, phase }];
      body.schedule.spec.calendar = [];
    } else {
      body.schedule.spec.interval = [];
      body.schedule.spec.calendar = [
        { year, month, dayOfMonth, dayOfWeek, hour, minute, second },
      ];
    }

    // // Wait 1 second for create to get it on fetchAllSchedules
    try {
      loading = true;
      await createSchedule({
        namespace,
        body,
      });
      setTimeout(() => {
        goto(routeForSchedules({ namespace }));
        loading = false;
      }, 1000);
    } catch (e) {
      loading = false;
    }
  };
</script>

<article class="pb-20">
  {#if loading}
    <Loading title="Creating Schedule..." />
  {:else}
    <main class="relative mb-12 flex gap-1">
      <div class="back-to-schedules">
        <a
          href={routeForSchedules({ namespace })}
          class="back-to-workflows absolute top-0"
          style="left: 0rem"
        >
          <Icon scale={0.8} name="caretLeft" class="inline" />Back to Schedules
        </a>
      </div>
      <h2 class="font-base mt-8 ml-0 text-2xl">Create Schedule</h2>
    </main>
    <form use:form class="mb-4 flex w-full flex-col gap-4 md:w-2/3 xl:w-1/2">
      <div class="w-full">
        <FormInput field={formValues.name} />
      </div>
      <div class="w-full">
        <FormInput field={formValues.workflowType} />
      </div>
      <div class="w-full">
        <FormInput field={formValues.workflowId} />
      </div>
      <div class="w-full">
        <FormInput field={formValues.workflowTaskQueue} />
      </div>
      <div class="my-2 flex justify-center">
        <ToggleButtons>
          <ToggleButton
            icon="workflow"
            active={tab === 'interval'}
            data-cy="interval"
            on:click={() => (tab = 'interval')}>Interval</ToggleButton
          >
          <ToggleButton
            icon="calendarPlus"
            active={tab === 'calendar'}
            data-cy="calendar"
            on:click={() => (tab = 'calendar')}>Calendar</ToggleButton
          >
        </ToggleButtons>
      </div>
      {#if tab === 'interval'}
        <div class="mb-4 flex gap-4">
          <div class="w-full">
            <FormInput field={formValues.interval} />
          </div>
          <div class="w-full">
            <FormInput field={formValues.phase} />
          </div>
        </div>
      {:else}
        <div class="mb-4 flex flex gap-4">
          <div class="w-1/4">
            <FormInput field={formValues.year} />
          </div>
          <div class="w-1/4">
            <FormInput field={formValues.month} />
          </div>
          <div class="w-1/4">
            <FormInput field={formValues.dayOfMonth} />
          </div>
          <div class="w-1/4">
            <FormInput field={formValues.dayOfWeek} />
          </div>
        </div>
        <div class="mb-4 flex flex w-full gap-4 md:w-2/3 xl:w-1/2">
          <div class="w-1/3">
            <FormInput field={formValues.hour} />
          </div>
          <div class="w-1/3">
            <FormInput field={formValues.minute} />
          </div>
          <div class="w-1/3">
            <FormInput field={formValues.second} />
          </div>
        </div>
      {/if}
      <div class="flex justify-end">
        <Button disabled={!$form.valid} on:click={handleClick}>Create</Button>
      </div>
    </form>
  {/if}
</article>

<style lang="postcss">
  input {
    @apply block w-full rounded-md border border-gray-400 p-2;
  }
  label {
    @apply text-sm text-gray-700;
  }

  .back-to-schedules {
    @apply text-sm;
  }

  .back-to-schedules:hover {
    @apply text-blue-700 underline;
  }

  .back-to-schedules:hover :global(svg path) {
    stroke: #1d4ed8;
  }
</style>
