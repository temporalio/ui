<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import type { WorkerDeploymentResponse } from '$lib/types/deployments';
  // import { formatDate } from '$lib/utilities/format-date';
  // import { relativeTime, timeFormat } from '$lib/stores/time-format';

  import WorkflowDetail from '../lines-and-dots/workflow-detail.svelte';

  export let deployment: WorkerDeploymentResponse;
</script>

<div class="flex w-full flex-col gap-2 xl:flex-row xl:gap-16">
  <div class="flex w-full flex-col gap-2 xl:w-1/3">
    <WorkflowDetail
      title={translate('deployments.current-build-id')}
      content={deployment?.workerDeploymentInfo.routingConfig.currentVersion}
      copyable
    />
    <WorkflowDetail
      title={translate('deployments.series-name')}
      content={deployment?.workerDeploymentInfo.name}
      copyable
    />
    <WorkflowDetail
      title={translate('common.status')}
      content={deployment?.workerDeploymentInfo.routingConfig.rampingVersionPercentage.toString() +
        '%'}
      copyable
    />
  </div>
  <div class="flex w-full flex-col gap-2 xl:w-1/3"></div>
  <div class="flex w-full flex-col gap-2 xl:w-1/3"></div>
</div>
