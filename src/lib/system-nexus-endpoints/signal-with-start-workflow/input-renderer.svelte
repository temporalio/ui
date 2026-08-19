<script lang="ts">
  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import type { Payload } from '$lib/types';
  import { decodeBinaryProtobuf } from '$lib/utilities/decode-binary-protobuf';

  import type { SystemNexusInputRendererProps } from '../types';
  import { requestSchema } from './schemas';

  let { payload, maxHeight }: SystemNexusInputRendererProps = $props();

  const decoded = $derived(
    decodeBinaryProtobuf(payload, requestSchema)?.data as
      | Record<string, unknown>
      | undefined,
  );

  const payloadsFrom = (value: unknown): Payload[] | null => {
    if (!value || typeof value !== 'object') return null;
    const payloads = (value as Record<string, unknown>).payloads;
    return Array.isArray(payloads) ? (payloads as Payload[]) : null;
  };

  const signalInput = $derived(payloadsFrom(decoded?.signalInput));
  const workflowInput = $derived(payloadsFrom(decoded?.input));
</script>

<div class="flex flex-col gap-2">
  {#if signalInput || workflowInput}
    {#if signalInput}
      {#if workflowInput}
        <p class="text-xs text-secondary/70">Signal Input</p>
      {/if}
      <PayloadCodeBlock value={signalInput} {maxHeight} />
    {/if}
    {#if workflowInput}
      <p class="text-xs text-secondary/70">Workflow Input</p>
      <PayloadCodeBlock value={workflowInput} {maxHeight} />
    {/if}
  {:else}
    <PayloadCodeBlock value={payload} {maxHeight} />
  {/if}
</div>
