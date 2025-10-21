<script lang="ts">
  import { writable } from 'svelte/store';

  import { addDays, addHours, startOfDay } from 'date-fns';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import CodecServerErrorBanner from '$lib/components/codec-server-error-banner.svelte';
  import ScheduleAdvancedSettings from '$lib/components/schedule/schedule-advanced-settings.svelte';
  import ScheduleError from '$lib/components/schedule/schedule-error.svelte';
  import ScheduleFrequencyPanel from '$lib/components/schedule/schedule-frequency-panel.svelte';
  import ScheduleInput from '$lib/components/schedule/schedule-input.svelte';
  import ScheduleRecentRuns from '$lib/components/schedule/schedule-recent-runs.svelte';
  import ScheduleSearchAttributes from '$lib/components/schedule/schedule-search-attributes.svelte';
  import ScheduleUpcomingRuns from '$lib/components/schedule/schedule-upcoming-runs.svelte';
  import WorkflowCounts from '$lib/components/workflow/workflow-counts.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Button from '$lib/holocene/button.svelte';
  import DatePicker from '$lib/holocene/date-picker.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import SplitButton from '$lib/holocene/split-button.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import {
    backfillRequest,
    deleteSchedule,
    fetchSchedule,
    pauseSchedule,
    triggerImmediately,
    unpauseSchedule,
  } from '$lib/services/schedule-service';
  import { coreUserStore } from '$lib/stores/core-user';
  import { loading } from '$lib/stores/schedules';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { refresh, workflowCount } from '$lib/stores/workflows';
  import type { OverlapPolicy } from '$lib/types/schedule';
  import { getIdentity } from '$lib/utilities/core-context';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { formatDate, getUTCString } from '$lib/utilities/format-date';
  import {
    routeForScheduleEdit,
    routeForSchedules,
  } from '$lib/utilities/route-for';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  import type { DescribeScheduleResponse } from '$types';

  let namespace = $page.params.namespace;
  let scheduleId = $page.params.schedule;
  let workflowQuery = `TemporalScheduledById="${scheduleId}"`;

  const identity = getIdentity();

  const parameters = {
    namespace,
    scheduleId: decodeURIForSvelte(scheduleId),
  };

  let scheduleFetch = fetchSchedule(parameters);

  let pauseConfirmationModalOpen = false;
  let triggerConfirmationModalOpen = false;
  let backfillConfirmationModalOpen = false;
  let deleteConfirmationModalOpen = false;
  let reason = '';
  let error = '';
  let scheduleUpdating = false;
  let overlapPolicy = writable<OverlapPolicy>('Unspecified');
  let policies: { label: string; description: string; value: OverlapPolicy }[] =
    [
      {
        description: translate('schedules.trigger-unspecified-description'),
        label: translate('schedules.trigger-unspecified-title'),
        value: 'Unspecified',
      },
      {
        description: translate('schedules.trigger-buffer-all-description'),
        label: translate('schedules.trigger-buffer-all-title'),
        value: 'BufferAll',
      },
      {
        description: translate('schedules.trigger-allow-all-description'),
        label: translate('schedules.trigger-allow-all-title'),
        value: 'AllowAll',
      },
      {
        description: translate('schedules.trigger-skip-description'),
        label: translate('schedules.trigger-skip-title'),
        value: 'Skip',
      },
      {
        description: translate('schedules.trigger-buffer-one-description'),
        label: translate('schedules.trigger-buffer-one-title'),
        value: 'BufferOne',
      },
      {
        description: translate('schedules.trigger-cancel-other-description'),
        label: translate('schedules.trigger-cancel-other-title'),
        value: 'CancelOther',
      },
      {
        description: translate('schedules.trigger-terminate-other-description'),
        label: translate('schedules.trigger-terminate-other-title'),
        value: 'TerminateOther',
      },
    ];

  let coreUser = coreUserStore();
  $: editDisabled =
    $coreUser.namespaceWriteDisabled(namespace) || !writeActionsAreAllowed();

  const handleDelete = async () => {
    error = '';
    try {
      $loading = true;
      await deleteSchedule({ identity, namespace, scheduleId });
      deleteConfirmationModalOpen = false;
      setTimeout(() => {
        $loading = false;
        goto(routeForSchedules({ namespace }));
      }, 2000);
      reason = '';
    } catch (e) {
      error = translate('schedules.delete-schedule-error', {
        error: e?.message,
      });
      $loading = false;
    }
  };

  const handlePause = async (schedule: DescribeScheduleResponse) => {
    schedule?.schedule?.state?.paused
      ? await unpauseSchedule({
          identity,
          namespace,
          scheduleId,
          reason,
        })
      : await pauseSchedule({
          identity,
          namespace,
          scheduleId,
          reason,
        });
    scheduleFetch = fetchSchedule(parameters);
    reason = '';
    pauseConfirmationModalOpen = false;
  };

  const closeTriggerModal = () => {
    triggerConfirmationModalOpen = false;
    $overlapPolicy = 'Unspecified';
  };

  const handleTriggerImmediately = async () => {
    scheduleUpdating = true;
    await triggerImmediately({
      identity,
      namespace,
      scheduleId,
      overlapPolicy: $overlapPolicy,
    });
    setTimeout(() => {
      scheduleFetch = fetchSchedule(parameters);
      closeTriggerModal();
      scheduleUpdating = false;
    }, 1000);
  };

  let viewMoreBackfillOptions = false;
  let startDate = startOfDay(new Date());
  let endDate = startOfDay(new Date());

  let startHour = '';
  let startMinute = '';
  let startSecond = '';
  let endHour = '';
  let endMinute = '';
  let endSecond = '';

  const onStartDateChange = (d: CustomEvent) => {
    startDate = startOfDay(d.detail);
  };

  const onEndDateChange = (d: CustomEvent) => {
    endDate = startOfDay(d.detail);
  };

  const updateDefaultBackfillTimes = () => {
    const currentDate = new Date(Date.now());
    const dateAnHourAhead = addHours(currentDate, 1);

    startHour = currentDate.getUTCHours().toString();
    startMinute = currentDate.getUTCMinutes().toString();
    startSecond = currentDate.getUTCSeconds().toString();
    endHour = dateAnHourAhead.getUTCHours().toString();
    endMinute = dateAnHourAhead.getUTCMinutes().toString();
    endSecond = dateAnHourAhead.getUTCSeconds().toString();

    startDate = startOfDay(new Date());
    endDate =
      endHour < startHour
        ? startOfDay(addDays(new Date(), 1))
        : startOfDay(new Date());
  };

  $: backfillConfirmationModalOpen && updateDefaultBackfillTimes();

  const closeBackfillModal = () => {
    backfillConfirmationModalOpen = false;
    viewMoreBackfillOptions = false;
    $overlapPolicy = 'Unspecified';
  };

  const handleBackfill = async () => {
    scheduleUpdating = true;

    const startTime = getUTCString({
      date: startDate,
      hour: startHour,
      minute: startMinute,
      second: startSecond,
    });
    const endTime = getUTCString({
      date: endDate,
      hour: endHour,
      minute: endMinute,
      second: endSecond,
    });

    await backfillRequest({
      identity,
      namespace,
      scheduleId,
      overlapPolicy: $overlapPolicy,
      startTime,
      endTime,
    });
    setTimeout(() => {
      scheduleFetch = fetchSchedule(parameters);
      closeBackfillModal();
      scheduleUpdating = false;
    }, 1000);
  };

  const resetReason = () => {
    reason = '';
  };
</script>

{#await scheduleFetch}
  <header class="mb-8">
    <div class="relative flex flex-col gap-4">
      <Link href={routeForSchedules({ namespace })} icon="chevron-left">
        {translate('schedules.back-to-schedules')}
      </Link>
      <h1 class="select-all" data-testid="schedule-name">
        {scheduleId}
      </h1>
    </div>
  </header>
  <Loading />
{:then schedule}
  {#if $loading}
    <Loading title={translate('schedules.deleting')} class="my-2" />
  {:else}
    <header class="flex flex-row flex-wrap justify-between gap-4">
      <div class="relative flex flex-col">
        <Link href={routeForSchedules({ namespace })} icon="chevron-left">
          {translate('schedules.back-to-schedules')}
        </Link>
        <h1 class="relative flex items-center">
          <span class="select-all" data-testid="schedule-name">
            {scheduleId}
          </span>
        </h1>
        <div class="flex flex-wrap items-center gap-2 text-lg">
          <WorkflowStatus
            status={schedule?.schedule.state.paused ? 'Paused' : 'Running'}
          />
          <p>
            {schedule?.schedule?.action?.startWorkflow?.workflowType?.name}
          </p>
        </div>
        <p class="flex items-center gap-2 text-right text-sm">
          {translate('common.created', {
            created: formatDate(schedule?.info?.createTime, $timeFormat, {
              relative: $relativeTime,
            }),
          })}
        </p>
        {#if schedule?.info?.updateTime}
          <p class="flex items-center gap-2 text-right text-sm">
            {translate('common.last-updated', {
              updated: formatDate(schedule?.info?.updateTime, $timeFormat, {
                relative: $relativeTime,
              }),
            })}
          </p>
        {/if}
      </div>
      <SplitButton
        position="right"
        label={schedule?.schedule?.state?.paused
          ? translate('schedules.unpause')
          : translate('schedules.pause')}
        menuLabel={translate('schedules.schedule-actions')}
        id="schedule-actions"
        disabled={editDisabled}
        on:click={() => (pauseConfirmationModalOpen = true)}
      >
        <MenuItem
          data-testid="trigger-schedule"
          on:click={() => (triggerConfirmationModalOpen = true)}
        >
          {translate('schedules.trigger')}
        </MenuItem>
        <MenuItem
          data-testid="backfill-schedule"
          on:click={() => (backfillConfirmationModalOpen = true)}
        >
          {translate('schedules.backfill')}
        </MenuItem>
        <MenuItem
          data-testid="edit-schedule"
          href={routeForScheduleEdit({ namespace, scheduleId })}
        >
          {translate('common.edit')}
        </MenuItem>
        <MenuItem
          data-testid="delete-schedule"
          destructive
          on:click={() => (deleteConfirmationModalOpen = true)}
        >
          {translate('common.delete')}
        </MenuItem>
      </SplitButton>
    </header>
    <CodecServerErrorBanner />
    <div class="flex flex-col gap-4 pb-24">
      {#if schedule?.info?.invalidScheduleError}
        <div class="w-full xl:w-1/2">
          <ScheduleError error={schedule?.info?.invalidScheduleError} />
        </div>
      {/if}
      <div class="flex w-full flex-col gap-2 text-lg">
        <div class="flex items-center gap-2">
          <span data-testid="workflow-count"
            >{$workflowCount.count.toLocaleString()}
            <Translate
              key="common.workflows-plural"
              count={$workflowCount.count}
            />
          </span>
          <Button
            size="xs"
            variant="ghost"
            leadingIcon="retry"
            on:click={() => {
              scheduleFetch = fetchSchedule(parameters);
              $refresh = Date.now();
            }}
          >
            {#if $workflowCount.newCount > 0}
              +{$workflowCount.newCount.toLocaleString()}
            {/if}
          </Button>
        </div>
        <WorkflowCounts staticQuery={workflowQuery} />
      </div>
      <div class="flex flex-col gap-4 xl:flex-row">
        <div class="flex w-full flex-col items-start gap-4 xl:w-2/3">
          <ScheduleRecentRuns
            {namespace}
            recentRuns={schedule?.info?.recentActions}
            {workflowQuery}
          />
          <ScheduleUpcomingRuns
            futureRuns={schedule?.info?.futureActionTimes}
          />
          <ScheduleAdvancedSettings
            spec={schedule?.schedule?.spec}
            state={schedule?.schedule?.state}
            policies={schedule?.schedule?.policies}
            notes={schedule?.schedule?.state?.notes}
          />
          <ScheduleSearchAttributes
            searchAttributes={schedule?.searchAttributes ?? {}}
          />
        </div>
        <div class="flex w-full flex-col gap-4 xl:w-1/3">
          <ScheduleInput
            input={schedule?.schedule?.action?.startWorkflow?.input}
          />
          <ScheduleFrequencyPanel
            frequency={[
              ...(schedule?.schedule?.spec?.structuredCalendar ?? []),
              ...(schedule?.schedule?.spec?.interval ?? []),
            ]}
            timezoneName={schedule?.schedule?.spec?.timezoneName}
          />
        </div>
      </div>
    </div>
    <Modal
      id="pause-schedule-modal"
      bind:open={pauseConfirmationModalOpen}
      confirmType="primary"
      confirmText={schedule?.schedule.state.paused
        ? translate('schedules.unpause')
        : translate('schedules.pause')}
      cancelText={translate('common.cancel')}
      confirmDisabled={!reason}
      on:confirmModal={() => handlePause(schedule)}
      on:cancelModal={resetReason}
    >
      <h3 slot="title">
        {schedule?.schedule.state.paused
          ? translate('schedules.unpause-modal-title')
          : translate('schedules.pause-modal-title')}
      </h3>
      <div slot="content">
        <p>
          {schedule?.schedule.state.paused
            ? translate('schedules.unpause-modal-confirmation', {
                schedule: scheduleId,
              })
            : translate('schedules.pause-modal-confirmation', {
                schedule: scheduleId,
              })}
        </p>
        <p class="my-4">
          {schedule?.schedule.state.paused
            ? translate('schedules.unpause-reason')
            : translate('schedules.pause-reason')}
        </p>
        <Input
          id="pause-reason"
          bind:value={reason}
          placeholder={translate('common.reason')}
          label={translate('common.reason')}
          labelHidden
        />
      </div>
    </Modal>
    <Modal
      id="trigger-schedule-modal"
      large
      bind:open={triggerConfirmationModalOpen}
      confirmType="primary"
      confirmText={translate('schedules.trigger')}
      cancelText={translate('common.cancel')}
      loading={scheduleUpdating}
      on:confirmModal={() => handleTriggerImmediately()}
      on:cancelModal={closeTriggerModal}
    >
      <h3 slot="title">
        {translate('schedules.trigger-modal-title')}
      </h3>
      <div slot="content">
        <RadioGroup
          group={overlapPolicy}
          name="trigger-event-id"
          class="h-auto overflow-auto"
        >
          {#each policies as policy}
            <RadioInput
              id={policy.value}
              value={policy.value}
              label={policy.label}
              description={policy.description}
            />
          {/each}
        </RadioGroup>
      </div>
    </Modal>
    <Modal
      id="backfill-schedule-modal"
      large
      bind:open={backfillConfirmationModalOpen}
      confirmType="primary"
      confirmText={translate('schedules.schedule')}
      cancelText={translate('common.cancel')}
      loading={scheduleUpdating}
      on:confirmModal={() => handleBackfill()}
      on:cancelModal={closeBackfillModal}
    >
      <h3 slot="title">
        {translate('schedules.schedule')}
        {translate('schedules.backfill')}
      </h3>
      <div slot="content" class="p-0">
        <div class="flex flex-col gap-2 p-2">
          <DatePicker
            label={translate('common.start')}
            on:datechange={onStartDateChange}
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
            on:datechange={onEndDateChange}
            selected={endDate}
            todayLabel={translate('common.today')}
            closeLabel={translate('common.close')}
            clearLabel={translate('common.clear-input-button-label')}
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
              >{translate('common.based-on-time-preface')} Universal Standard Time
              (UTC)
            </span>
          </div>
        </div>

        <hr
          tabindex="-1"
          aria-hidden="true"
          class="my-4 w-full border-subtle"
        />

        <div class="flex max-h-52 flex-col gap-2 overflow-auto">
          <RadioGroup
            group={overlapPolicy}
            name="backfill-event-id"
            class="h-auto overflow-auto"
          >
            {#each policies.slice(0, viewMoreBackfillOptions ? policies.length : 3) as policy}
              <RadioInput
                id={policy.value}
                value={policy.value}
                label={policy.label}
                description={policy.description}
              />
            {/each}
          </RadioGroup>
          {#if !viewMoreBackfillOptions}
            <Button
              variant="ghost"
              size="xs"
              on:click={() => (viewMoreBackfillOptions = true)}
              >{translate('schedules.more-options')}</Button
            >
          {/if}
        </div>
      </div>
    </Modal>
    <Modal
      id="delete-schedule-modal"
      bind:open={deleteConfirmationModalOpen}
      bind:error
      confirmType="destructive"
      confirmText={translate('common.delete')}
      cancelText={translate('common.cancel')}
      on:confirmModal={handleDelete}
      on:cancelModal={resetReason}
    >
      <h3 slot="title">{translate('schedules.delete-modal-title')}</h3>
      <div slot="content">
        <p>
          {translate('schedules.delete-modal-confirmation', {
            schedule: scheduleId,
          })}
        </p>
      </div>
    </Modal>
  {/if}
{:catch error}
  <header class="mb-8">
    <div class="relative flex flex-col gap-1">
      <Link href={routeForSchedules({ namespace })} icon="chevron-left">
        {translate('schedules.back-to-schedules')}
      </Link>
      <h1 class="mt-8 select-all" data-testid="schedule-name">
        {scheduleId}
      </h1>
      <p class="text-sm">
        {namespace}
      </p>
    </div>
  </header>
  <ScheduleError error={error?.message} />
{/await}
