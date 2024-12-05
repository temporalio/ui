<script lang="ts">
  import { writable, type Writable } from 'svelte/store';

  import { onDestroy } from 'svelte';

  import { page } from '$app/stores';

  import SchedulesCalendarView from '$lib/components/schedule/schedules-calendar-view.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';
  import { error, loading } from '$lib/stores/schedules';
  import {
    customSearchAttributes,
    type SearchAttributeInput,
  } from '$lib/stores/search-attributes';
  import type {
    FullSchedule,
    ScheduleParameters,
    SchedulePreset,
  } from '$lib/types/schedule';
  import { decodePayloadAttributes } from '$lib/utilities/decode-payload';
  import {
    routeForSchedule,
    routeForSchedules,
  } from '$lib/utilities/route-for';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  import type { PayloadInputEncoding } from '../payload-input-with-encoding.svelte';
  import AddSearchAttributes from '../workflow/add-search-attributes.svelte';

  import ScheduleInputPayload from './schedule-input-payload.svelte';

  import type { Schedule, SearchAttribute } from '$types';

  export let schedule: FullSchedule | null = null;
  export let searchAttributes: SearchAttribute = {};

  export let onConfirm: (
    preset: SchedulePreset,
    args: Partial<ScheduleParameters>,
    schedule?: Schedule,
  ) => void;

  let namespace = $page.params.namespace;
  let scheduleId = $page.params.schedule;

  let title = translate(schedule ? 'schedules.edit' : 'schedules.create');
  let loadingText = translate(
    schedule ? 'schedules.editing' : 'schedules.creating',
  );
  let backTitle = translate(
    schedule ? 'schedules.back-to-schedule' : 'schedules.back-to-schedules',
  );
  let backHref = schedule
    ? routeForSchedule({ namespace, scheduleId })
    : routeForSchedules({ namespace });
  let confirmText = schedule
    ? translate('common.save')
    : translate('schedules.create');

  let errors = {};
  let name = scheduleId ?? '';
  const decodedWorkflow = decodePayloadAttributes(
    schedule?.action?.startWorkflow,
  );
  const decodedSearchAttributes = decodePayloadAttributes({ searchAttributes });
  const indexedFields =
    decodedSearchAttributes?.searchAttributes.indexedFields ??
    ({} as { [k: string]: string });

  let workflowType = decodedWorkflow?.workflowType?.name ?? '';
  let workflowId = decodedWorkflow?.workflowId ?? '';
  let taskQueue = decodedWorkflow?.taskQueue?.name ?? '';
  let input = '';
  let editInput = !schedule;
  let encoding: Writable<PayloadInputEncoding> = writable('json/plain');
  let daysOfWeek: string[] = [];
  let daysOfMonth: number[] = [];
  let months: string[] = [];
  let days = '';
  let hour = '';
  let minute = '';
  let second = '';
  let phase = '';
  let cronString = '';
  let searchAttributesInput = Object.entries(indexedFields).map(
    ([label, value]) => ({
      label,
      value,
      type: $customSearchAttributes[label],
    }),
  ) as SearchAttributeInput[];

  const handleConfirm = (preset: SchedulePreset, schedule?: Schedule) => {
    const args: Partial<ScheduleParameters> = {
      name: name.trimEnd(),
      workflowType,
      workflowId,
      taskQueue,
      ...(editInput && { input }),
      encoding: $encoding,
      hour,
      minute,
      second,
      phase,
      cronString,
      daysOfWeek,
      daysOfMonth,
      days,
      months,
      searchAttributes: searchAttributesInput,
    };

    onConfirm(preset, args, schedule);
  };

  const onInput = (e: Event) => {
    const { id } = e.target as HTMLInputElement;
    errors[id] = false;

    if ($error) {
      $error = '';
    }
  };

  const onBlur = (e: Event) => {
    const { value, id } = e.target as HTMLInputElement;
    if (!value.trim()) {
      errors[id] = true;
    } else {
      errors[id] = false;
    }
  };

  const isValidInput = (value: string) => {
    if (!input) {
      errors['input'] = false;
      return true;
    }

    try {
      JSON.parse(value);
      errors['input'] = false;
      return true;
    } catch (e) {
      errors['input'] = true;
      return false;
    }
  };

  $: isDisabled = (preset: SchedulePreset) => {
    if (!name || !workflowType || !workflowId || !taskQueue) return true;
    if (!isValidInput(input)) return true;
    if (preset === 'interval') return !days && !hour && !minute && !second;
    if (preset === 'week') return !daysOfWeek.length;
    if (preset === 'month') return !daysOfMonth.length || !months.length;
    if (preset === 'string') return !cronString;
    return false;
  };

  onDestroy(() => ($error = ''));
</script>

<div class="flex flex-col gap-4 pb-20">
  {#if $loading}
    <Loading title={loadingText} />
  {:else}
    <Link href={backHref} icon="chevron-left">
      {backTitle}
    </Link>
    <h1>{title}</h1>
    <Card class="w-full xl:w-3/4 2xl:w-1/2">
      <form class="flex w-full flex-col gap-4">
        <div class="w-full">
          <Input
            id="name"
            bind:value={name}
            label={translate('schedules.name-label')}
            error={errors['name']}
            maxLength={232}
            disabled={Boolean(scheduleId)}
            on:input={onInput}
            on:blur={onBlur}
            required
          />
        </div>
        <div class="w-full">
          <Input
            id="workflowType"
            bind:value={workflowType}
            label={translate('schedules.workflow-type-label')}
            error={errors['workflowType']}
            on:input={onInput}
            on:blur={onBlur}
            required
          />
        </div>
        <div class="w-full">
          <Input
            id="workflowId"
            bind:value={workflowId}
            label={translate('schedules.workflow-id-label')}
            error={errors['workflowId']}
            on:input={onInput}
            on:blur={onBlur}
            required
          />
        </div>
        <div class="w-full">
          <Input
            id="taskQueue"
            bind:value={taskQueue}
            label={translate('schedules.task-queue-label')}
            error={errors['taskQueue']}
            on:input={onInput}
            on:blur={onBlur}
            required
          />
        </div>
        <ScheduleInputPayload
          bind:input
          bind:editInput
          bind:encoding
          payloads={schedule?.action?.startWorkflow?.input}
          showEditActions={Boolean(schedule)}
        />
        <AddSearchAttributes
          bind:attributesToAdd={searchAttributesInput}
          class="w-full"
        />
        <SchedulesCalendarView
          let:preset
          {schedule}
          bind:daysOfWeek
          bind:daysOfMonth
          bind:months
          bind:days
          bind:hour
          bind:minute
          bind:second
          bind:phase
          bind:cronString
        >
          <div class="mt-8 flex items-center gap-2">
            <Button
              disabled={isDisabled(preset) || !writeActionsAreAllowed()}
              on:click={() => handleConfirm(preset, schedule)}
              >{confirmText}</Button
            >
            <Button variant="ghost" href={backHref}
              >{translate('common.cancel')}</Button
            >
          </div>
        </SchedulesCalendarView>
        <Alert intent="error" title={$error} hidden={!$error} />
      </form>
    </Card>
  {/if}
</div>
