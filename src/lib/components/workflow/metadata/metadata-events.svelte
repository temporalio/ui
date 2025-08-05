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

<div class="overflow-x-auto border border-subtle px-6">
  <h3 class="pt-6" data-testid="user-metadata-details-heading">
    Events with Metadata
  </h3>
  {#if !metadataGroups.length}
    <div class="text-secondary/70">
      <p class="text-sm italic">No events with metadata</p>
    </div>
  {/if}
  <div class="py-4">
    {#each metadataGroups as group}
      <div class="flex items-center gap-4 text-lg">
        <WorkflowStatus status={group.finalClassification} />
        <div class="text-sm font-medium">{group.label}</div>
        <MetadataDecoder
          value={group.userMetadata.summary}
          fallback={translate('events.decode-failed')}
          let:decodedValue
        >
          <span class="text-sm font-medium">{decodedValue}</span>
        </MetadataDecoder>
      </div>
    {/each}
  </div>
</div>
