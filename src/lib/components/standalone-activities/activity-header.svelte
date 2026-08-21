<script lang="ts">
  import ActivityExecutionStatus from '$lib/components/execution-status.svelte';
  import SdkLogo from '$lib/components/lines-and-dots/sdk-logo.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconFilter } from '$lib/io/icon';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import { isActivityDelayed } from '$lib/utilities/delayed-activities';
  import { formatDurationAbbreviated } from '$lib/utilities/format-time';
  import { toActivityStatus } from '$lib/utilities/get-activity-status-and-count';
  import { formatSDKName } from '$lib/utilities/get-sdk-version';
  import { routeForStandaloneActivitiesWithQuery } from '$lib/utilities/route-for';
  import type { StandaloneActivityPoller } from '$lib/utilities/standalone-activity-poller.svelte';

  import {
    DetailList,
    DetailListColumn,
    DetailListLabel,
    DetailListLinkValue,
    DetailListTextValue,
    DetailListTimestampValue,
    DetailListValue,
  } from '../detail-list';

  import ActivityExecutionActions from './activity-actions.svelte';

  interface Props {
    activityExecutionInfo: ActivityExecutionInfo;
    namespace: string;
    poller: StandaloneActivityPoller;
  }

  let { activityExecutionInfo, namespace, poller }: Props = $props();

  const activityType = $derived(activityExecutionInfo.activityType?.name);
  const activityTypeFilterLink = $derived(
    routeForStandaloneActivitiesWithQuery(
      { namespace },
      `ActivityType="${activityType}"`,
    ),
  );
  const billableActions = $derived(
    (activityExecutionInfo.attempt ?? 0) +
      Number(activityExecutionInfo.totalHeartbeatCount ?? 0),
  );
  const taskQueueFilterLink = $derived(
    routeForStandaloneActivitiesWithQuery(
      { namespace },
      `TaskQueue="${activityExecutionInfo.taskQueue}"`,
    ),
  );
</script>

<div class="flex flex-col gap-4">
  <div
    class="flex items-start justify-between gap-4 max-xl:w-full max-xl:flex-wrap"
  >
    <div class="flex items-center gap-4">
      <ActivityExecutionStatus
        status={toActivityStatus(activityExecutionInfo.status)}
        delayed={isActivityDelayed(activityExecutionInfo)}
        big
      />
      <h1
        data-testid="activity-id-heading"
        class="gap-0 overflow-hidden max-sm:text-xl sm:max-md:text-2xl"
      >
        <Copyable
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          content={activityExecutionInfo.activityId ?? ''}
          clickAllToCopy
          container-class="w-full"
          class="overflow-hidden text-ellipsis text-left"
        />
      </h1>
    </div>
    <ActivityExecutionActions {activityExecutionInfo} {namespace} {poller} />
  </div>
  <DetailList
    aria-label="activity execution details"
    rowCount={activityExecutionInfo.executionTime ? 4 : 3}
  >
    <DetailListColumn>
      <DetailListLabel>{translate('common.start')}</DetailListLabel>
      <DetailListTimestampValue
        timestamp={activityExecutionInfo.scheduleTime}
      />
      {#if activityExecutionInfo.executionTime}
        <DetailListLabel
          >{translate('standalone-activities.execution-time')}</DetailListLabel
        >
        <DetailListTimestampValue
          timestamp={activityExecutionInfo.executionTime}
        />
      {/if}
      <DetailListLabel>{translate('common.end')}</DetailListLabel>
      <DetailListTimestampValue
        timestamp={activityExecutionInfo.closeTime}
        fallback="-"
      />
      <DetailListLabel
        >{translate('standalone-activities.duration')}</DetailListLabel
      >
      <DetailListTextValue
        text={activityExecutionInfo.executionDuration
          ? formatDurationAbbreviated(activityExecutionInfo.executionDuration)
          : '-'}
      />
    </DetailListColumn>
    <DetailListColumn>
      <DetailListLabel
        >{translate('standalone-activities.run-id')}</DetailListLabel
      >
      <DetailListTextValue copyable text={activityExecutionInfo.runId ?? ''} />
      {#if activityType}
        <DetailListLabel
          >{translate('standalone-activities.activity-type')}</DetailListLabel
        >
        <DetailListLinkValue
          copyable
          Icon={IconFilter}
          text={activityType ?? ''}
          href={activityTypeFilterLink}
        />
      {/if}
      <DetailListLabel
        >{translate('standalone-activities.task-queue')}</DetailListLabel
      >
      <DetailListLinkValue
        copyable
        Icon={IconFilter}
        text={activityExecutionInfo.taskQueue ?? ''}
        href={taskQueueFilterLink}
      />
    </DetailListColumn>
    <DetailListColumn>
      {#if $isCloud}
        <DetailListLabel
          >{translate('workflows.billable-actions')}</DetailListLabel
        >
        <DetailListTextValue text={String(billableActions)} />
      {:else}
        <DetailListLabel
          >{translate('workflows.state-transitions')}</DetailListLabel
        >
        <DetailListTextValue
          text={activityExecutionInfo.stateTransitionCount}
        />
      {/if}
      {#if activityExecutionInfo.sdkName && activityExecutionInfo.sdkVersion}
        <DetailListLabel>{translate('workflows.sdk')}</DetailListLabel>
        <DetailListValue>
          <SdkLogo
            sdk={formatSDKName(activityExecutionInfo.sdkName)}
            version={activityExecutionInfo.sdkVersion}
          />
        </DetailListValue>
      {/if}
    </DetailListColumn>
  </DetailList>
</div>
