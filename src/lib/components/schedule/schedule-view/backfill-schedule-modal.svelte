<script lang="ts">
  import { writable } from 'svelte/store';

  import { addHours, isBefore, startOfDay } from 'date-fns';

  import DatePicker from '$lib/holocene/date-picker.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import RadioCard from '$lib/holocene/radio-input/radio-card.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    actionPending,
    closeConfirmationModal,
    confirmationModal,
    serverError,
    submitBackfillSchedule,
  } from '$lib/stores/schedules';
  import type { OverlapPolicy } from '$lib/types/schedule';
  import { getUTCString } from '$lib/utilities/format-date';

  import { getOverlapPolicyContent } from '../constants';

  interface Props {
    initialOverlapPolicy?: OverlapPolicy;
    scheduleId: string;
    namespace: string;
  }

  const overlapPolicyContent = getOverlapPolicyContent();

  let { initialOverlapPolicy, scheduleId, namespace }: Props = $props();

  // svelte-ignore state_referenced_locally
  let selectedOverlapPolicy = writable<OverlapPolicy>(
    initialOverlapPolicy ?? 'Skip',
  );

  const localNow = new Date();
  const MILLISECONDS_IN_MINUTE = 60000;
  const utcNow = new Date(
    localNow.getTime() + localNow.getTimezoneOffset() * MILLISECONDS_IN_MINUTE,
  );
  const anHourAhead = addHours(utcNow, 1);

  let startDate = $state(startOfDay(utcNow));
  let startHour = $state(utcNow.getHours().toString());
  let startMinute = $state(utcNow.getMinutes().toString());
  let startSecond = $state(utcNow.getSeconds().toString());

  let endDate = $state(startOfDay(utcNow));
  let endHour = $state(anHourAhead.getHours().toString());
  let endMinute = $state(anHourAhead.getMinutes().toString());
  let endSecond = $state(anHourAhead.getSeconds().toString());
</script>

<Modal
  id="backfill-schedule-modal"
  large
  open={$confirmationModal === 'backfill'}
  confirmType="primary"
  confirmText={translate('schedules.schedule')}
  cancelText={translate('common.cancel')}
  loading={$actionPending}
  error={$serverError}
  on:confirmModal={() =>
    submitBackfillSchedule(
      {
        startTime: getUTCString({
          date: startDate,
          hour: startHour,
          minute: startMinute,
          second: startSecond,
        }),
        endTime: getUTCString({
          date: endDate,
          hour: endHour,
          minute: endMinute,
          second: endSecond,
        }),
        overlapPolicy: $selectedOverlapPolicy,
      },
      {
        scheduleId,
        namespace,
      },
    )}
  on:cancelModal={() => {
    closeConfirmationModal('backfill');
  }}
>
  <h3 slot="title">
    {translate('schedules.schedule')}
    {translate('schedules.backfill')}
  </h3>
  <div slot="content">
    <div class="flex flex-col gap-2 p-2">
      <DatePicker
        label={translate('common.start')}
        onDateChange={(d) => (startDate = startOfDay(d))}
        selected={startDate}
        todayLabel={translate('common.today')}
        closeLabel={translate('common.close')}
        clearLabel={translate('common.clear-input-button-label')}
      />
      <TimePicker
        bind:hour={startHour}
        bind:minute={startMinute}
        bind:second={startSecond}
        twelveHourClock={false}
      />
      <DatePicker
        label={translate('common.end')}
        onDateChange={(d) => (endDate = startOfDay(d))}
        selected={endDate}
        todayLabel={translate('common.today')}
        closeLabel={translate('common.close')}
        clearLabel={translate('common.clear-input-button-label')}
        isAllowed={(d) => !isBefore(d, startDate)}
      />
      <TimePicker
        bind:hour={endHour}
        bind:minute={endMinute}
        bind:second={endSecond}
        twelveHourClock={false}
      />
      <div class="flex w-full flex-row items-center gap-2">
        <Icon name="clock" aria-hidden="true" />
        <span class="text-xs font-normal text-slate-500"
          >{translate('common.based-on-time-preface')}
          {translate('common.universal-standard-time')}
        </span>
      </div>
    </div>

    <hr tabindex="-1" aria-hidden="true" class="my-4 w-full border-subtle" />

    <RadioGroup name="overlap-policy" group={selectedOverlapPolicy}>
      {#each Object.entries(overlapPolicyContent) as [value, content] (value)}
        <RadioCard
          id="overlap-policy-{value}"
          value={value as OverlapPolicy}
          label={[
            content.label,
            content.isDefault && translate('schedules.overlap-default-suffix'),
          ]
            .filter(Boolean)
            .join(' ')}
          description={content.description}
          labelContainerClass="border-transparent p-0"
        />
      {/each}
    </RadioGroup>
  </div>
</Modal>
