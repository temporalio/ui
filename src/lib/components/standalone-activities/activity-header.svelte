<script lang="ts">
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import {
    routeForStandaloneActivitiesWithQuery,
    routeForTaskQueue,
  } from '$lib/utilities/route-for';
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
</script>

<div class="space-y-2">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
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
      <DetailListLabel>Scheduled Time</DetailListLabel>
      <DetailListTimestampValue
        timestamp={activityExecutionInfo.scheduleTime}
      />
      <DetailListLabel>Last Started Time</DetailListLabel>
      <DetailListTimestampValue
        timestamp={activityExecutionInfo.lastStartedTime}
      />
      <DetailListLabel>Close Time</DetailListLabel>
      <DetailListTimestampValue
        timestamp={activityExecutionInfo.closeTime}
        fallback="-"
      />
      <DetailListLabel>Duration</DetailListLabel>
      <DetailListTextValue
        text={activityExecutionInfo.executionDuration
          ? fromSeconds(activityExecutionInfo.executionDuration)
          : '-'}
      />
    </DetailListColumn>
    <DetailListColumn>
      <DetailListLabel>Run ID</DetailListLabel>
      <DetailListTextValue copyable text={activityExecutionInfo.runId} />
      <DetailListLabel>Activity Type</DetailListLabel>
      <DetailListLinkValue
        copyable
        iconName="filter"
        text={activityType}
        href={activityTypeFilterLink}
      />
      <DetailListLabel>Task Queue</DetailListLabel>
      <DetailListLinkValue
        href={routeForTaskQueue({
          namespace,
          queue: activityExecutionInfo.taskQueue,
        })}
        text={activityExecutionInfo.taskQueue}
      />
    </DetailListColumn>
  </DetailList>
</div>
