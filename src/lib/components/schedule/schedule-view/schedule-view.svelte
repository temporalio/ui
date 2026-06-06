<script lang="ts">
  import { page } from '$app/state';

  import CodecServerErrorBanner from '$lib/components/codec-server-error-banner.svelte';
  import ScheduleAdvancedSettings from '$lib/components/schedule/schedule-advanced-settings.svelte';
  import ScheduleError from '$lib/components/schedule/schedule-error.svelte';
  import ScheduleFrequencyPanel from '$lib/components/schedule/schedule-frequency-panel.svelte';
  import ScheduleInput from '$lib/components/schedule/schedule-input.svelte';
  import ScheduleSearchAttributes from '$lib/components/schedule/schedule-search-attributes.svelte';
  import ScheduleWorkflowRuns from '$lib/components/schedule/schedule-workflow-runs.svelte';
  import StatusCounts from '$lib/components/status-counts.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import SplitButton from '$lib/holocene/split-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { coreUserStore } from '$lib/stores/core-user';
  import {
    clearScheduleTimeouts,
    currentScheduleFetch,
    loading,
    openConfirmationModal,
    refreshCurrentScheduleFetch,
  } from '$lib/stores/schedules';
  import {
    workflowCount,
    refresh as workflowRefresh,
  } from '$lib/stores/workflows';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import {
    routeForScheduleEdit,
    routeForSchedules,
  } from '$lib/utilities/route-for';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  import { parseOverlapPolicy } from '../schedule-form/utilities/request-data-to-form-data';

  import BackfillScheduleModal from './backfill-schedule-modal.svelte';
  import DeleteScheduleModal from './delete-schedule-modal.svelte';
  import PauseScheduleModal from './pause-schedule-modal.svelte';
  import ScheduleViewError from './schedule-view-error.svelte';
  import ScheduleViewLoading from './schedule-view-loading.svelte';
  import TriggerScheduleModal from './trigger-schedule-modal.svelte';

  const namespace = $derived(page.params.namespace);
  const scheduleId = $derived(decodeURIForSvelte(page.params.schedule));
  const workflowQuery = $derived(`TemporalScheduledById="${scheduleId}"`);

  const coreUser = coreUserStore();
  const editDisabled = $derived(
    $coreUser.namespaceWriteDisabled(namespace) || !writeActionsAreAllowed(),
  );

  $effect(() => {
    refreshCurrentScheduleFetch({ namespace, scheduleId });

    return () => {
      clearScheduleTimeouts();
    };
  });
</script>

{#await $currentScheduleFetch}
  <ScheduleViewLoading {namespace} {scheduleId} />
{:then currentSchedule}
  {#if $loading || !currentSchedule}
    <Loading class="my-2" />
  {:else}
    <header class="flex flex-row flex-wrap justify-between gap-2">
      <div class="relative flex flex-col gap-2">
        <Link href={routeForSchedules({ namespace })} icon="chevron-left">
          {translate('schedules.back-to-schedules')}
        </Link>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <WorkflowStatus
            status={currentSchedule?.schedule.state.paused
              ? 'Paused'
              : 'Running'}
          />
          <h1 class="select-all" data-testid="schedule-name">
            {scheduleId}
          </h1>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <p class="text-sm font-medium text-secondary">Workflow Type</p>
          <p>
            {currentSchedule?.schedule?.action?.startWorkflow?.workflowType
              ?.name}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <Timestamp
            as="p"
            class="flex items-center gap-2 text-right"
            dateTime={currentSchedule?.info?.createTime}
          >
            {#snippet leading()}
              <span class="text-sm font-medium text-secondary"> Created </span>
            {/snippet}
          </Timestamp>
        </div>
        {#if currentSchedule?.info?.updateTime}
          <div class="flex flex-wrap items-center gap-2">
            <Timestamp
              as="p"
              class="flex items-center gap-2 text-right"
              dateTime={currentSchedule?.info?.updateTime}
            >
              {#snippet leading()}
                <span class="text-sm font-medium text-secondary">
                  Last Updated
                </span>
              {/snippet}
            </Timestamp>
          </div>
        {/if}
        <div class="flex w-full flex-col gap-2">
          <p class="text-sm font-medium text-secondary">Total Workflows</p>

          <div class="flex items-center gap-2">
            <span class="font-mono" data-testid="workflow-count"
              >{$workflowCount.count.toLocaleString()}
            </span>
            <Button
              size="xs"
              variant="ghost"
              leadingIcon="retry"
              on:click={() => {
                refreshCurrentScheduleFetch({ namespace, scheduleId });
                $workflowRefresh = Date.now();
              }}
            >
              {#if $workflowCount.newCount > 0}
                +{$workflowCount.newCount.toLocaleString()}
              {/if}
            </Button>
          </div>
          <StatusCounts staticQuery={workflowQuery} />
        </div>
      </div>
      <SplitButton
        position="right"
        label={currentSchedule?.schedule?.state?.paused
          ? translate('schedules.unpause')
          : translate('schedules.pause')}
        menuLabel={translate('schedules.schedule-actions')}
        id="schedule-actions"
        disabled={editDisabled}
        on:click={() => openConfirmationModal('pause')}
      >
        <MenuItem
          data-testid="trigger-schedule"
          onclick={() => openConfirmationModal('trigger')}
        >
          {translate('schedules.trigger')}
        </MenuItem>
        <MenuItem
          data-testid="backfill-schedule"
          onclick={() => openConfirmationModal('backfill')}
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
          onclick={() => openConfirmationModal('delete')}
        >
          {translate('common.delete')}
        </MenuItem>
      </SplitButton>
    </header>
    <CodecServerErrorBanner />
    <div class="flex flex-col gap-4 pb-24">
      {#if currentSchedule?.info?.invalidScheduleError}
        <div class="w-full xl:w-1/2">
          <ScheduleError error={currentSchedule?.info?.invalidScheduleError} />
        </div>
      {/if}
      <div class="flex flex-col gap-4 xl:flex-row">
        <div class="flex w-full flex-col items-start gap-4 xl:w-2/3">
          <ScheduleWorkflowRuns
            {namespace}
            schedule={currentSchedule}
            {workflowQuery}
            triggerConfirmation={() => openConfirmationModal('trigger')}
            backfillConfirmation={() => openConfirmationModal('backfill')}
          />
          <ScheduleAdvancedSettings schedule={currentSchedule} />
          <ScheduleSearchAttributes schedule={currentSchedule} />
        </div>
        <div class="flex w-full flex-col gap-4 xl:w-1/3">
          <ScheduleInput
            {scheduleId}
            input={currentSchedule?.schedule?.action?.startWorkflow?.input}
          />
          <ScheduleFrequencyPanel spec={currentSchedule?.schedule?.spec} />
        </div>
      </div>
    </div>
    <PauseScheduleModal
      {scheduleId}
      {namespace}
      isSchedulePaused={currentSchedule?.schedule?.state?.paused}
    />
    <TriggerScheduleModal
      {scheduleId}
      {namespace}
      initialOverlapPolicy={parseOverlapPolicy(
        currentSchedule?.schedule?.policies?.overlapPolicy,
      )}
    />
    <BackfillScheduleModal
      {scheduleId}
      {namespace}
      initialOverlapPolicy={parseOverlapPolicy(
        currentSchedule?.schedule?.policies?.overlapPolicy,
      )}
    />
    <DeleteScheduleModal {scheduleId} {namespace} />
  {/if}
{:catch error}
  <ScheduleViewError {namespace} {scheduleId} errorMessage={error?.message} />
{/await}
