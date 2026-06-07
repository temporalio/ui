<script lang="ts">
  import { page } from '$app/state';

  import CodecServerErrorBanner from '$lib/components/codec-server-error-banner.svelte';
  import ScheduleAdvancedSettings from '$lib/components/schedule/schedule-advanced-settings.svelte';
  import ScheduleError from '$lib/components/schedule/schedule-error.svelte';
  import ScheduleFrequencyPanel from '$lib/components/schedule/schedule-frequency-panel.svelte';
  import ScheduleInput from '$lib/components/schedule/schedule-input.svelte';
  import ScheduleSearchAttributes from '$lib/components/schedule/schedule-search-attributes.svelte';
  import StatusCounts from '$lib/components/status-counts.svelte';
  import { timestamp } from '$lib/components/timestamp.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon';
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
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import {
    routeForScheduleEdit,
    routeForSchedules,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  import BackfillScheduleModal from '../schedule-action-modals/backfill-schedule-modal.svelte';
  import DeleteScheduleModal from '../schedule-action-modals/delete-schedule-modal.svelte';
  import PauseScheduleModal from '../schedule-action-modals/pause-schedule-modal.svelte';
  import TriggerScheduleModal from '../schedule-action-modals/trigger-schedule-modal.svelte';
  import { parseOverlapPolicy } from '../schedule-form/utilities/request-data-to-form-data';

  import ScheduleInputCard from './schedule-input-card.svelte';
  import ScheduleSpecCard from './schedule-spec-card.svelte';
  import ScheduleViewError from './schedule-view-error.svelte';
  import ScheduleViewLoading from './schedule-view-loading.svelte';
  import WorkflowRunsCard from './workflow-runs-card.svelte';

  const namespace = $derived(page.params.namespace);
  const scheduleId = $derived(decodeURIForSvelte(page.params.schedule));
  const workflowQuery = $derived(`TemporalScheduledById="${scheduleId}"`);

  const coreUser = coreUserStore();
  const editDisabled = $derived(
    $coreUser.namespaceWriteDisabled(namespace) || !writeActionsAreAllowed(),
  );

  $effect.pre(() => {
    refreshCurrentScheduleFetch({ namespace, scheduleId });

    return () => {
      clearScheduleTimeouts();
    };
  });

  const { copy, copied } = copyToClipboard();
</script>

{#await $currentScheduleFetch}
  <ScheduleViewLoading {namespace} {scheduleId} />
{:then currentSchedule}
  {#if $loading || !currentSchedule}
    <Loading class="my-2" />
  {:else}
    <header class="mb-2 flex flex-col gap-4">
      <Link href={routeForSchedules({ namespace })} icon="chevron-left">
        {translate('schedules.back-to-schedules')}
      </Link>
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-2">
          <h1
            class="flex select-all flex-wrap items-center gap-2 text-3xl"
            data-testid="schedule-name"
          >
            <WorkflowStatus
              status={currentSchedule?.schedule.state.paused
                ? 'Paused'
                : 'Running'}
            />
            {scheduleId}
          </h1>

          <dl class="contents">
            <div class="flex items-center gap-2">
              <dt class="text-sm font-medium text-secondary">Workflow Type</dt>
              <dd class="inline-flex items-center gap-1">
                {currentSchedule?.schedule?.action?.startWorkflow?.workflowType
                  ?.name}
                <div class="flex items-center gap-2">
                  <Link
                    class="block p-1"
                    href={routeForWorkflowsWithQuery({
                      namespace,
                      query: [
                        `WorkflowType="${
                          currentSchedule?.schedule?.action?.startWorkflow
                            ?.workflowType?.name
                        }"`,
                        `TemporalScheduledById="${scheduleId}"`,
                      ].join(' AND '),
                    })}
                  >
                    <Icon
                      name="filter"
                      title="Filter scheduled workflows by this type"
                      class="h-4 w-4"
                    />
                  </Link>
                  <button
                    class="p-1 text-secondary"
                    onclick={(e) => {
                      copy(
                        e,
                        currentSchedule?.schedule?.action?.startWorkflow
                          ?.workflowType?.name,
                      );
                    }}
                  >
                    <Icon
                      title={$copied
                        ? translate('common.copy-success-icon-title')
                        : translate('common.copy-icon-title')}
                      name={$copied ? 'checkmark' : 'copy'}
                      class="h-4 w-4"
                    />
                  </button>
                </div>
              </dd>
            </div>

            <div class="flex items-center gap-2">
              <dt class="text-sm font-medium text-secondary">Created</dt>
              <dd>
                {$timestamp(currentSchedule?.info?.createTime)}
              </dd>
            </div>

            {#if currentSchedule?.info.updateTime}
              <div class="flex items-center gap-2">
                <dt class="text-sm font-medium text-secondary">Last Updated</dt>
                <dd>
                  {$timestamp(currentSchedule?.info?.updateTime)}
                </dd>
              </div>
            {/if}
          </dl>
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
      </div>

      <dl class="flex flex-col gap-2">
        <dt class="text-sm font-medium text-secondary">Total Workflows</dt>
        <dd class="flex flex-wrap items-center gap-2">
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
          <StatusCounts class="p-0" staticQuery={workflowQuery} />
        </dd>
      </dl>
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
          <WorkflowRunsCard
            {namespace}
            schedule={currentSchedule}
            {workflowQuery}
            openTriggerConfirmationModal={() =>
              openConfirmationModal('trigger')}
            openBackfillConfirmationModal={() =>
              openConfirmationModal('backfill')}
          />
          <ScheduleAdvancedSettings schedule={currentSchedule} />
          <ScheduleSearchAttributes schedule={currentSchedule} />
        </div>

        <div class="flex w-full flex-col gap-4 xl:w-1/3">
          <ScheduleInputCard
            {scheduleId}
            input={currentSchedule?.schedule?.action?.startWorkflow?.input}
          />
          <ScheduleSpecCard schedule={currentSchedule} />
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
