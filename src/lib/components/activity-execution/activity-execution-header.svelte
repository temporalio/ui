<script lang="ts">
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import { routeForTaskQueue } from '$lib/utilities/route-for';
  import { fromSeconds } from '$lib/utilities/to-duration';

  import {
    DetailList,
    DetailListColumn,
    DetailListLabel,
    DetailListLinkValue,
    DetailListTextValue,
    DetailListTimestampValue,
  } from '../detail-list';

  import ActivityExecutionStatus from './activity-execution-status.svelte';

  interface Props {
    activityExecutionInfo: ActivityExecutionInfo;
    namespace: string;
  }

  let { activityExecutionInfo, namespace }: Props = $props();
</script>

<div class="space-y-2">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <ActivityExecutionStatus status={activityExecutionInfo.status} />
      <h1>{activityExecutionInfo.activityType.name}</h1>
    </div>
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
      <DetailListTimestampValue timestamp={activityExecutionInfo.closeTime} />
      <DetailListLabel>Duration</DetailListLabel>
      <DetailListTextValue
        text={fromSeconds(activityExecutionInfo.executionDuration)}
      />
    </DetailListColumn>
    <DetailListColumn>
      <DetailListLabel>Run ID</DetailListLabel>
      <DetailListTextValue copyable text={activityExecutionInfo.runId} />
      <DetailListLabel>Activity Type</DetailListLabel>
      <DetailListTextValue text={activityExecutionInfo.activityType.name} />
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
