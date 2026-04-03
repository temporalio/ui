<script lang="ts">
  import { arrayProxy, superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

  import { page } from '$app/state';

  import CodecServerErrorBanner from '$lib/components/codec-server-error-banner.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';
  import { error, loading } from '$lib/stores/schedules';
  import { customSearchAttributes } from '$lib/stores/search-attributes';
  import type { FullSchedule } from '$lib/types/schedule';
  import {
    routeForSchedule,
    routeForSchedules,
  } from '$lib/utilities/route-for';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  import {
    getDefaultValues,
    type ScheduleFormData,
    scheduleFormSchema,
  } from './schema';

  import ScheduleInputPayload from './schedule-input-payload.svelte';
  import SchedulesCalendarView from './schedules-calendar-view.svelte';
  import SchedulesSearchAttributesInputs from './schedules-search-attributes-inputs.svelte';

  import type { SearchAttribute } from '$types';

  interface Props {
    schedule?: FullSchedule | null;
    searchAttributes?: SearchAttribute;
    onSubmit: (formData: ScheduleFormData) => Promise<void>;
  }

  let { schedule = null, searchAttributes = {}, onSubmit }: Props = $props();

  const namespace = $derived(page.params.namespace);
  const scheduleId = $derived(page.params.schedule);

  const title = $derived(
    translate(schedule ? 'schedules.edit' : 'schedules.create'),
  );
  const backTitle = $derived(
    translate(
      schedule ? 'schedules.back-to-schedule' : 'schedules.back-to-schedules',
    ),
  );
  const backHref = $derived(
    schedule
      ? routeForSchedule({ namespace, scheduleId })
      : routeForSchedules({ namespace }),
  );
  const confirmText = $derived(
    schedule ? translate('common.save') : translate('schedules.create'),
  );

  const initialValues = $derived(
    getDefaultValues({
      schedule,
      searchAttributes,
      customSearchAttributes: $customSearchAttributes,
      scheduleId,
    }),
  );

  // initialValues is reactive but we only need its initial value
  // svelte-ignore state_referenced_locally
  const superform = superForm(initialValues, {
    SPA: true,
    dataType: 'json',
    validators: zodClient(scheduleFormSchema),
    resetForm: false,
    onUpdate: async ({ form }) => {
      if (!form.valid) return;
      await onSubmit(form.data);
    },
  });

  const {
    form,
    errors: formErrors,
    constraints,
    enhance,
    submitting,
  } = superform;

  const { values: scheduleSearchAttributes } = arrayProxy(
    superform,
    'searchAttributes',
  );
  const { values: workflowSearchAttributes } = arrayProxy(
    superform,
    'workflowSearchAttributes',
  );

  const onInput = () => {
    if ($error) {
      $error = '';
    }
  };

  $effect(() => {
    return () => {
      $error = '';
    };
  });
</script>

<div class="flex flex-col gap-4 pb-10">
  {#if $loading}
    <Loading />
  {:else}
    <Link href={backHref} icon="chevron-left">
      {backTitle}
    </Link>
    <h1>{title}</h1>
    <Card class="w-full xl:w-3/4 2xl:w-1/2">
      <form novalidate use:enhance class="mb-4 flex w-full flex-col gap-4">
        <Input
          id="name"
          bind:value={$form.name}
          data-testid="schedule-name-input"
          label={translate('schedules.name-label')}
          error={!!$formErrors.name?.[0]}
          hintText={$formErrors.name?.[0]}
          maxLength={232}
          disabled={Boolean(scheduleId)}
          oninput={onInput}
          {...$constraints.name}
          required
        />
        <Input
          id="workflowType"
          bind:value={$form.workflowType}
          data-testid="schedule-type-input"
          label={translate('schedules.workflow-type-label')}
          error={!!$formErrors.workflowType?.[0]}
          hintText={$formErrors.workflowType?.[0]}
          oninput={onInput}
          {...$constraints.workflowType}
          required
        />
        <Input
          id="workflowId"
          bind:value={$form.workflowId}
          data-testid="schedule-workflow-id-input"
          label={translate('schedules.workflow-id-label')}
          error={!!$formErrors.workflowId?.[0]}
          hintText={$formErrors.workflowId?.[0]}
          oninput={onInput}
          {...$constraints.workflowId}
          required
        />
        <Input
          id="taskQueue"
          bind:value={$form.taskQueue}
          data-testid="schedule-task-queue-input"
          label={translate('schedules.task-queue-label')}
          error={!!$formErrors.taskQueue?.[0]}
          hintText={$formErrors.taskQueue?.[0]}
          oninput={onInput}
          {...$constraints.taskQueue}
          required
        />
        <ScheduleInputPayload
          bind:input={$form.input}
          bind:editInput={$form.editInput}
          bind:encoding={$form.encoding}
          bind:messageType={$form.messageType}
          payloads={schedule?.action?.startWorkflow?.input}
          showEditActions={Boolean(schedule)}
        />
        <SchedulesCalendarView
          {schedule}
          bind:daysOfWeek={$form.daysOfWeek}
          bind:daysOfMonth={$form.daysOfMonth}
          bind:months={$form.months}
          bind:days={$form.days}
          bind:hour={$form.hour}
          bind:minute={$form.minute}
          bind:second={$form.second}
          bind:phase={$form.phase}
          bind:cronString={$form.cronString}
          bind:preset={$form.preset}
          timezoneName={$form.timezoneName}
        >
          <SchedulesSearchAttributesInputs
            bind:scheduleSearchAttributes={$scheduleSearchAttributes}
            bind:workflowSearchAttributes={$workflowSearchAttributes}
          />
          <div class="mt-4 flex flex-row items-center gap-4 max-sm:flex-col">
            <Button
              disabled={$submitting || !writeActionsAreAllowed()}
              type="submit"
              class="max-sm:w-full"
              data-testid="create-schedule-button">{confirmText}</Button
            >
            <Button
              variant="ghost"
              type="button"
              href={backHref}
              class="max-sm:w-full"
              data-testid="cancel-schedule-button"
              >{translate('common.cancel')}</Button
            >
          </div>
        </SchedulesCalendarView>
        <Alert intent="error" title={$error} hidden={!$error} />
        <CodecServerErrorBanner />
      </form>
    </Card>
  {/if}
</div>
