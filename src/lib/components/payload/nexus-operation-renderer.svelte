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
  <PayloadCodeBlock value={descriptor.embeddedInput} {maxHeight} />
{:else}
  <PayloadCodeBlock value={payload} {maxHeight} />
{/if}
