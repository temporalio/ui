<script lang="ts">
  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import type { NexusOperationDescriptor } from '$lib/utilities/nexus-operation-registry';

  interface Props {
    descriptor: NexusOperationDescriptor;
    maxHeight?: number;
  }

  let { descriptor, maxHeight }: Props = $props();
</script>

<div class="flex flex-col gap-2">
  {#if descriptor.embeddedInput != null || descriptor.workflowInput != null}
    {#if descriptor.embeddedInput != null}
      {#if descriptor.workflowInput != null}
        <p class="text-xs text-secondary/70">Signal Input</p>
      {/if}
      <PayloadCodeBlock value={descriptor.embeddedInput} {maxHeight} />
    {/if}
    {#if descriptor.workflowInput != null}
      <p class="text-xs text-secondary/70">Workflow Input</p>
      <PayloadCodeBlock value={descriptor.workflowInput} {maxHeight} />
    {/if}
  {:else}
    <PayloadCodeBlock value={null} {maxHeight} />
  {/if}
</div>
