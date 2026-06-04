<script lang="ts">
  import { page } from '$app/state';

  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import Link from '$lib/holocene/link.svelte';
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

  const { namespace } = $derived(page.params);

  const workflowHref = $derived(
    descriptor?.workflowId
      ? `/namespaces/${namespace}/workflows/${encodeURIComponent(descriptor.workflowId)}`
      : null,
  );
</script>

{#if descriptor}
  <div class="flex flex-col gap-2">
    <div class="flex flex-col gap-0.5">
      <h4 class="text-xs font-medium text-secondary">{descriptor.label}</h4>
      {#if descriptor.signalName}
        <p class="text-xs text-secondary/70">Signal: {descriptor.signalName}</p>
      {/if}
      {#if workflowHref && descriptor.workflowId}
        <Link href={workflowHref} class="text-xs">{descriptor.workflowId}</Link>
      {/if}
    </div>
    <PayloadCodeBlock value={descriptor.embeddedInput} {maxHeight} />
  </div>
{:else}
  <PayloadCodeBlock value={payload} {maxHeight} />
{/if}
