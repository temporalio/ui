<script lang="ts">
  import MetadataDecoder from '$lib/components/event/metadata-decoder.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  const { workflow } = $derived($workflowRun);
  const metadataGroups = $derived(
    groupEvents(
      $fullEventHistory,
      'ascending',
      workflow?.pendingActivities,
      workflow?.pendingNexusOperations,
    ).filter((group) => group.userMetadata?.summary),
  );
</script>

{#if !metadataGroups.length}
  <div class="px-6 text-secondary/70">
    <p class="text-sm italic">No events with metadata</p>
  </div>
{/if}
<div class="flex flex-col gap-2">
  {#each metadataGroups as group}
    <div
      class="flex items-center justify-between gap-4 border-b border-subtle px-3 pb-1 text-lg"
    >
      <div class="flex items-center gap-2">
        <p class="w-32 min-w-32 text-sm font-medium">{group.label}</p>
        <MetadataDecoder
          value={group.userMetadata.summary}
          fallback={translate('events.decode-failed')}
          let:decodedValue
        >
          <span class="text-sm">{decodedValue}</span>
        </MetadataDecoder>
      </div>
      <WorkflowStatus status={group.finalClassification} />
    </div>
  {/each}
</div>
