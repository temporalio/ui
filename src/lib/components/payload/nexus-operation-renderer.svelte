<script lang="ts">
  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import type { Payload } from '$lib/types';
  import {
    describeNexusOperation,
    type NexusOperationDescriptor,
  } from '$lib/utilities/nexus-operation-registry';

  interface Props {
    payload: Payload;
    maxHeight?: number;
  }

  let { payload, maxHeight }: Props = $props();

  const descriptor: NexusOperationDescriptor | null = $derived(
    describeNexusOperation(payload),
  );
</script>

{#if descriptor}
  <div class="flex flex-col gap-2">
    <!-- TODO: Future - add clickable workflowId link when descriptor.workflowId is populated -->
    <!-- TODO: Future - render descriptor.signalName as sub-line for signal-with-start-workflow kind -->
    <h4 class="text-xs font-medium text-secondary">{descriptor.label}</h4>
    <PayloadCodeBlock value={descriptor.embeddedInput} {maxHeight} />
  </div>
{:else}
  <PayloadCodeBlock value={payload} {maxHeight} />
{/if}
