<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import {
    decodeLambdaProviderDetails,
    decodeScalerDetails,
  } from '$lib/services/deployments-service';
  import type { ComputeConfig } from '$lib/types/deployments';

  let { computeConfig }: { computeConfig: ComputeConfig | undefined } =
    $props();

  const lambdaDetails = $derived(decodeLambdaProviderDetails(computeConfig));
  const scalerParams = $derived(decodeScalerDetails(computeConfig));
  const isCompute = $derived(!!lambdaDetails.lambdaArn);
</script>

{#if isCompute}
  <div class="surface-secondary flex flex-col gap-2 py-3 pl-6 text-xs">
    {#if lambdaDetails.lambdaArn}
      <div class="flex gap-1">
        <span class="font-medium text-secondary"
          >{translate('workers.lambda-arn-label')}</span
        >
        <code class="text-primary">{lambdaDetails.lambdaArn}</code>
      </div>
    {/if}
    {#if lambdaDetails.iamRoleArn}
      <div class="flex gap-1">
        <span class="font-medium text-secondary"
          >{translate('workers.iam-role-label')}</span
        >
        <code class="text-primary">{lambdaDetails.iamRoleArn}</code>
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
    {#if scalerParams.scaleUpCooloffMs !== undefined || scalerParams.scaleUpBacklogThreshold !== undefined || scalerParams.maxWorkerLifetimeMs !== undefined || scalerParams.scaleUpDispatchRateEpsilon !== undefined || scalerParams.metricsPollIntervalMs !== undefined}
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
        {#if scalerParams.scaleUpDispatchRateEpsilon !== undefined}
          <div class="flex gap-1">
            <span class="font-medium text-secondary"
              >{translate('deployments.dispatch-rate-epsilon')}</span
            >
            <span class="text-primary"
              >{scalerParams.scaleUpDispatchRateEpsilon}</span
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
