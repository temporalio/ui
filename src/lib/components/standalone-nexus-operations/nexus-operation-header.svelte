<script lang="ts">
  import WorkflowStatus from '$lib/components/execution-status.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { NexusOperationExecutionInfo } from '$lib/types/nexus-operation-execution';
  import { formatDurationAbbreviated } from '$lib/utilities/format-time';
  import { toNexusOperationStatus } from '$lib/utilities/get-nexus-operation-status-and-count';
  import { routeForStandaloneNexusOperationsWithQuery } from '$lib/utilities/route-for';
  import type { StandaloneNexusOperationPoller } from '$lib/utilities/standalone-nexus-operation-poller.svelte';

  import {
    DetailList,
    DetailListColumn,
    DetailListLabel,
    DetailListLinkValue,
    DetailListTextValue,
    DetailListTimestampValue,
  } from '../detail-list';

  import NexusOperationActions from './nexus-operation-actions.svelte';

  interface Props {
    nexusOperationInfo: NexusOperationExecutionInfo;
    namespace: string;
    poller: StandaloneNexusOperationPoller;
  }

  let { nexusOperationInfo, namespace, poller }: Props = $props();

  const endpointFilterLink = $derived(
    routeForStandaloneNexusOperationsWithQuery(
      { namespace },
      `Endpoint="${nexusOperationInfo.endpoint}"`,
    ),
  );
</script>

<div class="space-y-2">
  <div class="flex items-center gap-4 max-xl:w-full max-xl:flex-wrap">
    <WorkflowStatus
      status={toNexusOperationStatus(nexusOperationInfo.status)}
    />
    <div class="text-2xl font-medium">
      <h1
        data-testid="nexus-operation-id-heading"
        class="gap-0 overflow-hidden max-sm:text-xl sm:max-md:text-2xl"
      >
        <Copyable
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          content={nexusOperationInfo.operationId ?? ''}
          clickAllToCopy
          container-class="w-full"
          class="overflow-hidden text-ellipsis text-left"
        />
      </h1>
    </div>
    <div class="ml-auto">
      <NexusOperationActions {nexusOperationInfo} {namespace} {poller} />
    </div>
  </div>
  <DetailList aria-label="nexus operation execution details" rowCount={4}>
    <DetailListColumn>
      <DetailListLabel
        >{translate(
          'standalone-nexus-operations.schedule-time',
        )}</DetailListLabel
      >
      <DetailListTimestampValue timestamp={nexusOperationInfo.scheduleTime} />
      <DetailListLabel
        >{translate('standalone-nexus-operations.close-time')}</DetailListLabel
      >
      <DetailListTimestampValue
        timestamp={nexusOperationInfo.closeTime}
        fallback="-"
      />
      <DetailListLabel
        >{translate(
          'standalone-nexus-operations.execution-duration',
        )}</DetailListLabel
      >
      <DetailListTextValue
        text={nexusOperationInfo.executionDuration
          ? formatDurationAbbreviated(nexusOperationInfo.executionDuration)
          : '-'}
      />
      <DetailListLabel
        >{translate(
          'standalone-nexus-operations.state-transitions',
        )}</DetailListLabel
      >
      <DetailListTextValue text={nexusOperationInfo.stateTransitionCount} />
    </DetailListColumn>
    <DetailListColumn>
      <DetailListLabel
        >{translate('standalone-nexus-operations.run-id')}</DetailListLabel
      >
      <DetailListTextValue copyable text={nexusOperationInfo.runId ?? ''} />
      <DetailListLabel
        >{translate('standalone-nexus-operations.endpoint')}</DetailListLabel
      >
      <DetailListLinkValue
        copyable
        iconName="filter"
        text={nexusOperationInfo.endpoint ?? ''}
        href={endpointFilterLink}
      />
      <DetailListLabel
        >{translate('standalone-nexus-operations.service')}</DetailListLabel
      >
      <DetailListTextValue text={nexusOperationInfo.service ?? ''} />
      <DetailListLabel
        >{translate('standalone-nexus-operations.operation')}</DetailListLabel
      >
      <DetailListTextValue text={nexusOperationInfo.operation ?? ''} />
    </DetailListColumn>
  </DetailList>
</div>
