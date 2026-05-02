<script lang="ts">
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import { routeForStandaloneActivitiesWithQuery } from '$lib/utilities/route-for';
  import type { StandaloneActivityPoller } from '$lib/utilities/standalone-activity-poller.svelte';
  import { fromSeconds } from '$lib/utilities/to-duration';

  import {
    DetailList,
    DetailListColumn,
    DetailListLabel,
    DetailListLinkValue,
    DetailListTextValue,
    DetailListTimestampValue,
  } from '../detail-list';

  import ActivityExecutionActions from './activity-actions.svelte';
  import ActivityExecutionStatus from './activity-status.svelte';

  interface Props {
    activityExecutionInfo: ActivityExecutionInfo;
    namespace: string;
    poller: StandaloneActivityPoller;
  }

  let { activityExecutionInfo, namespace, poller }: Props = $props();

  const activityType = $derived(activityExecutionInfo.activityType.name);
  const activityTypeFilterLink = $derived(
    routeForStandaloneActivitiesWithQuery(
      { namespace },
      `ActivityType="${activityType}"`,
    ),
  );
  const taskQueueFilterLink = $derived(
    routeForStandaloneActivitiesWithQuery(
      { namespace },
      `TaskQueue="${activityExecutionInfo.taskQueue}"`,
    ),
  );
</script>

<div class="space-y-2">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <div class="flex flex-wrap items-center gap-2">
      <ActivityExecutionStatus status={activityExecutionInfo.status} />
      <div class="text-2xl font-medium">
        <Copyable
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          content={activityExecutionInfo.activityId}
          clickAllToCopy
          container-class="w-full"
          class="overflow-hidden text-ellipsis text-left"
        />
      </div>
    </div>
    <ActivityExecutionActions {activityExecutionInfo} {namespace} {poller} />
  </div>
  <DetailList aria-label="activity execution details" rowCount={4}>
    <DetailListColumn>
      <DetailListLabel
        >{translate('standalone-activities.scheduled-time')}</DetailListLabel
      >
      <DetailListTimestampValue
        timestamp={activityExecutionInfo.scheduleTime}
      />
      <DetailListLabel
        >{translate('standalone-activities.last-started-time')}</DetailListLabel
      >
      <DetailListTimestampValue
        timestamp={activityExecutionInfo.lastStartedTime}
      />
      <DetailListLabel
        >{translate('standalone-activities.close-time')}</DetailListLabel
      >
      <DetailListTimestampValue
        timestamp={activityExecutionInfo.closeTime}
        fallback="-"
      />
      <DetailListLabel
        >{translate('standalone-activities.duration')}</DetailListLabel
      >
      <DetailListTextValue
        text={activityExecutionInfo.executionDuration
          ? fromSeconds(activityExecutionInfo.executionDuration)
          : '-'}
      />
    </DetailListColumn>
    <DetailListColumn>
      <DetailListLabel
        >{translate('standalone-activities.run-id')}</DetailListLabel
      >
      <DetailListTextValue copyable text={activityExecutionInfo.runId} />
      {#if activityType}
        <DetailListLabel
          >{translate('standalone-activities.activity-type')}</DetailListLabel
        >
        <DetailListLinkValue
          copyable
          iconName="filter"
          text={activityType}
          href={activityTypeFilterLink}
        />
      {/if}
      <DetailListLabel
        >{translate('standalone-activities.task-queue')}</DetailListLabel
      >
      <DetailListLinkValue
        copyable
        iconName="filter"
        text={activityExecutionInfo.taskQueue}
        href={taskQueueFilterLink}
      />
    </DetailListColumn>
    <DetailListColumn>
      {#if $isCloud}
        <DetailListLabel>Billable Actions</DetailListLabel>
        <DetailListTextValue text={String(activityExecutionInfo.attempt)} />
      {:else}
        <DetailListLabel>State Transitions</DetailListLabel>
        <DetailListTextValue
          text={activityExecutionInfo.stateTransitionCount}
        />
      {/if}
    </DetailListColumn>
  </DetailList>
</div>
