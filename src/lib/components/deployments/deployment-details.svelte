<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import type { WorkerDeploymentResponse } from '$lib/types/deployments';
  // import { formatDate } from '$lib/utilities/format-date';
  // import { relativeTime, timeFormat } from '$lib/stores/time-format';

  import WorkflowDetail from '../lines-and-dots/workflow-detail.svelte';

  export let deployment: WorkerDeploymentResponse;
</script>

<div class="flex w-full flex-col gap-2 lg:flex-row lg:gap-8 xl:gap-16">
  <div class="flex w-full flex-col gap-2 lg:w-1/3 xl:w-1/5">
    <WorkflowDetail
      title={translate('deployments.current-version')}
      content={deployment?.workerDeploymentInfo.routingConfig.currentVersion}
      copyable
    />
    <WorkflowDetail
      title={translate('common.status')}
      content={deployment?.workerDeploymentInfo.routingConfig.rampingVersionPercentage.toString() +
        '%'}
    />
  </div>
  <div class="flex w-full flex-col gap-2 lg:w-1/3 xl:w-1/5">
    <WorkflowDetail title={translate('deployments.first-task')} content="-" />
    <WorkflowDetail title={translate('deployments.last-task')} content="-" />
  </div>
  <div class="flex w-full flex-col gap-2 lg:w-1/3 xl:w-1/5">
    <WorkflowDetail title={translate('deployments.first-poller')} content="-" />
    <WorkflowDetail title={translate('deployments.last-poller')} content="-" />
  </div>
</div>
