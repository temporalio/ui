<script lang="ts">
  import { writable } from 'svelte/store';

  import { addHours, isBefore, startOfDay } from 'date-fns';
  import { utcToZonedTime } from 'date-fns-tz';

  import DatePicker from '$lib/holocene/date-picker.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import RadioCard from '$lib/holocene/radio-input/radio-card.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    actionPending,
    clearConfirmationModalActionTimeout,
    closeConfirmationModal,
    confirmationModal,
    serverError,
    submitBackfillSchedule,
  } from '$lib/stores/schedules';
  import type { OverlapPolicy } from '$lib/types/schedule';
  import { getIdentity } from '$lib/utilities/core-context';

  import { getOverlapPolicyContent } from '../constants';
  import { dateAndTimeToTimestamp } from '../utilities/date';

  interface Props {
    scheduleOverlapPolicy?: OverlapPolicy;
    scheduleId: string;
    namespace: string;
    timezoneName?: string;
  }

  const overlapPolicyContent = getOverlapPolicyContent();
  const identity = getIdentity();

  let { scheduleOverlapPolicy, scheduleId, namespace, timezoneName }: Props =
    $props();

  // svelte-ignore state_referenced_locally
  const timezone = timezoneName || 'UTC';

  // svelte-ignore state_referenced_locally
  let selectedOverlapPolicy = writable<OverlapPolicy>(
    scheduleOverlapPolicy ?? 'Skip',
  );

  const zonedNow = utcToZonedTime(new Date(), timezone);
  const anHourAhead = addHours(zonedNow, 1);

  let startDate = $state(startOfDay(zonedNow));
  let startHour = $state(zonedNow.getHours().toString());
  let startMinute = $state(zonedNow.getMinutes().toString());
  let startSecond = $state(zonedNow.getSeconds().toString());

  let endDate = $state(startOfDay(anHourAhead));
  let endHour = $state(anHourAhead.getHours().toString());
  let endMinute = $state(anHourAhead.getMinutes().toString());
  let endSecond = $state(anHourAhead.getSeconds().toString());

  const startTimestamp = $derived(
    dateAndTimeToTimestamp(
      startDate,
      startHour,
      startMinute,
      startSecond,
      timezone,
    ),
  );
  const endTimestamp = $derived(
    dateAndTimeToTimestamp(endDate, endHour, endMinute, endSecond, timezone),
  );
  const invalidEndTime = $derived(endTimestamp <= startTimestamp);

  $effect(() => {
    return () => clearConfirmationModalActionTimeout('backfill');
  });
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
  confirmDisabled={invalidEndTime}
  on:confirmModal={() =>
    submitBackfillSchedule(
      {
        startTime: startTimestamp,
        endTime: endTimestamp,
        overlapPolicy: $selectedOverlapPolicy,
      },
      {
        identity,
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
    <div class="flex flex-col gap-6 p-2">
      <div class="flex w-full flex-col gap-2">
        <div class="sm:max-w-[round(up,calc(66.6666%_-_0.25rem))]">
          <DatePicker
            id="backfill-start-date"
            label={translate('common.start')}
            onDateChange={(d) => (startDate = startOfDay(d))}
            selected={startDate}
            todayLabel={translate('common.today')}
            closeLabel={translate('common.close')}
            clearLabel={translate('common.clear-input-button-label')}
          />
        </div>
        <TimePicker
          idPrefix="backfill-start-"
          bind:hour={startHour}
          bind:minute={startMinute}
          bind:second={startSecond}
          twelveHourClock={false}
        />
      </div>
      <div class="flex w-full flex-col gap-2">
        <div class="sm:max-w-[round(up,calc(66.6666%_-_0.25rem))]">
          <DatePicker
            id="backfill-end-date"
            label={translate('common.end')}
            onDateChange={(d) => (endDate = startOfDay(d))}
            selected={endDate}
            todayLabel={translate('common.today')}
            closeLabel={translate('common.close')}
            clearLabel={translate('common.clear-input-button-label')}
            isAllowed={(d) => !isBefore(d, startDate)}
          />
        </div>
        <TimePicker
          idPrefix="backfill-end-"
          bind:hour={endHour}
          bind:minute={endMinute}
          bind:second={endSecond}
          twelveHourClock={false}
          error={invalidEndTime}
        />
      </div>
      {#if invalidEndTime}
        <span class="text-xs text-danger" role="alert">
          {translate('schedules.backfill-end-before-start')}
        </span>
      {/if}
      <div class="flex w-full flex-row items-center gap-2">
        <Icon name="clock" aria-hidden="true" />
        <span class="text-xs font-normal text-slate-500"
          >{translate('common.based-on-time-preface')}
          {timezone === 'UTC'
            ? translate('common.universal-standard-time')
            : timezone}
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
            value === scheduleOverlapPolicy &&
              translate('schedules.overlap-schedule-policy-suffix'),
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
