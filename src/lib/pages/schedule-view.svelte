<script lang="ts">
  import { writable } from 'svelte/store';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import ScheduleAdvancedSettings from '$lib/components/schedule/schedule-advanced-settings.svelte';
  import ScheduleError from '$lib/components/schedule/schedule-error.svelte';
  import ScheduleFrequencyPanel from '$lib/components/schedule/schedule-frequency-panel.svelte';
  import ScheduleRecentRuns from '$lib/components/schedule/schedule-recent-runs.svelte';
  import ScheduleUpcomingRuns from '$lib/components/schedule/schedule-upcoming-runs.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import SplitButton from '$lib/holocene/split-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    deleteSchedule,
    fetchSchedule,
    pauseSchedule,
    triggerImmediately,
    unpauseSchedule,
  } from '$lib/services/schedule-service';
  import { coreUserStore } from '$lib/stores/core-user';
  import { loading } from '$lib/stores/schedules';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { OverlapPolicy } from '$lib/types/schedule';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { formatDate } from '$lib/utilities/format-date';
  import {
    routeForScheduleEdit,
    routeForSchedules,
  } from '$lib/utilities/route-for';

  import type { DescribeScheduleResponse } from '$types';

  let namespace = $page.params.namespace;
  let scheduleId = $page.params.schedule;

  const parameters = {
    namespace,
    scheduleId: decodeURIForSvelte(scheduleId),
  };

  let scheduleFetch = fetchSchedule(parameters);

  let pauseConfirmationModalOpen = false;
  let triggerConfirmationModalOpen = false;
  let deleteConfirmationModalOpen = false;
  let reason = '';
  let error = '';
  let triggerLoading = false;
  let overlapPolicy = writable<OverlapPolicy>('Unspecified');
  let policies: { label: string; description: string; value: OverlapPolicy }[] =
    [
      {
        description: translate('schedules', 'trigger-unspecified-description'),
        label: translate('schedules', 'trigger-unspecified-title'),
        value: 'Unspecified',
      },
      {
        description: translate('schedules', 'trigger-allow-all-description'),
        label: translate('schedules', 'trigger-allow-all-title'),
        value: 'AllowAll',
      },
      {
        description: translate('schedules', 'trigger-skip-description'),
        label: translate('schedules', 'trigger-skip-title'),
        value: 'Skip',
      },
      {
        description: translate('schedules', 'trigger-buffer-one-description'),
        label: translate('schedules', 'trigger-buffer-one-title'),
        value: 'BufferOne',
      },
      {
        description: translate('schedules', 'trigger-buffer-all-description'),
        label: translate('schedules', 'trigger-buffer-all-title'),
        value: 'BufferAll',
      },
      {
        description: translate('schedules', 'trigger-cancel-other-description'),
        label: translate('schedules', 'trigger-cancel-other-title'),
        value: 'CancelOther',
      },
      {
        description: translate(
          'schedules',
          'trigger-terminate-other-description',
        ),
        label: translate('schedules', 'trigger-terminate-other-title'),
        value: 'TerminateOther',
      },
    ];

  let coreUser = coreUserStore();
  let editDisabled = $coreUser.namespaceWriteDisabled(namespace);

  const handleDelete = async () => {
    error = '';
    try {
      $loading = true;
      await deleteSchedule({ namespace, scheduleId });
      deleteConfirmationModalOpen = false;
      setTimeout(() => {
        $loading = false;
        goto(routeForSchedules({ namespace }));
      }, 2000);
      reason = '';
    } catch (e) {
      error = translate('schedules', 'delete-schedule-error', {
        error: e?.message,
      });
      $loading = false;
    }
  };

  const handlePause = async (schedule: DescribeScheduleResponse) => {
    schedule?.schedule?.state?.paused
      ? await unpauseSchedule({
          namespace,
          scheduleId,
          reason,
        })
      : await pauseSchedule({
          namespace,
          scheduleId,
          reason,
        });
    scheduleFetch = fetchSchedule(parameters, fetch);
    reason = '';
    pauseConfirmationModalOpen = false;
  };

  const handleTriggerImmediately = async () => {
    triggerLoading = true;
    await triggerImmediately({
      namespace,
      scheduleId,
      overlapPolicy: $overlapPolicy,
    });
    setTimeout(() => {
      scheduleFetch = fetchSchedule(parameters, fetch);
      triggerConfirmationModalOpen = false;
      triggerLoading = false;
    }, 1000);
  };

  const resetReason = () => {
    reason = '';
  };
</script>

{#await scheduleFetch}
  <header class="mb-8">
    <div class="relative flex flex-col gap-1">
      <Link
        on:click={() => {
          goto(routeForSchedules({ namespace }));
        }}
        icon="chevron-left"
      >
        {translate('schedules', 'back-to-schedules')}
      </Link>
      <h1
        class="mt-8 select-all text-2xl font-medium"
        data-testid="schedule-name"
      >
        {scheduleId}
      </h1>
      <p class="text-sm">
        {namespace}
      </p>
    </div>
  </header>
  <Loading />
{:then schedule}
  {#if $loading}
    <Loading title={translate('schedules', 'deleting')} class="my-2" />
  {:else}
    <header class="mb-8 flex flex-row justify-between gap-4">
      <div class="relative flex flex-col gap-4">
        <Link
          on:click={() => {
            goto(routeForSchedules({ namespace }));
          }}
          icon="chevron-left"
        >
          {translate('schedules', 'back-to-schedules')}
        </Link>
        <h1 class="relative mt-4 flex items-center text-2xl">
          <span class="select-all font-medium" data-testid="schedule-name">
            {scheduleId}
          </span>
        </h1>
        <div class="flex items-center gap-2 text-lg">
          <WorkflowStatus
            status={schedule?.schedule.state.paused ? 'Paused' : 'Running'}
          />
          <p>
            {schedule?.schedule?.action?.startWorkflow?.workflowType?.name}
          </p>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <p>
            {translate('created', {
              created: formatDate(schedule?.info?.createTime, $timeFormat, {
                relative: $relativeTime,
              }),
            })}
          </p>
        </div>
        {#if schedule?.info?.updateTime}
          <div class="flex items-center gap-2 text-sm">
            <p>
              {translate('last-updated', {
                updated: formatDate(schedule?.info?.updateTime, $timeFormat, {
                  relative: $relativeTime,
                }),
              })}
            </p>
          </div>
        {/if}
      </div>
      <SplitButton
        position="right"
        label={schedule?.schedule?.state?.paused
          ? translate('schedules', 'unpause')
          : translate('schedules', 'pause')}
        menuLabel={translate('schedules', 'schedule-actions')}
        id="schedule-actions"
        disabled={editDisabled}
        on:click={() => (pauseConfirmationModalOpen = true)}
      >
        <MenuItem
          data-testid="trigger-schedule"
          on:click={() => (triggerConfirmationModalOpen = true)}
        >
          {translate('schedules', 'trigger')}
        </MenuItem>
        <MenuItem
          data-testid="edit-schedule"
          href={routeForScheduleEdit({ namespace, scheduleId })}
        >
          {translate('edit')}
        </MenuItem>
        <MenuItem
          data-testid="delete-schedule"
          destructive
          on:click={() => (deleteConfirmationModalOpen = true)}
        >
          {translate('delete')}
        </MenuItem>
      </SplitButton>
    </header>
    <div class="flex flex-col gap-4 pb-24">
      {#if schedule?.info?.invalidScheduleError}
        <div class="w-full xl:w-1/2">
          <ScheduleError error={schedule?.info?.invalidScheduleError} />
        </div>
      {/if}
      <div class="flex flex-col gap-4 xl:flex-row">
        <div class="flex w-full flex-col items-start gap-4 xl:w-2/3">
          <ScheduleRecentRuns
            {namespace}
            recentRuns={schedule?.info?.recentActions}
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
        </div>
        <div class="w-full xl:w-1/3">
          <ScheduleFrequencyPanel
            calendar={schedule?.schedule?.spec?.structuredCalendar?.[0]}
            interval={schedule?.schedule?.spec?.interval?.[0]}
          />
        </div>
      </div>
    </div>
    <Modal
      id="pause-schedule-modal"
      bind:open={pauseConfirmationModalOpen}
      confirmType="primary"
      confirmText={schedule?.schedule.state.paused
        ? translate('schedules', 'unpause')
        : translate('schedules', 'pause')}
      cancelText={translate('cancel')}
      confirmDisabled={!reason}
      on:confirmModal={() => handlePause(schedule)}
      on:cancelModal={resetReason}
    >
      <h3 slot="title">
        {schedule?.schedule.state.paused
          ? translate('schedules', 'unpause-modal-title')
          : translate('schedules', 'pause-modal-title')}
      </h3>
      <div slot="content">
        <p>
          {schedule?.schedule.state.paused
            ? translate('schedules', 'unpause-modal-confirmation', {
                schedule: scheduleId,
              })
            : translate('schedules', 'pause-modal-confirmation', {
                schedule: scheduleId,
              })}
        </p>
        <p class="my-4">
          {schedule?.schedule.state.paused
            ? translate('schedules', 'unpause-reason')
            : translate('schedules', 'pause-reason')}
        </p>
        <input
          class="mt-4 block w-full rounded-md border border-gray-200 p-2"
          placeholder={translate('reason')}
          bind:value={reason}
          on:keydown|stopPropagation
        />
      </div>
    </Modal>
    <Modal
      id="trigger-schedule-modal"
      large
      bind:open={triggerConfirmationModalOpen}
      confirmType="primary"
      confirmText={translate('schedules', 'trigger')}
      cancelText={translate('cancel')}
      loading={triggerLoading}
      on:confirmModal={() => handleTriggerImmediately()}
      on:cancelModal={() => (triggerConfirmationModalOpen = false)}
    >
      <h3 slot="title">
        {translate('schedules', 'trigger-modal-title')}
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
      id="delete-schedule-modal"
      bind:open={deleteConfirmationModalOpen}
      bind:error
      confirmType="destructive"
      confirmText={translate('delete')}
      cancelText={translate('cancel')}
      on:confirmModal={handleDelete}
      on:cancelModal={resetReason}
    >
      <h3 slot="title">{translate('schedules', 'delete-modal-title')}</h3>
      <div slot="content">
        <p>
          {translate('schedules', 'delete-modal-confirmation', {
            schedule: scheduleId,
          })}
        </p>
      </div>
    </Modal>
  {/if}
{:catch error}
  <header class="mb-8">
    <div class="relative flex flex-col gap-1">
      <Link
        on:click={() => {
          goto(routeForSchedules({ namespace }));
        }}
        icon="chevron-left"
      >
        {translate('schedules', 'back-to-schedules')}
      </Link>
      <h1
        class="mt-8 select-all text-2xl font-medium"
        data-testid="schedule-name"
      >
        {scheduleId}
      </h1>
      <p class="text-sm">
        {namespace}
      </p>
    </div>
  </header>
  <ScheduleError error={error?.message} />
{/await}
