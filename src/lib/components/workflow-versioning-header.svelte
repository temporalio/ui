<script lang="ts">
  import CompatibilityBadge from '$lib/holocene/compatibility-badge.svelte';
  import { translate } from '$lib/i18n/translate';
  import type {
    TaskQueueCompatibility,
    TaskQueueRules,
  } from '$lib/services/pollers-service';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import {
    getCurrentCompatibilityDefaultVersion,
    getCurrentWorkflowBuildId,
    getDefaultVersionForSetFromABuildId,
  } from '$lib/utilities/task-queue-compatibility';

  export let workflow: WorkflowExecution | null;
  export let rules: TaskQueueRules | undefined = undefined;
  export let compatibility: TaskQueueCompatibility | undefined = undefined;

  $: buildId = getCurrentWorkflowBuildId(workflow);
  $: overallDefaultVersion =
    getCurrentCompatibilityDefaultVersion(compatibility);
  $: defaultVersionForSet = getDefaultVersionForSetFromABuildId(
    compatibility,
    buildId,
  );
</script>

{#if rules}
  <p class="flex items-center gap-1">
    <span>{translate('workers.buildId')}</span><CompatibilityBadge
      active
      buildId={workflow?.mostRecentWorkerVersionStamp?.buildId}
    />
  </p>
{:else}
  <div class="flex flex-col items-center gap-2 md:flex-row md:gap-4">
    <p class="flex items-center gap-1">
      <span>{translate('workers.last-used-version')}</span><CompatibilityBadge
        defaultVersion={buildId === defaultVersionForSet ||
          buildId === overallDefaultVersion}
        active={buildId === overallDefaultVersion}
        {buildId}
      >
        <svelte:fragment slot="overall-default-worker">
          {#if buildId === overallDefaultVersion}{translate(
              'workers.overall',
            )}{/if}
        </svelte:fragment>
        <svelte:fragment slot="default-worker">
          {translate('workers.default')}
        </svelte:fragment>
      </CompatibilityBadge>
    </p>
    <p class="flex items-center gap-1">
      <span>{translate('workers.next-version')}</span><CompatibilityBadge
        defaultVersion={!!defaultVersionForSet}
        active={defaultVersionForSet === overallDefaultVersion}
        buildId={defaultVersionForSet}
      >
        <svelte:fragment slot="overall-default-worker">
          {#if defaultVersionForSet === overallDefaultVersion}{translate(
              'workers.overall',
            )}{/if}
        </svelte:fragment>
        <svelte:fragment slot="default-worker">
          {translate('workers.default')}
        </svelte:fragment>
      </CompatibilityBadge>
    </p>
  </div>
{/if}
