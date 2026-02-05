<script lang="ts">
  import { timestamp } from '$lib/components/timestamp.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { WorkerDeploymentVersionInfo } from '$lib/types/deployments';

  import WorkflowDetail from '../lines-and-dots/workflow-detail.svelte';

  export let version: WorkerDeploymentVersionInfo;
</script>

<div class="flex w-full flex-col gap-2 lg:flex-row lg:gap-8 xl:gap-16">
  <div class="flex w-full flex-col gap-2 lg:w-1/3 xl:w-1/4">
    <WorkflowDetail
      title={translate('common.status')}
      content={version.drainageInfo.status}
    />
    <WorkflowDetail
      title={translate('deployments.rollout-started')}
      content={$timestamp(version.createTime)}
    />
  </div>
  <div class="flex w-full flex-col gap-2 lg:w-1/3 xl:w-1/4">
    <WorkflowDetail title={translate('deployments.rollout-id')} content="-" />
    <WorkflowDetail title={translate('deployments.rollout-url')} content="-" />
  </div>
</div>
