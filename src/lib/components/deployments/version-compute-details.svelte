<script lang="ts">
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    decodeGcpCloudRunProviderDetails,
    decodeLambdaProviderDetails,
    decodeScalerDetails,
  } from '$lib/services/deployments-service';
  import type { ComputeConfig } from '$lib/types/deployments';

  let { computeConfig }: { computeConfig: ComputeConfig | undefined } =
    $props();

  const lambdaDetails = $derived(decodeLambdaProviderDetails(computeConfig));
  const gcpDetails = $derived(decodeGcpCloudRunProviderDetails(computeConfig));
  const scalerParams = $derived(decodeScalerDetails(computeConfig));
  const isCompute = $derived(
    !!lambdaDetails.lambdaArn || !!gcpDetails.gcpWorkerPool,
  );
  const hasScalerParams = $derived(
    scalerParams.scaleUpCooloffMs !== undefined ||
      scalerParams.scaleUpBacklogThreshold !== undefined ||
      scalerParams.maxWorkerLifetimeMs !== undefined ||
      scalerParams.metricsPollIntervalMs !== undefined,
  );
</script>

{#if isCompute}
  <div class="surface-secondary flex flex-col gap-2 py-3 pl-6 text-xs">
    {#if lambdaDetails.lambdaArn}
      <div class="flex items-center gap-1">
        <span class="font-medium text-secondary"
          >{translate('workers.lambda-arn-label')}</span
        >
        <Copyable
          content={lambdaDetails.lambdaArn}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        >
          <code class="text-primary">{lambdaDetails.lambdaArn}</code>
        </Copyable>
      </div>
    {/if}
    {#if lambdaDetails.iamRoleArn}
      <div class="flex items-center gap-1">
        <span class="font-medium text-secondary"
          >{translate('workers.iam-role-label')}</span
        >
        <Copyable
          content={lambdaDetails.iamRoleArn}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        >
          <code class="text-primary">{lambdaDetails.iamRoleArn}</code>
        </Copyable>
      </div>
    {/if}
    {#if lambdaDetails.roleExternalId}
      <div class="flex gap-1">
        <span class="font-medium text-secondary"
          >{translate('deployments.role-external-id')}</span
        >
        <code class="text-primary">{lambdaDetails.roleExternalId}</code>
      </div>
    {/if}
    {#if gcpDetails.gcpWorkerPool}
      <div class="flex items-center gap-1">
        <span class="font-medium text-secondary"
          >{translate('workers.gcp-worker-pool-label')}</span
        >
        <Copyable
          content={gcpDetails.gcpWorkerPool}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        >
          <code class="text-primary">{gcpDetails.gcpWorkerPool}</code>
        </Copyable>
      </div>
    {/if}
    {#if gcpDetails.gcpProject}
      <div class="flex gap-1">
        <span class="font-medium text-secondary"
          >{translate('workers.gcp-project-label')}</span
        >
        <code class="text-primary">{gcpDetails.gcpProject}</code>
      </div>
    {/if}
    {#if gcpDetails.gcpRegion}
      <div class="flex gap-1">
        <span class="font-medium text-secondary"
          >{translate('workers.gcp-region-label')}</span
        >
        <code class="text-primary">{gcpDetails.gcpRegion}</code>
      </div>
    {/if}
    {#if gcpDetails.gcpServiceAccount}
      <div class="flex items-center gap-1">
        <span class="font-medium text-secondary"
          >{translate('workers.gcp-service-account-label')}</span
        >
        <Copyable
          content={gcpDetails.gcpServiceAccount}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        >
          <code class="text-primary">{gcpDetails.gcpServiceAccount}</code>
        </Copyable>
      </div>
    {/if}
    {#if hasScalerParams}
      <div class="flex gap-3">
        {#if scalerParams.scaleUpCooloffMs !== undefined}
          <div class="flex gap-1">
            <span class="font-medium text-secondary"
              >{translate('deployments.scale-up-cooloff')}</span
            >
            <span class="text-primary">{scalerParams.scaleUpCooloffMs}ms</span>
          </div>
        {/if}
        {#if scalerParams.scaleUpBacklogThreshold !== undefined}
          <div class="flex gap-1">
            <span class="font-medium text-secondary"
              >{translate('deployments.backlog-threshold')}</span
            >
            <span class="text-primary"
              >{scalerParams.scaleUpBacklogThreshold}</span
            >
          </div>
        {/if}
        {#if scalerParams.maxWorkerLifetimeMs !== undefined}
          <div class="flex gap-1">
            <span class="font-medium text-secondary"
              >{translate('deployments.max-worker-lifetime')}</span
            >
            <span class="text-primary"
              >{scalerParams.maxWorkerLifetimeMs}ms</span
            >
          </div>
        {/if}
        {#if scalerParams.metricsPollIntervalMs !== undefined}
          <div class="flex gap-1">
            <span class="font-medium text-secondary"
              >{translate('deployments.metrics-poll-interval')}</span
            >
            <span class="text-primary"
              >{scalerParams.metricsPollIntervalMs}ms</span
            >
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}
